'use client';

import { useState, useEffect } from 'react';
import {
  DIAS, Dia, MENU_DEFAULT,
  cargarMenu, guardarMenu, getDiaHoy, getFechaDelDia,
  cargarDetalles, guardarDetalles,
  cargarRatings, guardarRating,
} from '@/lib/menu';
import { getUsuario, type Usuario } from '@/lib/usuario';
import DayCard from '@/components/DayCard';
import EditModal from '@/components/EditModal';
import DetalleModal from '@/components/DetalleModal';
import UserSelect from '@/components/UserSelect';

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!;

function urlBase64ToUint8Array(base64String: string): Uint8Array<ArrayBuffer> {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  const output = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; i++) output[i] = rawData.charCodeAt(i);
  return output;
}

async function suscribirANotificaciones() {
  if (!('Notification' in window) || !('serviceWorker' in navigator)) return;
  const permiso = await Notification.requestPermission();
  if (permiso !== 'granted') return;
  const reg = await navigator.serviceWorker.ready;
  const sub = await reg.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
  });
  await fetch('/api/subscribe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(sub.toJSON()),
  });
}

async function enviarNotificacion(title: string, body: string) {
  await fetch('/api/notify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, body }),
  });
}

async function fetchEstadoServidor(): Promise<Record<string, boolean>> {
  try {
    const res = await fetch('/api/estado');
    if (!res.ok) return {};
    const data = await res.json();
    return data.noCena ?? {};
  } catch {
    return {};
  }
}

async function fetchMenuServidor(): Promise<{ menu: Record<Dia, string>; detalles: Record<Dia, string> } | null> {
  try {
    const res = await fetch('/api/menu');
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export default function Page() {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [cargado, setCargado] = useState(false);

  const [menu, setMenu] = useState<Record<Dia, string>>(MENU_DEFAULT);
  const [detalles, setDetalles] = useState<Record<Dia, string>>({} as Record<Dia, string>);
  const [ratings, setRatings] = useState<Partial<Record<Dia, number>>>({});
  const [noCena, setNoCena] = useState<Partial<Record<Dia, boolean>>>({});

  const [modoEdicion, setModoEdicion] = useState(false);
  const [editando, setEditando] = useState<Dia | null>(null);
  const [vientoDetalle, setViendoDetalle] = useState<Dia | null>(null);
  const [diaHoy, setDiaHoy] = useState<Dia | null>(null);
  const [notifPermiso, setNotifPermiso] = useState<NotificationPermission | null>(null);

  useEffect(() => {
    setUsuario(getUsuario());
    setMenu(cargarMenu());
    setDetalles(cargarDetalles());
    setRatings(cargarRatings());
    const hoy = getDiaHoy();
    setDiaHoy(hoy);
    if ('Notification' in window) setNotifPermiso(Notification.permission);

    // Cargar estado y menú desde el servidor (fuente de verdad compartida)
    fetchEstadoServidor().then((nc) => setNoCena(nc));
    fetchMenuServidor().then((data) => {
      if (data) {
        setMenu(data.menu);
        setDetalles(data.detalles);
        guardarMenu(data.menu);
        guardarDetalles(data.detalles);
      }
    });
    setCargado(true);

    setTimeout(() => {
      const el = document.querySelector(`[data-day="${hoy}"]`);
      el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 200);

    // Refrescar cada 30 s (para que Mamá vea cambios sin recargar)
    const refrescarServidor = () => {
      fetchEstadoServidor().then((nc) => setNoCena(nc));
      fetchMenuServidor().then((data) => {
        if (data) { setMenu(data.menu); setDetalles(data.detalles); }
      });
    };
    const intervalo = setInterval(refrescarServidor, 30_000);

    // Refrescar al volver a la pestaña (focus) o al salir de background (visibilitychange)
    const onFocus = () => refrescarServidor();
    const onVisibility = () => { if (!document.hidden) refrescarServidor(); };
    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      clearInterval(intervalo);
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  const handleUserSelect = (u: Usuario) => setUsuario(u);

  const handleSuscribir = async () => {
    await suscribirANotificaciones();
    setNotifPermiso(Notification.permission);
  };

  const handleGuardar = async (dia: Dia, nuevoPlato: string, nuevoDetalle: string) => {
    const nuevoMenu = { ...menu, [dia]: nuevoPlato };
    setMenu(nuevoMenu);
    guardarMenu(nuevoMenu);
    const nuevosDetalles = { ...detalles, [dia]: nuevoDetalle };
    setDetalles(nuevosDetalles);
    guardarDetalles(nuevosDetalles);
    setEditando(null);
    await Promise.all([
      fetch('/api/menu', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ menu: nuevoMenu, detalles: nuevosDetalles }),
      }),
      enviarNotificacion('🍽️ Menú actualizado', `${dia}: ${nuevoPlato}`),
    ]);
  };

  const handleRating = (dia: Dia, nota: number | undefined) => {
    const nuevas = { ...ratings };
    if (nota === undefined) delete nuevas[dia]; else nuevas[dia] = nota;
    setRatings(nuevas);
    guardarRating(dia, nota);
  };

  const handleToggleNoCena = async (dia: Dia) => {
    const nuevo = !noCena[dia];
    // Actualizar UI de forma optimista
    setNoCena({ ...noCena, [dia]: nuevo });
    // Persistir en el servidor (compartido entre navegadores)
    await fetch('/api/estado', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dia, valor: nuevo }),
    });
    if (nuevo) {
      await enviarNotificacion('🏠 No cenas en casa', `${dia}: Dani no estará en casa`);
    }
  };

  const handleTestNotificacion = async () => {
    await enviarNotificacion('🔔 Test de notificación', 'Las notificaciones funcionan correctamente ✅');
  };

  // Pantalla de selección de usuario
  if (cargado && !usuario) {
    return <UserSelect onSelect={handleUserSelect} />;
  }

  return (
    <main className="min-h-screen bg-green-50">
      <header className="bg-white shadow-sm sticky top-0 z-10 px-4 py-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">🍽️ Menú semanal</h1>
        <div className="flex items-center gap-2">
          {cargado && usuario && (
            <span className="text-sm text-gray-400">
              {usuario === 'mama' ? '👩' : '👨'}
            </span>
          )}
          {usuario === 'dani' && modoEdicion && (
            <button
              onClick={handleTestNotificacion}
              title="Enviar notificación de prueba"
              className="p-2 rounded-xl text-xl text-gray-400 hover:text-blue-500 hover:bg-blue-50 transition-colors"
            >
              🔔
            </button>
          )}
          {usuario === 'dani' && (
            <button
              onClick={() => setModoEdicion((v) => !v)}
              title={modoEdicion ? 'Salir de edición' : 'Editar menús'}
              className={`p-2 rounded-xl transition-colors text-xl ${
                modoEdicion ? 'bg-green-100 text-green-600' : 'text-gray-300 hover:text-gray-500 hover:bg-gray-100'
              }`}
            >
              {modoEdicion ? '✅' : '⚙️'}
            </button>
          )}
        </div>
      </header>

      {cargado && notifPermiso === 'default' && (
        <div className="max-w-lg mx-auto px-4 pt-4">
          <button
            onClick={handleSuscribir}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-4 rounded-xl text-base flex items-center justify-center gap-2 transition-colors"
          >
            🔔 Activar notificaciones
          </button>
        </div>
      )}

      <div className="max-w-lg mx-auto px-4 py-4 flex flex-col gap-4">
        {DIAS.map((dia) => (
          <DayCard
            key={dia}
            dia={dia}
            fecha={getFechaDelDia(dia)}
            plato={menu[dia]}
            esHoy={dia === diaHoy}
            modoEdicion={modoEdicion}
            onEditar={() => setEditando(dia)}
            rating={ratings[dia]}
            onRating={(nota) => handleRating(dia, nota)}
            noCena={!!noCena[dia]}
            onToggleNoCena={() => handleToggleNoCena(dia)}
            onVerDetalle={() => setViendoDetalle(dia)}
            usuario={usuario ?? 'mama'}
          />
        ))}
      </div>

      {editando && (
        <EditModal
          dia={editando}
          platoActual={menu[editando]}
          detalleActual={detalles[editando] ?? ''}
          onGuardar={(plato, detalle) => handleGuardar(editando, plato, detalle)}
          onCancelar={() => setEditando(null)}
        />
      )}

      {vientoDetalle && (
        <DetalleModal
          dia={vientoDetalle}
          plato={menu[vientoDetalle]}
          detalle={detalles[vientoDetalle] ?? ''}
          onCerrar={() => setViendoDetalle(null)}
        />
      )}
    </main>
  );
}

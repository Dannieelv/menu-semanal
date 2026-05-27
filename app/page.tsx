'use client';

import { useState, useEffect } from 'react';
import {
  DIAS, Dia, MENU_DEFAULT,
  getDiaHoy, getFechaDelDia,
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

function getRatingIcon(n: number): string {
  if (n <= 2) return '🤢';
  if (n <= 4) return '😕';
  if (n <= 6) return '😐';
  if (n <= 8) return '😋';
  return '🤩';
}

// ─── Helpers de fetch ────────────────────────────────────────────────────────

async function fetchMenu(): Promise<{ menu: Record<string, string>; detalles: Record<string, string> }> {
  try {
    const res = await fetch('/api/menu');
    if (!res.ok) return { menu: { ...MENU_DEFAULT }, detalles: {} };
    return await res.json();
  } catch {
    return { menu: { ...MENU_DEFAULT }, detalles: {} };
  }
}

async function fetchEstado(): Promise<{ noCena: Record<string, boolean>; ratings: Record<string, number> }> {
  try {
    const res = await fetch('/api/estado');
    if (!res.ok) return { noCena: {}, ratings: {} };
    const data = await res.json();
    return { noCena: data.noCena ?? {}, ratings: data.ratings ?? {} };
  } catch {
    return { noCena: {}, ratings: {} };
  }
}

// ─── Componente principal ─────────────────────────────────────────────────────

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
    const hoy = getDiaHoy();
    setDiaHoy(hoy);
    if ('Notification' in window) setNotifPermiso(Notification.permission);

    // Cargar todo desde el servidor
    Promise.all([fetchMenu(), fetchEstado()]).then(([menuData, estadoData]) => {
      setMenu(menuData.menu as Record<Dia, string>);
      setDetalles(menuData.detalles as Record<Dia, string>);
      setNoCena(estadoData.noCena);
      setRatings(estadoData.ratings as Partial<Record<Dia, number>>);
      setCargado(true);
      setTimeout(() => {
        const el = document.querySelector(`[data-day="${hoy}"]`);
        el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 200);
    });

    // Refrescar todo cada 30 s para que Mamá vea cambios en tiempo real
    const refrescar = () => {
      Promise.all([fetchMenu(), fetchEstado()]).then(([menuData, estadoData]) => {
        setMenu(menuData.menu as Record<Dia, string>);
        setDetalles(menuData.detalles as Record<Dia, string>);
        setNoCena(estadoData.noCena);
        setRatings(estadoData.ratings as Partial<Record<Dia, number>>);
      });
    };

    const intervalo = setInterval(refrescar, 30_000);
    const onFocus = () => refrescar();
    window.addEventListener('focus', onFocus);

    return () => {
      clearInterval(intervalo);
      window.removeEventListener('focus', onFocus);
    };
  }, []);

  const handleUserSelect = (u: Usuario) => setUsuario(u);

  const handleSuscribir = async () => {
    await suscribirANotificaciones();
    setNotifPermiso(Notification.permission);
  };

  const handleGuardar = async (dia: Dia, nuevoPlato: string, nuevoDetalle: string) => {
    // Actualizar UI de forma optimista
    setMenu((m) => ({ ...m, [dia]: nuevoPlato }));
    setDetalles((d) => ({ ...d, [dia]: nuevoDetalle }));
    setEditando(null);
    // Persistir en el servidor
    await fetch('/api/menu', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dia, plato: nuevoPlato, detalle: nuevoDetalle }),
    });
    await enviarNotificacion('🍽️ Menú actualizado', `${dia}: ${nuevoPlato}`);
  };

  const handleRating = async (dia: Dia, nota: number | undefined) => {
    // Actualizar UI de forma optimista
    setRatings((r) => {
      const nuevas = { ...r };
      if (nota === undefined) delete nuevas[dia]; else nuevas[dia] = nota;
      return nuevas;
    });
    // Persistir en el servidor
    await fetch('/api/estado', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ campo: 'rating', dia, valor: nota ?? null }),
    });
    if (nota !== undefined) {
      await enviarNotificacion(
        `${getRatingIcon(nota)} Puntuación del ${dia}`,
        `${nota}/10 — ${menu[dia]}`
      );
    }
  };

  const handleToggleNoCena = async (dia: Dia) => {
    const nuevo = !noCena[dia];
    setNoCena((s) => ({ ...s, [dia]: nuevo }));
    await fetch('/api/estado', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ campo: 'noCena', dia, valor: nuevo }),
    });
    await enviarNotificacion(
      nuevo ? '🏠 No cenas en casa' : '✅ ¡Vuelves a comer en casa!',
      nuevo ? `${dia}: Dani no estará en casa` : `${dia}: Dani sí estará en casa`
    );
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

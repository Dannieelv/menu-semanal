'use client';

import { useState, useEffect } from 'react';
import {
  DIAS, Dia,
  cargarMenu, guardarMenu, getDiaHoy,
  cargarRatings, guardarRating,
  cargarNoCena, guardarNoCena,
} from '@/lib/menu';
import DayCard from '@/components/DayCard';
import EditModal from '@/components/EditModal';

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!;

function urlBase64ToUint8Array(base64String: string): Uint8Array<ArrayBuffer> {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  const output = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; i++) {
    output[i] = rawData.charCodeAt(i);
  }
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

export default function Page() {
  const [menu, setMenu] = useState<Record<Dia, string> | null>(null);
  const [ratings, setRatings] = useState<Partial<Record<Dia, number>>>({});
  const [noCena, setNoCena] = useState<Partial<Record<Dia, boolean>>>({});
  const [modoEdicion, setModoEdicion] = useState(false);
  const [editando, setEditando] = useState<Dia | null>(null);
  const [diaHoy, setDiaHoy] = useState<Dia | null>(null);
  const [notifPermiso, setNotifPermiso] = useState<NotificationPermission | null>(null);

  useEffect(() => {
    setMenu(cargarMenu());
    setRatings(cargarRatings());
    setNoCena(cargarNoCena());
    setDiaHoy(getDiaHoy());
    if ('Notification' in window) setNotifPermiso(Notification.permission);
  }, []);

  const handleSuscribir = async () => {
    await suscribirANotificaciones();
    setNotifPermiso(Notification.permission);
  };

  const handleGuardar = async (dia: Dia, nuevoPlato: string) => {
    if (!menu) return;
    const nuevoMenu = { ...menu, [dia]: nuevoPlato };
    setMenu(nuevoMenu);
    guardarMenu(nuevoMenu);
    setEditando(null);
    await enviarNotificacion('🍽️ Menú actualizado', `${dia}: ${nuevoPlato}`);
  };

  const handleRating = (dia: Dia, nota: number | undefined) => {
    const nuevas = { ...ratings, [dia]: nota };
    if (nota === undefined) delete nuevas[dia];
    setRatings(nuevas);
    guardarRating(dia, nota);
  };

  const handleToggleNoCena = async (dia: Dia) => {
    const nuevo = !noCena[dia];
    const nuevoNoCena = { ...noCena, [dia]: nuevo };
    setNoCena(nuevoNoCena);
    guardarNoCena(dia, nuevo);
    if (nuevo) {
      await enviarNotificacion('🏠 No cenas en casa', `${dia}: no estarás en casa a la hora de comer`);
    } else {
      await enviarNotificacion('✅ ¡Vuelves a comer en casa!', `${dia}: sí estarás en casa`);
    }
  };

  if (!menu) {
    return (
      <main className="min-h-screen bg-green-50 flex items-center justify-center">
        <p className="text-2xl text-gray-500">Cargando...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-green-50">
      <header className="bg-white shadow-sm sticky top-0 z-10 px-4 py-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">🍽️ Menú semanal</h1>
        <button
          onClick={() => setModoEdicion((v) => !v)}
          className={`
            font-semibold px-4 py-2 rounded-xl text-base transition-colors
            ${modoEdicion
              ? 'bg-green-500 hover:bg-green-600 text-white'
              : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
            }
          `}
        >
          {modoEdicion ? '✅ Listo' : '✏️ Editar'}
        </button>
      </header>

      {notifPermiso === 'default' && (
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
            plato={menu[dia]}
            esHoy={dia === diaHoy}
            modoEdicion={modoEdicion}
            onEditar={() => setEditando(dia)}
            rating={ratings[dia]}
            onRating={(nota) => handleRating(dia, nota)}
            noCena={!!noCena[dia]}
            onToggleNoCena={() => handleToggleNoCena(dia)}
          />
        ))}
      </div>

      {editando && (
        <EditModal
          dia={editando}
          platoActual={menu[editando]}
          onGuardar={(plato) => handleGuardar(editando, plato)}
          onCancelar={() => setEditando(null)}
        />
      )}
    </main>
  );
}

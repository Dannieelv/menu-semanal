'use client';

import { useState, useEffect } from 'react';
import { DIAS, Dia, cargarMenu, guardarMenu, getDiaHoy } from '@/lib/menu';
import DayCard from '@/components/DayCard';
import EditModal from '@/components/EditModal';

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!;

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)));
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

export default function Page() {
  const [menu, setMenu] = useState<Record<Dia, string> | null>(null);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [editando, setEditando] = useState<Dia | null>(null);
  const [diaHoy, setDiaHoy] = useState<Dia | null>(null);
  const [notifPermiso, setNotifPermiso] = useState<NotificationPermission | null>(null);

  useEffect(() => {
    setMenu(cargarMenu());
    setDiaHoy(getDiaHoy());
    if ('Notification' in window) {
      setNotifPermiso(Notification.permission);
    }
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
    await fetch('/api/notify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dia, plato: nuevoPlato }),
    });
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

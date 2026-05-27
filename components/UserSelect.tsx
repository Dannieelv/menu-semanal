'use client';

import { setUsuario, Usuario } from '@/lib/usuario';

type Props = {
  onSelect: (u: Usuario) => void;
};

export default function UserSelect({ onSelect }: Props) {
  const handle = (u: Usuario) => {
    setUsuario(u);
    onSelect(u);
  };

  return (
    <div className="min-h-screen bg-green-50 flex flex-col items-center justify-center px-6 gap-8">
      <div className="text-center flex flex-col items-center">
        <img src="/logo.png" alt="MamApp" className="h-28 w-28 object-contain mb-2" />
        <h1 className="text-3xl font-bold text-gray-800">MamApp</h1>
        <p className="text-lg text-gray-500 mt-2">¿Quién eres?</p>
      </div>

      <div className="flex flex-col gap-4 w-full max-w-xs">
        <button
          onClick={() => handle('mama')}
          className="bg-white border-2 border-green-400 hover:bg-green-50 active:bg-green-100 text-gray-800 font-bold py-5 rounded-2xl text-2xl shadow-md transition-colors"
        >
          👩 Mamá
        </button>
        <button
          onClick={() => handle('dani')}
          className="bg-white border-2 border-blue-400 hover:bg-blue-50 active:bg-blue-100 text-gray-800 font-bold py-5 rounded-2xl text-2xl shadow-md transition-colors"
        >
          👨 Dani
        </button>
      </div>
    </div>
  );
}

'use client';

import { useState, useEffect, useRef } from 'react';

type Props = {
  dia: string;
  platoActual: string;
  onGuardar: (nuevoPlato: string) => void;
  onCancelar: () => void;
};

export default function EditModal({ dia, platoActual, onGuardar, onCancelar }: Props) {
  const [valor, setValor] = useState(platoActual);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={(e) => e.target === e.currentTarget && onCancelar()}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 flex flex-col gap-4">
        <h2 className="text-2xl font-bold text-gray-800">
          Menú del {dia}
        </h2>
        <textarea
          ref={textareaRef}
          value={valor}
          onChange={(e) => setValor(e.target.value)}
          rows={4}
          placeholder="Escribe el menú del día..."
          className="border-2 border-gray-300 focus:border-green-500 rounded-xl p-3 text-lg text-gray-800 resize-none outline-none transition-colors"
        />
        <div className="flex gap-3">
          <button
            onClick={() => onGuardar(valor.trim())}
            className="flex-1 bg-green-500 hover:bg-green-600 active:bg-green-700 text-white font-bold py-3 rounded-xl text-lg transition-colors"
          >
            Guardar
          </button>
          <button
            onClick={onCancelar}
            className="flex-1 bg-gray-200 hover:bg-gray-300 active:bg-gray-400 text-gray-700 font-bold py-3 rounded-xl text-lg transition-colors"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useState } from 'react';

type Props = {
  dia: string;
  plato: string;
  detalle: string;
  onCerrar: () => void;
};

export default function DetalleModal({ dia, plato, detalle, onCerrar }: Props) {
  const [copiado, setCopiado] = useState(false);

  const handleCopiar = async () => {
    await navigator.clipboard.writeText(detalle);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={(e) => e.target === e.currentTarget && onCerrar()}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 flex flex-col gap-4">
        <div>
          <p className="text-sm font-medium text-gray-400 uppercase tracking-wide">{dia}</p>
          <h2 className="text-xl font-bold text-gray-800 leading-snug mt-1">{plato}</h2>
        </div>

        <div className="bg-green-50 rounded-xl p-4">
          <p className="text-sm font-semibold text-green-700 mb-3 uppercase tracking-wide">
            🥦 Ingredientes
          </p>
          <div className="flex flex-col gap-2">
            {detalle.split('\n').filter(Boolean).map((linea, i) => (
              <p key={i} className="text-base text-gray-700 leading-snug">
                {linea}
              </p>
            ))}
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleCopiar}
            className={`flex-1 font-bold py-3 rounded-xl text-lg transition-colors ${
              copiado
                ? 'bg-green-500 text-white'
                : 'bg-blue-50 hover:bg-blue-100 text-blue-700'
            }`}
          >
            {copiado ? '✅ Copiado' : '📋 Copiar'}
          </button>
          <button
            onClick={onCerrar}
            className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3 rounded-xl text-lg transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}

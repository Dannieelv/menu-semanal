'use client';

import { type Usuario } from '@/lib/usuario';

type Props = {
  dia: string;
  fecha: string;
  plato: string;
  esHoy: boolean;
  modoEdicion: boolean;
  onEditar: () => void;
  rating: number | undefined;
  onRating: (nota: number | undefined) => void;
  noCena: boolean;
  onToggleNoCena: () => void;
  onVerDetalle: () => void;
  usuario: Usuario;
};

const NOTAS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

function getRatingIcon(n: number): string {
  if (n <= 2) return '🤢';
  if (n <= 4) return '😕';
  if (n <= 6) return '😐';
  if (n <= 8) return '😋';
  return '🤩';
}

export default function DayCard({
  dia, fecha, plato, esHoy, modoEdicion, onEditar,
  rating, onRating, noCena, onToggleNoCena, onVerDetalle, usuario,
}: Props) {
  return (
    <div
      data-day={dia}
      className={`
        scroll-mt-20 rounded-2xl p-5 shadow-md flex flex-col gap-4 transition-all
        ${esHoy ? 'bg-green-50 border-2 border-green-500' : 'bg-white border-2 border-transparent'}
      `}
    >
      {/* Cabecera */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <p className="text-2xl font-bold text-gray-800">{dia}</p>
            {rating !== undefined && (
              <span className="bg-yellow-400 text-white text-sm font-bold px-2.5 py-0.5 rounded-full">
                {getRatingIcon(rating)} {rating}
              </span>
            )}
          </div>
          <p className="text-base text-gray-400">{fecha}</p>
        </div>
        <div className="flex items-center gap-2 pt-1">
          {esHoy && (
            <span className="bg-green-500 text-white text-sm font-semibold px-3 py-1 rounded-full">
              HOY
            </span>
          )}
          {noCena && (
            <span className="bg-orange-400 text-white text-sm font-semibold px-3 py-1 rounded-full">
              🏠 Sin cena
            </span>
          )}
        </div>
      </div>

      {/* Plato */}
      <p className="text-2xl font-medium text-gray-800 leading-snug min-h-[2rem]">
        {plato || <span className="italic text-gray-400 text-xl">Sin menú</span>}
      </p>

      {/* Puntuación — solo en modo edición */}
      {modoEdicion && (
        <div className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-gray-500">
            {rating !== undefined ? `${getRatingIcon(rating)} Puntuación: ${rating}/10` : 'Puntúa el plato'}
          </span>
          <div className="grid grid-cols-5 gap-1">
            {NOTAS.map((n) => (
              <button
                key={n}
                onClick={() => onRating(rating === n ? undefined : n)}
                className={`
                  py-2 rounded-lg text-sm font-bold transition-colors
                  ${rating === n
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}
                `}
              >
                {n}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Botones */}
      <div className="flex flex-col gap-2">
        {/* Ver ingredientes — visible para todos */}
        <button
          onClick={onVerDetalle}
          className="w-full py-3 rounded-xl text-base font-semibold bg-blue-50 hover:bg-blue-100 text-blue-700 transition-colors"
        >
          🥦 Ver ingredientes
        </button>

        {/* Ceno en casa — solo para Dani */}
        {usuario === 'dani' && (
          <button
            onClick={onToggleNoCena}
            className={`
              w-full py-3 rounded-xl text-base font-semibold transition-colors
              ${noCena
                ? 'bg-orange-400 hover:bg-orange-500 text-white'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-600'}
            `}
          >
            {noCena ? '🏠 No ceno en casa' : '🏠 Ceno en casa'}
          </button>
        )}

        {/* Cambiar menú — solo en modo edición */}
        {modoEdicion && (
          <button
            onClick={onEditar}
            aria-label={`Editar menú del ${dia}`}
            className="w-full bg-amber-400 hover:bg-amber-500 text-white font-semibold py-3 rounded-xl text-sm transition-colors"
          >
            ✏️ Cambiar menú
          </button>
        )}
      </div>
    </div>
  );
}

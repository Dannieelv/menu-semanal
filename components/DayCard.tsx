'use client';

type Props = {
  dia: string;
  plato: string;
  esHoy: boolean;
  modoEdicion: boolean;
  onEditar: () => void;
  rating: number | undefined;
  onRating: (nota: number | undefined) => void;
  noCena: boolean;
  onToggleNoCena: () => void;
};

const NOTAS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

export default function DayCard({
  dia, plato, esHoy, modoEdicion, onEditar,
  rating, onRating, noCena, onToggleNoCena,
}: Props) {
  return (
    <div
      className={`
        rounded-2xl p-5 shadow-md flex flex-col gap-3 transition-all
        ${noCena
          ? 'bg-gray-100 border-2 border-gray-300'
          : esHoy
          ? 'bg-green-50 border-2 border-green-500'
          : 'bg-white border-2 border-transparent'
        }
      `}
    >
      {/* Cabecera */}
      <div className="flex items-center justify-between">
        <span className="text-xl font-bold text-gray-800">{dia}</span>
        <div className="flex items-center gap-2">
          {esHoy && !noCena && (
            <span className="bg-green-500 text-white text-sm font-semibold px-3 py-1 rounded-full">
              HOY
            </span>
          )}
          {noCena && (
            <span className="bg-gray-400 text-white text-sm font-semibold px-3 py-1 rounded-full">
              🏠 No ceno
            </span>
          )}
        </div>
      </div>

      {/* Plato */}
      <p className={`text-lg leading-snug min-h-[2rem] ${noCena ? 'text-gray-400 line-through' : 'text-gray-700'}`}>
        {plato || <span className="italic text-gray-400">Sin menú</span>}
      </p>

      {/* Puntuación */}
      {!noCena && (
        <div className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-gray-500">
            {rating !== undefined ? `⭐ Puntuación: ${rating}/10` : 'Puntúa el plato'}
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
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  }
                `}
              >
                {n}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Botones inferiores */}
      <div className="flex gap-2 mt-1">
        <button
          onClick={onToggleNoCena}
          className={`
            flex-1 py-2.5 rounded-xl text-sm font-semibold transition-colors
            ${noCena
              ? 'bg-gray-200 hover:bg-gray-300 text-gray-600'
              : 'bg-orange-100 hover:bg-orange-200 text-orange-700'
            }
          `}
        >
          {noCena ? '✅ Sí ceno en casa' : '🏠 No ceno en casa'}
        </button>

        {modoEdicion && (
          <button
            onClick={onEditar}
            aria-label={`Editar menú del ${dia}`}
            className="bg-amber-400 hover:bg-amber-500 text-white font-semibold px-4 py-2.5 rounded-xl text-sm transition-colors"
          >
            ✏️ Cambiar
          </button>
        )}
      </div>
    </div>
  );
}

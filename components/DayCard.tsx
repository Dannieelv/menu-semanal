'use client';

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
};

const NOTAS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

export default function DayCard({
  dia, fecha, plato, esHoy, modoEdicion, onEditar,
  rating, onRating, noCena, onToggleNoCena,
}: Props) {
  return (
    <div
      data-day={dia}
      className={`
        scroll-mt-20 rounded-2xl p-5 shadow-md flex flex-col gap-4 transition-all
        ${esHoy ? 'bg-green-50 border-2 border-green-500' : 'bg-white border-2 border-transparent'}
      `}
    >
      {/* Cabecera: nombre + fecha + badges */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <p className="text-2xl font-bold text-gray-800">{dia}</p>
            {rating !== undefined && (
              <span className="bg-yellow-400 text-white text-sm font-bold px-2.5 py-0.5 rounded-full">
                ⭐ {rating}
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

      {/* Plato — texto grande */}
      <p className="text-2xl font-medium text-gray-800 leading-snug min-h-[2rem]">
        {plato || <span className="italic text-gray-400 text-xl">Sin menú</span>}
      </p>

      {/* Puntuación — solo en modo edición */}
      {modoEdicion && (
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
      <div className="flex gap-2">
        <button
          onClick={onToggleNoCena}
          className={`
            flex-1 py-3 rounded-xl text-base font-semibold transition-colors
            ${noCena
              ? 'bg-orange-400 hover:bg-orange-500 text-white'
              : 'bg-gray-100 hover:bg-gray-200 text-gray-600'}
          `}
        >
          {noCena ? '🏠 No ceno en casa' : '🏠 Ceno en casa'}
        </button>

        {modoEdicion && (
          <button
            onClick={onEditar}
            aria-label={`Editar menú del ${dia}`}
            className="bg-amber-400 hover:bg-amber-500 text-white font-semibold px-4 py-3 rounded-xl text-sm transition-colors"
          >
            ✏️ Cambiar
          </button>
        )}
      </div>
    </div>
  );
}

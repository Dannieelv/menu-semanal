'use client';

type Props = {
  dia: string;
  plato: string;
  esHoy: boolean;
  modoEdicion: boolean;
  onEditar: () => void;
};

export default function DayCard({ dia, plato, esHoy, modoEdicion, onEditar }: Props) {
  return (
    <div
      className={`
        rounded-2xl p-5 shadow-md flex flex-col gap-2 transition-all
        ${esHoy
          ? 'bg-green-50 border-2 border-green-500'
          : 'bg-white border-2 border-transparent'
        }
      `}
    >
      <div className="flex items-center justify-between">
        <span className="text-xl font-bold text-gray-800">{dia}</span>
        {esHoy && (
          <span className="bg-green-500 text-white text-sm font-semibold px-3 py-1 rounded-full">
            HOY
          </span>
        )}
      </div>
      <p className="text-lg text-gray-700 leading-snug min-h-[2.5rem]">
        {plato || <span className="text-gray-400 italic">Sin menú</span>}
      </p>
      {modoEdicion && (
        <button
          onClick={onEditar}
          className="mt-1 self-end bg-amber-400 hover:bg-amber-500 active:bg-amber-600 text-white font-semibold px-4 py-2 rounded-xl text-base transition-colors"
          aria-label={`Editar menú del ${dia}`}
        >
          ✏️ Cambiar
        </button>
      )}
    </div>
  );
}

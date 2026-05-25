export const DIAS = [
  'Lunes',
  'Martes',
  'Miércoles',
  'Jueves',
  'Viernes',
  'Sábado',
  'Domingo',
] as const;

export type Dia = (typeof DIAS)[number];

export const MENU_DEFAULT: Record<Dia, string> = {
  Lunes: 'Lentejas con chorizo',
  Martes: 'Pollo al horno con patatas',
  Miércoles: 'Merluza a la plancha con ensalada',
  Jueves: 'Arroz con pollo',
  Viernes: 'Croquetas caseras y ensalada',
  Sábado: 'Paella de mariscos',
  Domingo: 'Cocido madrileño',
};

const STORAGE_KEY = 'menu-semanal';

const DIA_HOY_MAP: Record<number, Dia> = {
  0: 'Domingo',
  1: 'Lunes',
  2: 'Martes',
  3: 'Miércoles',
  4: 'Jueves',
  5: 'Viernes',
  6: 'Sábado',
};

export function getDiaHoy(): Dia {
  return DIA_HOY_MAP[new Date().getDay()];
}

export function cargarMenu(): Record<Dia, string> {
  if (typeof window === 'undefined') return { ...MENU_DEFAULT };
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch {
    // fallback
  }
  return { ...MENU_DEFAULT };
}

export function guardarMenu(menu: Record<Dia, string>): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(menu));
}

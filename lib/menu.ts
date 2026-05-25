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

// ─── Día actual ───────────────────────────────────────────────────────────────

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

// ─── Clave ISO de semana (ej: "2026-W22") ────────────────────────────────────

export function getWeekKey(): string {
  const d = new Date();
  const utc = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const day = utc.getUTCDay() || 7;
  utc.setUTCDate(utc.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(utc.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((utc.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${utc.getUTCFullYear()}-W${String(week).padStart(2, '0')}`;
}

// ─── Menú (persiste indefinidamente) ─────────────────────────────────────────

const MENU_KEY = 'menu-semanal';

export function cargarMenu(): Record<Dia, string> {
  if (typeof window === 'undefined') return { ...MENU_DEFAULT };
  try {
    const saved = localStorage.getItem(MENU_KEY);
    if (saved) return JSON.parse(saved);
  } catch { /* fallback */ }
  return { ...MENU_DEFAULT };
}

export function guardarMenu(menu: Record<Dia, string>): void {
  localStorage.setItem(MENU_KEY, JSON.stringify(menu));
}

// ─── Puntuaciones (se reinician cada semana) ──────────────────────────────────

const RATINGS_KEY = 'ratings-semanal';

type WeeklyRatings = { weekKey: string; ratings: Partial<Record<Dia, number>> };

export function cargarRatings(): Partial<Record<Dia, number>> {
  if (typeof window === 'undefined') return {};
  try {
    const saved = localStorage.getItem(RATINGS_KEY);
    if (saved) {
      const data: WeeklyRatings = JSON.parse(saved);
      if (data.weekKey === getWeekKey()) return data.ratings;
    }
  } catch { /* fallback */ }
  return {};
}

export function guardarRating(dia: Dia, nota: number | undefined): void {
  const weekKey = getWeekKey();
  const ratings = cargarRatings();
  if (nota === undefined) {
    delete ratings[dia];
  } else {
    ratings[dia] = nota;
  }
  localStorage.setItem(RATINGS_KEY, JSON.stringify({ weekKey, ratings }));
}

// ─── "No ceno en casa" (se reinicia cada semana) ──────────────────────────────

const NO_CENA_KEY = 'no-cena-semanal';

type WeeklyNoCena = { weekKey: string; noCena: Partial<Record<Dia, boolean>> };

export function cargarNoCena(): Partial<Record<Dia, boolean>> {
  if (typeof window === 'undefined') return {};
  try {
    const saved = localStorage.getItem(NO_CENA_KEY);
    if (saved) {
      const data: WeeklyNoCena = JSON.parse(saved);
      if (data.weekKey === getWeekKey()) return data.noCena;
    }
  } catch { /* fallback */ }
  return {};
}

export function guardarNoCena(dia: Dia, valor: boolean): void {
  const weekKey = getWeekKey();
  const noCena = cargarNoCena();
  noCena[dia] = valor;
  localStorage.setItem(NO_CENA_KEY, JSON.stringify({ weekKey, noCena }));
}

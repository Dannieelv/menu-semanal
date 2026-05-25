export const DIAS = [
  'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo',
] as const;

export type Dia = (typeof DIAS)[number];

// ─── Menú por defecto ─────────────────────────────────────────────────────────

export const MENU_DEFAULT: Record<Dia, string> = {
  Lunes:     'Arroz, lentejas, aguacate y champiñones',
  Martes:    'Patata, carne picada, aguacate y cebolla',
  Miércoles: 'Pasta, garbanzos, aguacate y calabacín',
  Jueves:    'Gnocchi, ternera, aguacate, champiñones y cebolla',
  Viernes:   'Arroz, alubias blancas, aguacate, calabacín y champiñones',
  Sábado:    'Arroz, lentejas, aguacate y champiñones',
  Domingo:   'Patata, carne picada, aguacate y cebolla',
};

// ─── Detalles / ingredientes por defecto ─────────────────────────────────────

export const DETALLES_DEFAULT: Record<Dia, string> = {
  Lunes: `• 50 g arroz (en seco)
• 250 g lentejas cocidas
• 50 g aguacate
• 300 g champiñones salteados`,
  Martes: `• 250 g patata cocida
• 80 g carne picada magra
• 50 g aguacate
• 300 g cebolla pochada`,
  Miércoles: `• 50 g pasta (en seco)
• 250 g garbanzos cocidos
• 50 g aguacate
• 300 g calabacín a la plancha`,
  Jueves: `• 100 g gnocchi
• 80 g ternera magra fileteada
• 50 g aguacate
• 200 g champiñones + 100 g cebolla`,
  Viernes: `• 50 g arroz (en seco)
• 300 g alubias blancas cocidas
• 50 g aguacate
• 150 g calabacín + 150 g champiñones`,
  Sábado: `• 50 g arroz (en seco)
• 250 g lentejas cocidas
• 50 g aguacate
• 300 g champiñones salteados`,
  Domingo: `• 250 g patata cocida
• 80 g carne picada magra
• 50 g aguacate
• 300 g cebolla pochada`,
};

// ─── Día actual ───────────────────────────────────────────────────────────────

const DIA_DOW: Record<number, Dia> = {
  0: 'Domingo', 1: 'Lunes', 2: 'Martes', 3: 'Miércoles',
  4: 'Jueves',  5: 'Viernes', 6: 'Sábado',
};

const DOW_DIA: Record<Dia, number> = {
  Lunes: 1, Martes: 2, Miércoles: 3, Jueves: 4,
  Viernes: 5, Sábado: 6, Domingo: 0,
};

export function getDiaHoy(): Dia {
  return DIA_DOW[new Date().getDay()];
}

// ─── Fecha formateada: "25 de mayo" ──────────────────────────────────────────

const MESES = [
  'enero','febrero','marzo','abril','mayo','junio',
  'julio','agosto','septiembre','octubre','noviembre','diciembre',
];

export function getFechaDelDia(dia: Dia): string {
  const hoy = new Date();
  const diff = DOW_DIA[dia] - hoy.getDay();
  const fecha = new Date(hoy);
  fecha.setDate(hoy.getDate() + diff);
  return `${fecha.getDate()} de ${MESES[fecha.getMonth()]}`;
}

// ─── Clave ISO de semana ──────────────────────────────────────────────────────

export function getWeekKey(): string {
  const d = new Date();
  const utc = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const day = utc.getUTCDay() || 7;
  utc.setUTCDate(utc.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(utc.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((utc.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${utc.getUTCFullYear()}-W${String(week).padStart(2, '0')}`;
}

// ─── Menú ─────────────────────────────────────────────────────────────────────

const MENU_KEY = 'menu-semanal-v2';

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

// ─── Detalles ─────────────────────────────────────────────────────────────────

const DETALLES_KEY = 'detalles-semanal';

export function cargarDetalles(): Record<Dia, string> {
  if (typeof window === 'undefined') return { ...DETALLES_DEFAULT };
  try {
    const saved = localStorage.getItem(DETALLES_KEY);
    if (saved) return JSON.parse(saved);
  } catch { /* fallback */ }
  return { ...DETALLES_DEFAULT };
}

export function guardarDetalles(detalles: Record<Dia, string>): void {
  localStorage.setItem(DETALLES_KEY, JSON.stringify(detalles));
}

// ─── Puntuaciones (semanales) ─────────────────────────────────────────────────

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
  const ratings = cargarRatings();
  if (nota === undefined) delete ratings[dia]; else ratings[dia] = nota;
  localStorage.setItem(RATINGS_KEY, JSON.stringify({ weekKey: getWeekKey(), ratings }));
}

// ─── "No ceno en casa" (semanal) ─────────────────────────────────────────────

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
  const noCena = cargarNoCena();
  noCena[dia] = valor;
  localStorage.setItem(NO_CENA_KEY, JSON.stringify({ weekKey: getWeekKey(), noCena }));
}

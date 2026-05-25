export type Usuario = 'mama' | 'dani';

const KEY = 'usuario-app';

export function getUsuario(): Usuario | null {
  if (typeof window === 'undefined') return null;
  const v = localStorage.getItem(KEY);
  if (v === 'mama' || v === 'dani') return v;
  return null;
}

export function setUsuario(u: Usuario): void {
  localStorage.setItem(KEY, u);
}

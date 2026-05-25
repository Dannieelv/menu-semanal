import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { getWeekKey, MENU_DEFAULT, DETALLES_DEFAULT, type Dia } from '@/lib/menu';

const DATA_DIR = path.join(process.cwd(), 'data');
const FILE = path.join(DATA_DIR, 'menu.json');

type MenuData = {
  weekKey: string;
  menu: Record<Dia, string>;
  detalles: Record<Dia, string>;
};

function read(): MenuData {
  try {
    if (!fs.existsSync(FILE)) {
      return { weekKey: getWeekKey(), menu: { ...MENU_DEFAULT }, detalles: { ...DETALLES_DEFAULT } };
    }
    const stored: MenuData = JSON.parse(fs.readFileSync(FILE, 'utf-8'));
    if (stored.weekKey !== getWeekKey()) {
      return { weekKey: getWeekKey(), menu: { ...MENU_DEFAULT }, detalles: { ...DETALLES_DEFAULT } };
    }
    return stored;
  } catch {
    return { weekKey: getWeekKey(), menu: { ...MENU_DEFAULT }, detalles: { ...DETALLES_DEFAULT } };
  }
}

function write(data: MenuData) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(FILE, JSON.stringify(data));
}

export async function GET() {
  const data = read();
  return NextResponse.json({ menu: data.menu, detalles: data.detalles });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const data = read();
  if (body.menu) data.menu = body.menu;
  if (body.detalles) data.detalles = body.detalles;
  data.weekKey = getWeekKey();
  write(data);
  return NextResponse.json({ ok: true });
}

import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { MENU_DEFAULT, DETALLES_DEFAULT } from '@/lib/menu';

const DATA_DIR = path.join(process.cwd(), 'data');
const FILE = path.join(DATA_DIR, 'menu.json');

type MenuData = {
  menu: Record<string, string>;
  detalles: Record<string, string>;
};

function read(): MenuData {
  try {
    if (!fs.existsSync(FILE)) {
      return { menu: { ...MENU_DEFAULT }, detalles: { ...DETALLES_DEFAULT } };
    }
    return JSON.parse(fs.readFileSync(FILE, 'utf-8'));
  } catch {
    return { menu: { ...MENU_DEFAULT }, detalles: { ...DETALLES_DEFAULT } };
  }
}

function write(data: MenuData) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(FILE, JSON.stringify(data));
}

export async function GET() {
  return NextResponse.json(read());
}

export async function POST(request: NextRequest) {
  const { dia, plato, detalle } = await request.json();
  const data = read();
  data.menu[dia] = plato;
  data.detalles[dia] = detalle;
  write(data);
  return NextResponse.json({ ok: true });
}

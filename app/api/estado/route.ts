import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { getWeekKey } from '@/lib/menu';

const DATA_DIR = path.join(process.cwd(), 'data');
const FILE = path.join(DATA_DIR, 'estado.json');

type Estado = { weekKey: string; noCena: Record<string, boolean> };

function read(): Estado {
  try {
    if (!fs.existsSync(FILE)) return { weekKey: '', noCena: {} };
    const stored: Estado = JSON.parse(fs.readFileSync(FILE, 'utf-8'));
    if (stored.weekKey !== getWeekKey()) return { weekKey: getWeekKey(), noCena: {} };
    return stored;
  } catch {
    return { weekKey: getWeekKey(), noCena: {} };
  }
}

function write(estado: Estado) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(FILE, JSON.stringify(estado));
}

export async function GET() {
  return NextResponse.json(read());
}

export async function POST(request: NextRequest) {
  const { dia, valor } = await request.json();
  const estado = read();
  estado.noCena[dia] = valor;
  write(estado);
  return NextResponse.json({ ok: true });
}

import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { getWeekKey } from '@/lib/menu';

const DATA_DIR = path.join(process.cwd(), 'data');
const FILE = path.join(DATA_DIR, 'estado.json');

type Estado = {
  weekKey: string;
  noCena: Record<string, boolean>;
  ratings: Record<string, number>;
};

function read(): Estado {
  try {
    if (!fs.existsSync(FILE)) return { weekKey: '', noCena: {}, ratings: {} };
    const stored = JSON.parse(fs.readFileSync(FILE, 'utf-8')) as Partial<Estado>;
    if (stored.weekKey !== getWeekKey()) return { weekKey: getWeekKey(), noCena: {}, ratings: {} };
    // backwards compat: añadir ratings si no existía aún
    return { ratings: {}, noCena: {}, ...stored, weekKey: getWeekKey() };
  } catch {
    return { weekKey: getWeekKey(), noCena: {}, ratings: {} };
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
  const body = await request.json();
  const estado = read();

  if (body.campo === 'noCena') {
    estado.noCena[body.dia] = body.valor;
  } else if (body.campo === 'rating') {
    if (body.valor === null || body.valor === undefined) {
      delete estado.ratings[body.dia];
    } else {
      estado.ratings[body.dia] = body.valor;
    }
  } else {
    // legado: POST antiguo sin campo → era noCena
    estado.noCena[body.dia] = body.valor;
  }

  write(estado);
  return NextResponse.json({ ok: true });
}

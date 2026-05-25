import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');
const FILE = path.join(DATA_DIR, 'subscriptions.json');

type Sub = { endpoint: string; keys: { auth: string; p256dh: string } };

function read(): Sub[] {
  try {
    if (!fs.existsSync(FILE)) return [];
    return JSON.parse(fs.readFileSync(FILE, 'utf-8'));
  } catch {
    return [];
  }
}

function write(subs: Sub[]): void {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(FILE, JSON.stringify(subs));
}

export function addSubscription(sub: Sub): void {
  const subs = read();
  if (!subs.some((s) => s.endpoint === sub.endpoint)) {
    subs.push(sub);
    write(subs);
  }
}

export function removeSubscription(endpoint: string): void {
  write(read().filter((s) => s.endpoint !== endpoint));
}

export function getSubscriptions(): Sub[] {
  return read();
}

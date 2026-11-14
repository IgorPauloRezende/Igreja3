import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { ChurchDatabase } from '../shared/types/church.ts';

const DATA_FILE_PATH = process.env.DATA_FILE
  ? path.resolve(process.env.DATA_FILE)
  : fileURLToPath(new URL('./data/church.json', import.meta.url));

function createInitialSeed(): ChurchDatabase {
  return {
    settings: {
      churchName: 'Paróquia Rainha Santa Isabel',
      city: 'Casa Verde, São Paulo',
      address: 'Rua Elias Gannam, 331 · Vila Bandeirantes, São Paulo — SP',
      serviceTimes:
        'Igreja Matriz\nPrimeira sexta-feira do mês: 15h\nQuarta-feira: 19h30\nDomingo: 8h, 10h e 18h\n\nCapela Maranata\nDomingo: 11h30',
      contactEmail: 'rainha_santaisabel@hotmail.com',
      whatsappNumber: '',
      liveStreamUrl: '',
      heroTitle: 'Paróquia Rainha Santa Isabel',
      heroSubtitle: '“Uma comunidade de fé, oração e acolhimento.”',
    },
    events: [],
    sermons: [],
    members: [],
    notifications: [],
    subscribers: [],
    prayerRequests: [],
    parishioners: [],
  };
}

let cachedDb: ChurchDatabase | null = null;

function ensureDirectoryExists(filePath: string) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

export function readDb(): ChurchDatabase {
  if (cachedDb) return cachedDb;

  ensureDirectoryExists(DATA_FILE_PATH);

  if (!fs.existsSync(DATA_FILE_PATH)) {
    const seed = createInitialSeed();
    writeDb(seed);
    return seed;
  }

  try {
    const raw = fs.readFileSync(DATA_FILE_PATH, 'utf-8');
    const parsed = JSON.parse(raw) as ChurchDatabase;
    parsed.parishioners = Array.isArray(parsed.parishioners) ? parsed.parishioners : [];
    cachedDb = parsed;
    return cachedDb;
  } catch {
    const seed = createInitialSeed();
    writeDb(seed);
    return seed;
  }
}

export function writeDb(nextDb: ChurchDatabase): ChurchDatabase {
  ensureDirectoryExists(DATA_FILE_PATH);
  const tempPath = `${DATA_FILE_PATH}.tmp`;
  fs.writeFileSync(tempPath, JSON.stringify(nextDb, null, 2), 'utf-8');
  fs.renameSync(tempPath, DATA_FILE_PATH);
  cachedDb = nextDb;
  return nextDb;
}

export function generateId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

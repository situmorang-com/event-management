import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { env } from '$env/dynamic/private';
import * as schema from './schema';
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';

const url = (env.DATABASE_URL ?? 'file:./data/app.db').replace(/^file:/, '');

mkdirSync(dirname(url), { recursive: true });

const sqlite = new Database(url);
sqlite.pragma('journal_mode = WAL');
sqlite.pragma('foreign_keys = ON');
sqlite.pragma('busy_timeout = 5000');

export const db = drizzle(sqlite, { schema });
export { schema };
export type DB = typeof db;

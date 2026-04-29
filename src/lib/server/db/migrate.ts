import 'dotenv/config';
import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';

const url = (process.env.DATABASE_URL ?? 'file:./data/app.db').replace(/^file:/, '');
mkdirSync(dirname(url), { recursive: true });

const sqlite = new Database(url);
sqlite.pragma('journal_mode = WAL');
sqlite.pragma('foreign_keys = ON');

const db = drizzle(sqlite);
migrate(db, { migrationsFolder: './drizzle' });
console.log('migrations applied');
sqlite.close();

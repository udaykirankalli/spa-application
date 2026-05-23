import fs from 'fs/promises';
import path from 'path';
import { LocalDatabase, PublicUser, StoredUser } from './types';

const databasePath = path.join(__dirname, '..', 'data', 'local-db.json');

export async function readDatabase(): Promise<LocalDatabase> {
  const rawContent = await fs.readFile(databasePath, 'utf-8');
  return JSON.parse(rawContent) as LocalDatabase;
}

export async function writeDatabase(database: LocalDatabase): Promise<void> {
  const formatted = JSON.stringify(database, null, 2);
  await fs.writeFile(databasePath, formatted);
}

export function toPublicUser(user: StoredUser): PublicUser {
  const { password, ...safeUser } = user;
  return safeUser;
}

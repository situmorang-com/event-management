import { mkdirSync, writeFileSync, readFileSync, existsSync } from 'node:fs';
import { join, extname } from 'node:path';
import { env } from '$env/dynamic/private';
import { newId } from '$lib/utils/ids';
import { db } from './db';
import { assets } from './db/schema';

const ROOT = env.UPLOAD_DIR ?? './uploads';

const ALLOWED_MIME: Record<string, string> = {
  'image/png': '.png',
  'image/jpeg': '.jpg',
  'image/webp': '.webp',
  'application/pdf': '.pdf'
};

const MAX_BYTES = 5 * 1024 * 1024;

export type AssetKind = 'logo_light' | 'logo_dark' | 'banner' | 'contract' | 'other';

export async function saveUpload(opts: {
  file: File;
  kind: AssetKind;
  isPublic: boolean;
  ownerTeamId?: string;
  sponsorId?: string;
  uploadedBy: string;
}): Promise<{ id: string; storagePath: string } | { error: string }> {
  const { file } = opts;
  if (!file || typeof file === 'string') return { error: 'No file' };
  if (file.size === 0) return { error: 'Empty file' };
  if (file.size > MAX_BYTES) return { error: `File too large (max ${MAX_BYTES / 1024 / 1024}MB)` };
  const ext = ALLOWED_MIME[file.type];
  if (!ext) return { error: `Unsupported type: ${file.type}` };

  mkdirSync(ROOT, { recursive: true });
  const id = newId('ast');
  const filename = `${id}${ext}`;
  const storagePath = join(ROOT, filename);
  const buf = Buffer.from(await file.arrayBuffer());
  writeFileSync(storagePath, buf);

  await db.insert(assets).values({
    id,
    ownerTeamId: opts.ownerTeamId ?? null,
    sponsorId: opts.sponsorId ?? null,
    kind: opts.kind,
    filename: file.name,
    mimeType: file.type,
    sizeBytes: file.size,
    storagePath: filename,
    isPublic: opts.isPublic,
    uploadedBy: opts.uploadedBy
  });

  return { id, storagePath };
}

export function readAssetFile(storagePath: string): Buffer | null {
  const fp = join(ROOT, storagePath);
  if (!existsSync(fp)) return null;
  return readFileSync(fp);
}

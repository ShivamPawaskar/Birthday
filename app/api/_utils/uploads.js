import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

function sanitizeFilename(name) {
  const trimmed = String(name || 'file')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-zA-Z0-9._-]/g, '')
    .toLowerCase();

  return trimmed || 'file';
}

function extFromMime(type) {
  if (!type) return '';
  if (type === 'image/jpeg') return '.jpg';
  if (type === 'image/png') return '.png';
  if (type === 'image/webp') return '.webp';
  if (type === 'image/gif') return '.gif';
  if (type === 'video/mp4') return '.mp4';
  if (type === 'video/webm') return '.webm';
  if (type === 'audio/mpeg') return '.mp3';
  if (type === 'audio/wav') return '.wav';
  if (type === 'audio/ogg') return '.ogg';
  return '';
}

export async function saveUploadToPublic(file, folder) {
  const original = sanitizeFilename(file.name || 'upload');
  const hasExt = /\.[a-z0-9]+$/i.test(original);
  const ext = hasExt ? '' : extFromMime(file.type);
  const filename = `${Date.now()}-${original}${ext}`;

  const relativeDir = path.join('uploads', folder);
  const relativePath = path.join(relativeDir, filename).replace(/\\/g, '/');
  const absoluteDir = path.join(process.cwd(), 'public', relativeDir);
  const absolutePath = path.join(process.cwd(), 'public', relativePath);

  await mkdir(absoluteDir, { recursive: true });
  const arrayBuffer = await file.arrayBuffer();
  await writeFile(absolutePath, Buffer.from(arrayBuffer));

  return {
    publicUrl: `/${relativePath.replace(/ /g, '%20')}`,
    filename
  };
}

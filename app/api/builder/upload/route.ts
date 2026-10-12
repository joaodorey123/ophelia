import { NextResponse } from 'next/server';
import sharp from 'sharp';

import { UPLOAD_DIR } from '@/lib/builder/github';
import { guardRequest } from '@/lib/builder/session';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** What a phone camera produces, before we resize it. */
const MAX_UPLOAD_BYTES = 20 * 1024 * 1024;
/** Wide enough for a full-bleed hero on a retina display, and no wider. */
const MAX_EDGE = 2000;

const ALLOWED = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/avif']);

/**
 * Accepts a photograph, resizes it, and hands it back staged.
 *
 * Nothing is committed here: the editor holds the result until the person
 * presses publish, so an abandoned edit leaves no orphaned files in the
 * repository. Re-encoding also strips EXIF, which quietly removes the GPS
 * coordinates phones attach to photographs.
 */
export async function POST(request: Request) {
  const denied = await guardRequest();
  if (denied) return denied;

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: 'Pedido inválido.' }, { status: 400 });
  }

  const file = form.get('file');
  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'Nenhuma imagem recebida.' }, { status: 400 });
  }
  if (!ALLOWED.has(file.type)) {
    return NextResponse.json(
      { error: 'Formato não suportado. Usa JPG, PNG, WebP ou AVIF.' },
      { status: 415 },
    );
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    return NextResponse.json(
      { error: 'A imagem é demasiado grande (máximo 20 MB).' },
      { status: 413 },
    );
  }

  const input = Buffer.from(await file.arrayBuffer());

  let output: Buffer;
  let width: number;
  let height: number;
  try {
    const pipeline = sharp(input, { failOn: 'error' }).rotate();
    const meta = await pipeline.metadata();
    const resized = await pipeline
      .resize({ width: MAX_EDGE, height: MAX_EDGE, fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 82, mozjpeg: true })
      .toBuffer({ resolveWithObject: true });

    output = resized.data;
    width = resized.info.width;
    height = resized.info.height;
    void meta;
  } catch (error) {
    console.error('[upload] could not process image:', error);
    return NextResponse.json({ error: 'Não foi possível ler esta imagem.' }, { status: 422 });
  }

  // A stable, collision-free name: the client never chooses the path.
  const stamp = new Date().toISOString().slice(0, 10);
  const random = Math.random().toString(36).slice(2, 8);
  const base = (file.name.replace(/\.[^.]+$/, '') || 'foto')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 40);

  const path = `${UPLOAD_DIR}/${stamp}-${base || 'foto'}-${random}.jpg`;

  return NextResponse.json({
    // The storefront serves /public at the site root.
    src: `/${path.replace(/^public\//, '')}`,
    path,
    base64: output.toString('base64'),
    width,
    height,
    bytes: output.byteLength,
  });
}

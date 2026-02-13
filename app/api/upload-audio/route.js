import { NextResponse } from 'next/server';
import { isAuthorizedAdmin } from '@/app/api/_utils/admin';
import { saveUploadToPublic } from '@/app/api/_utils/uploads';

export const runtime = 'nodejs';

export async function POST(request) {
  const auth = isAuthorizedAdmin(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const formData = await request.formData();
  const audio = formData.get('audio');

  if (!(audio instanceof File)) {
    return NextResponse.json({ error: 'No audio file received.' }, { status: 400 });
  }

  if (!audio.type.startsWith('audio/')) {
    return NextResponse.json({ error: 'Only audio files are allowed.' }, { status: 400 });
  }

  const saved = await saveUploadToPublic(audio, 'audio');
  return NextResponse.json(
    {
      audioUrl: saved.publicUrl
    },
    { status: 201 }
  );
}

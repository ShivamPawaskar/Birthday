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
  const media = formData.get('media');

  if (!(media instanceof File)) {
    return NextResponse.json({ error: 'No media file received.' }, { status: 400 });
  }

  const isImage = media.type.startsWith('image/');
  const isVideo = media.type.startsWith('video/');
  if (!isImage && !isVideo) {
    return NextResponse.json({ error: 'Only image or video files are allowed.' }, { status: 400 });
  }

  const saved = await saveUploadToPublic(media, 'media');
  return NextResponse.json(
    {
      mediaUrl: saved.publicUrl,
      mediaType: isVideo ? 'video' : 'image'
    },
    { status: 201 }
  );
}

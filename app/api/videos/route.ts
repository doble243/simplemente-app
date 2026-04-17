import { NextRequest, NextResponse } from 'next/server';
import { bundle } from '@remotion/bundler';
import { renderMedia, selectComposition } from '@remotion/renderer';
import { createAdminClient } from '@/lib/supabase/admin';
import path from 'path';
import os from 'os';
import fs from 'fs';

export const maxDuration = 300;

export async function POST(request: NextRequest) {
  // Solo admins autenticados pueden triggear renders
  const authHeader = request.headers.get('authorization') ?? '';
  const token = authHeader.replace('Bearer ', '');
  if (!token) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  const supabase = createAdminClient();
  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  try {
    const { compositionId = 'AgencyIntro', props = {} } = await request.json();

    const bundleLocation = await bundle({
      entryPoint: path.join(process.cwd(), 'remotion/index.ts'),
      webpackOverride: (config) => config,
    });

    const composition = await selectComposition({
      serveUrl: bundleLocation,
      id: compositionId,
      inputProps: props,
    });

    const outputPath = path.join(os.tmpdir(), `video-${Date.now()}.mp4`);

    await renderMedia({
      composition,
      serveUrl: bundleLocation,
      codec: 'h264',
      outputLocation: outputPath,
      inputProps: props,
    });

    const videoBuffer = fs.readFileSync(outputPath);
    fs.unlinkSync(outputPath);

    return new NextResponse(videoBuffer, {
      headers: {
        'Content-Type': 'video/mp4',
        'Content-Disposition': `attachment; filename="${compositionId}.mp4"`,
        'Cache-Control': 'no-cache',
      },
    });
  } catch (error) {
    console.error('[video/render]', error);
    return NextResponse.json({ error: 'Failed to render video' }, { status: 500 });
  }
}

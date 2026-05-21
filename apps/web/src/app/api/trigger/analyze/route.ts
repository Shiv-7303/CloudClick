import { NextRequest, NextResponse } from 'next/server';
import { analyzeVideoJob } from '@/trigger/analyze-video';

export async function POST(req: NextRequest) {
  const internalSecret = req.headers.get('X-Internal-Secret');
  if (internalSecret !== process.env.INTERNAL_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const payload = await req.json();
  const handle = await analyzeVideoJob.trigger(payload);
  return NextResponse.json({ runId: handle.id });
}

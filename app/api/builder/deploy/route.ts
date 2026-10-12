import { NextResponse } from 'next/server';

import { getDeployState, GitHubError } from '@/lib/builder/github';
import { guardRequest } from '@/lib/builder/session';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** Where a published commit has got to, so the editor can say when it is live. */
export async function GET(request: Request) {
  const denied = await guardRequest();
  if (denied) return denied;

  const sha = new URL(request.url).searchParams.get('sha');
  if (!sha || !/^[0-9a-f]{7,40}$/i.test(sha)) {
    return NextResponse.json({ error: 'SHA inválido.' }, { status: 400 });
  }

  try {
    return NextResponse.json(await getDeployState(sha));
  } catch (error) {
    if (error instanceof GitHubError) {
      return NextResponse.json({ error: error.message }, { status: 502 });
    }
    return NextResponse.json({ error: 'Não foi possível verificar.' }, { status: 500 });
  }
}

import { describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/builder/config', () => ({
  getRepoConfig: () => ({ owner: 'o', repo: 'r', branch: 'main', token: 't' }),
}));

const { getDeployState } = await import('@/lib/builder/github');

/**
 * A repository can end up watched by more than one Vercel project — a stray
 * one from an earlier setup attempt, say. That project's own failure must
 * never be reported as "the site failed to update" when the real production
 * project deployed successfully.
 */
describe('getDeployState with more than one Vercel project', () => {
  function mockFetch(statuses: { context: string; state: string; target_url: string }[]) {
    vi.stubGlobal(
      'fetch',
      vi.fn(async (url: string) => {
        if (url.includes('/status')) {
          return new Response(JSON.stringify({ state: 'mixed', statuses }), { status: 200 });
        }
        if (url.includes('/check-runs')) {
          return new Response(JSON.stringify({ check_runs: [] }), { status: 200 });
        }
        throw new Error(`unexpected fetch: ${url}`);
      }),
    );
  }

  it('reports live when any project succeeded, even if others failed', async () => {
    mockFetch([
      { context: 'Vercel – ophelia', state: 'failure', target_url: 'https://a' },
      { context: 'Vercel – ophelia-ubre', state: 'failure', target_url: 'https://b' },
      { context: 'Vercel – ophelia-final', state: 'success', target_url: 'https://c' },
    ]);
    const result = await getDeployState('abc123');
    expect(result.state).toBe('live');
    expect(result.url).toBe('https://c');
  });

  it('reports pending while any project is still building, none have succeeded', async () => {
    mockFetch([
      { context: 'Vercel – a', state: 'failure', target_url: 'https://a' },
      { context: 'Vercel – b', state: 'pending', target_url: 'https://b' },
    ]);
    expect((await getDeployState('abc123')).state).toBe('pending');
  });

  it('reports failed only when every project failed', async () => {
    mockFetch([
      { context: 'Vercel – a', state: 'failure', target_url: 'https://a' },
      { context: 'Vercel – b', state: 'error', target_url: 'https://b' },
    ]);
    expect((await getDeployState('abc123')).state).toBe('failed');
  });

  it('ignores statuses that are not from Vercel', async () => {
    mockFetch([
      { context: 'ci/lint', state: 'success', target_url: 'https://ci' },
      { context: 'Vercel – ophelia', state: 'pending', target_url: 'https://v' },
    ]);
    expect((await getDeployState('abc123')).state).toBe('pending');
  });
});

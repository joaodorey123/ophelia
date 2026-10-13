import { describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/builder/config', () => ({
  getRepoConfig: () => ({ owner: 'o', repo: 'r', branch: 'main', token: 't' }),
}));

const { DEPLOY_CONTEXT, getDeployState } = await import('@/lib/builder/github');

/**
 * The live site is the cPanel hosting, deployed by the GitHub workflow. Only
 * that workflow's commit status says whether an edit is live; a leftover
 * Vercel project or CI reporting on the same commit must not.
 */
describe('getDeployState', () => {
  function mockStatuses(statuses: { context: string; state: string; target_url: string }[]) {
    vi.stubGlobal(
      'fetch',
      vi.fn(async (url: string) => {
        if (url.includes('/status')) {
          return new Response(JSON.stringify({ state: 'mixed', statuses }), { status: 200 });
        }
        throw new Error(`unexpected fetch: ${url}`);
      }),
    );
  }

  it('reports live when the hosting deploy succeeded', async () => {
    mockStatuses([{ context: DEPLOY_CONTEXT, state: 'success', target_url: 'https://run' }]);
    expect(await getDeployState('abc123')).toEqual({ state: 'live', url: 'https://run' });
  });

  it('reports pending while the deploy runs, and failed when it fails', async () => {
    mockStatuses([{ context: DEPLOY_CONTEXT, state: 'pending', target_url: 'https://run' }]);
    expect((await getDeployState('abc123')).state).toBe('pending');
    mockStatuses([{ context: DEPLOY_CONTEXT, state: 'failure', target_url: 'https://run' }]);
    expect((await getDeployState('abc123')).state).toBe('failed');
  });

  it('ignores other reporters, such as a leftover Vercel project', async () => {
    mockStatuses([
      { context: 'Vercel – ophelia-final', state: 'success', target_url: 'https://v' },
      { context: DEPLOY_CONTEXT, state: 'pending', target_url: 'https://run' },
    ]);
    expect((await getDeployState('abc123')).state).toBe('pending');
  });

  it('is unknown until the workflow reports', async () => {
    mockStatuses([{ context: 'Vercel – ophelia-final', state: 'success', target_url: 'https://v' }]);
    expect((await getDeployState('abc123')).state).toBe('unknown');
  });
});

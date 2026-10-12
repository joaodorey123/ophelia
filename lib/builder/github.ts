import 'server-only';

import { getRepoConfig, type RepoConfig } from './config';

/**
 * The GitHub side of publishing.
 *
 * Every edit becomes a real commit on the storefront repository, which is what
 * makes this safe to hand to a client: nothing is destructive, every change is
 * attributable, and anything can be reverted from the repository's history.
 *
 * Writes go through the Git Data API rather than the simpler contents
 * endpoint, so a change touching several files — text plus a new photograph,
 * say — lands as one commit rather than several half-states.
 */

const API = 'https://api.github.com';

export class GitHubError extends Error {
  readonly status: number;
  readonly code: 'auth' | 'not_found' | 'conflict' | 'rate_limit' | 'network' | 'unknown';

  constructor(code: GitHubError['code'], message: string, status = 0) {
    super(message);
    this.name = 'GitHubError';
    this.code = code;
    this.status = status;
  }
}

async function api<T>(
  path: string,
  config: RepoConfig,
  init: RequestInit = {},
): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API}${path}`, {
      ...init,
      headers: {
        Accept: 'application/vnd.github+json',
        Authorization: `Bearer ${config.token}`,
        'X-GitHub-Api-Version': '2022-11-28',
        'Content-Type': 'application/json',
        ...init.headers,
      },
      cache: 'no-store',
    });
  } catch {
    throw new GitHubError('network', 'Could not reach GitHub.', 0);
  }

  if (response.ok) return (await response.json()) as T;

  // The body carries GitHub's own explanation; it is safe to surface because
  // it never contains the token.
  const detail = await response.text().catch(() => '');
  const message = detail.slice(0, 300);

  if (response.status === 401 || response.status === 403) {
    if (detail.includes('rate limit')) {
      throw new GitHubError('rate_limit', 'GitHub rate limit reached. Try again shortly.', 403);
    }
    throw new GitHubError(
      'auth',
      'GitHub rejected the token. Check GITHUB_TOKEN has Contents: read and write on this repository.',
      response.status,
    );
  }
  if (response.status === 404) {
    throw new GitHubError('not_found', `Not found on GitHub: ${path}`, 404);
  }
  if (response.status === 409 || response.status === 422) {
    throw new GitHubError(
      'conflict',
      'The repository moved on while you were editing. Reload and apply your change again.',
      response.status,
    );
  }

  throw new GitHubError('unknown', `GitHub responded ${response.status}. ${message}`, response.status);
}

/** The content files this tool is allowed to touch. Nothing else is writable. */
export const EDITABLE_FILES = [
  'content/site.json',
  'content/home.json',
  'content/about.json',
  'content/contacto.json',
  'content/diario.json',
  'content/shop.json',
  'content/reviews.json',
  'content/posts.json',
  'content/theme.json',
] as const;

export type EditableFile = (typeof EDITABLE_FILES)[number];

export function isEditableFile(path: string): path is EditableFile {
  return (EDITABLE_FILES as readonly string[]).includes(path);
}

/** Uploaded photography lives here and nowhere else. */
export const UPLOAD_DIR = 'public/uploads';

type BlobResponse = { sha: string };
type RefResponse = { object: { sha: string } };
type CommitResponse = { sha: string; tree: { sha: string } };
type TreeResponse = { sha: string };
type ContentResponse = { content: string; encoding: string; sha: string };

/** Reads one file from the branch head. */
export async function readFile(
  path: string,
  config = getRepoConfig(),
): Promise<{ text: string; sha: string }> {
  const data = await api<ContentResponse>(
    `/repos/${config.owner}/${config.repo}/contents/${encodeURI(path)}?ref=${encodeURIComponent(config.branch)}`,
    config,
  );
  if (data.encoding !== 'base64') {
    throw new GitHubError('unknown', `Unexpected encoding "${data.encoding}" for ${path}.`);
  }
  return { text: Buffer.from(data.content, 'base64').toString('utf8'), sha: data.sha };
}

/** Reads every editable content file in one pass. */
export async function readAllContent(
  config = getRepoConfig(),
): Promise<Record<EditableFile, unknown>> {
  const entries = await Promise.all(
    EDITABLE_FILES.map(async (path) => {
      try {
        const { text } = await readFile(path, config);
        return [path, JSON.parse(text) as unknown] as const;
      } catch (error) {
        // A file that does not exist yet is not an error: theme.json may
        // legitimately be absent on an older storefront.
        if (error instanceof GitHubError && error.code === 'not_found') {
          return [path, null] as const;
        }
        throw error;
      }
    }),
  );
  return Object.fromEntries(entries) as Record<EditableFile, unknown>;
}

export type FileChange = {
  path: string;
  /** UTF-8 text, or base64 for binary content such as an image. */
  content: string;
  encoding?: 'utf-8' | 'base64';
};

/**
 * Commits a set of files as one atomic change.
 *
 * The branch reference is updated without force, so if someone else pushed
 * while the editor was working, GitHub rejects the update rather than
 * discarding their commit — the caller surfaces that as "reload and try
 * again", which is the honest outcome.
 */
export async function commitFiles(
  changes: FileChange[],
  message: string,
  config = getRepoConfig(),
): Promise<{ sha: string; url: string }> {
  if (changes.length === 0) {
    throw new GitHubError('unknown', 'Nothing to publish.');
  }

  const base = `/repos/${config.owner}/${config.repo}`;

  const ref = await api<RefResponse>(
    `${base}/git/ref/heads/${encodeURIComponent(config.branch)}`,
    config,
  );
  const headSha = ref.object.sha;

  const headCommit = await api<CommitResponse>(`${base}/git/commits/${headSha}`, config);

  const blobs = await Promise.all(
    changes.map(async (change) => {
      const blob = await api<BlobResponse>(`${base}/git/blobs`, config, {
        method: 'POST',
        body: JSON.stringify({
          content: change.content,
          encoding: change.encoding === 'base64' ? 'base64' : 'utf-8',
        }),
      });
      return { path: change.path, mode: '100644' as const, type: 'blob' as const, sha: blob.sha };
    }),
  );

  const tree = await api<TreeResponse>(`${base}/git/trees`, config, {
    method: 'POST',
    body: JSON.stringify({ base_tree: headCommit.tree.sha, tree: blobs }),
  });

  const commit = await api<CommitResponse>(`${base}/git/commits`, config, {
    method: 'POST',
    body: JSON.stringify({ message, tree: tree.sha, parents: [headSha] }),
  });

  await api<RefResponse>(`${base}/git/refs/heads/${encodeURIComponent(config.branch)}`, config, {
    method: 'PATCH',
    body: JSON.stringify({ sha: commit.sha, force: false }),
  });

  return {
    sha: commit.sha,
    url: `https://github.com/${config.owner}/${config.repo}/commit/${commit.sha}`,
  };
}

export type DeployState = 'pending' | 'live' | 'failed' | 'unknown';

type CombinedStatus = {
  state: string;
  statuses: { context: string; state: string; target_url: string | null }[];
};

type CheckRuns = {
  check_runs: { name: string; status: string; conclusion: string | null; details_url: string | null }[];
};

/**
 * Where a published commit has got to.
 *
 * Vercel reports deployment progress back to GitHub against the commit, so
 * asking GitHub avoids needing a second API token and tells us about the exact
 * commit the editor just made — not merely "something deployed recently".
 */
export async function getDeployState(
  sha: string,
  config = getRepoConfig(),
): Promise<{ state: DeployState; url: string | null }> {
  const base = `/repos/${config.owner}/${config.repo}/commits/${sha}`;

  const [status, checks] = await Promise.all([
    api<CombinedStatus>(`${base}/status`, config).catch(() => null),
    api<CheckRuns>(`${base}/check-runs`, config).catch(() => null),
  ]);

  const vercelStatuses = status?.statuses.filter((entry) =>
    entry.context.toLowerCase().includes('vercel'),
  ) ?? [];
  const vercelChecks = checks?.check_runs.filter((entry) =>
    entry.name.toLowerCase().includes('vercel'),
  ) ?? [];

  /*
   * More than one Vercel project can end up watching the same repository —
   * a stray project from an earlier setup attempt, say. That project's
   * unrelated failure must not be reported as "the site failed to update"
   * when the real production project deployed successfully. So: any success
   * counts as live; it is only "failed" when every reporting project failed,
   * and "pending" while any of them is still building.
   */
  const entries = [
    ...vercelStatuses.map((entry) => ({
      state: entry.state === 'success' ? 'live' : entry.state === 'pending' ? 'pending' : 'failed',
      url: entry.target_url,
    })),
    ...vercelChecks.map((entry) => ({
      state:
        entry.status !== 'completed'
          ? 'pending'
          : entry.conclusion === 'success'
            ? 'live'
            : 'failed',
      url: entry.details_url,
    })),
  ] as { state: DeployState; url: string | null }[];

  if (entries.length === 0) {
    // No deployment reported yet. Vercel usually takes a few seconds to register.
    return { state: 'unknown', url: null };
  }

  const live = entries.find((entry) => entry.state === 'live');
  if (live) return live;

  const pending = entries.find((entry) => entry.state === 'pending');
  if (pending) return pending;

  return entries[0]!;
}

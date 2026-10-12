import 'server-only';

/**
 * Environment contract. Read here and nowhere else, so a missing variable
 * produces one clear message instead of an undefined deep inside a fetch.
 *
 * Nothing in this module may be imported from a client component: the GitHub
 * token and the session secret are server-only by design.
 */

function optional(name: string): string | undefined {
  const value = process.env[name];
  return value && value.trim().length > 0 ? value.trim() : undefined;
}

/**
 * Raised when the tool has not been given what it needs.
 *
 * Separate from a runtime failure so the screens can tell someone exactly
 * which setting is missing instead of showing them a generic error.
 */
export class ConfigError extends Error {
  readonly missing: string[];

  constructor(missing: string[]) {
    super(`Missing configuration: ${missing.join(', ')}`);
    this.name = 'ConfigError';
    this.missing = missing;
  }
}

function required(name: string): string {
  const value = optional(name);
  if (!value) throw new ConfigError([name]);
  return value;
}

/** Everything required but absent, so a screen can list them all at once. */
export function missingConfig(): string[] {
  return ['GITHUB_REPO', 'GITHUB_TOKEN', 'BUILDER_PASSWORD_HASH', 'BUILDER_SESSION_SECRET'].filter(
    (key) => !optional(key),
  );
}

export type RepoConfig = {
  owner: string;
  repo: string;
  branch: string;
  token: string;
};

/**
 * The storefront repository this builder edits.
 *
 * GITHUB_REPO is given as "owner/name" because that is how GitHub shows it,
 * and one variable is harder to get half-wrong than two.
 */
export function getRepoConfig(): RepoConfig {
  const slug = required('GITHUB_REPO');
  const [owner, repo] = slug.split('/');

  if (!owner || !repo) {
    throw new Error(`GITHUB_REPO must look like "owner/name". Received "${slug}".`);
  }

  return {
    owner,
    repo,
    branch: optional('GITHUB_BRANCH') ?? 'main',
    token: required('GITHUB_TOKEN'),
  };
}

/** scrypt hash of the editor's password, produced by `npm run builder:hash-password`. */
export function getPasswordHash(): string {
  return required('BUILDER_PASSWORD_HASH');
}

/** Signing key for the session cookie. Rotating it logs everyone out. */
export function getSessionSecret(): string {
  const secret = required('BUILDER_SESSION_SECRET');
  if (secret.length < 32) {
    throw new Error('BUILDER_SESSION_SECRET must be at least 32 characters.');
  }
  return secret;
}

/**
 * Where the edited pages live, for the preview links and photo thumbnails.
 *
 * The builder is served by the storefront's own deployment at /builder, so
 * the default is the empty string — same-origin, root-relative links. Set
 * STOREFRONT_URL only to point the links at another deployment.
 */
export function getStorefrontUrl(): string {
  return optional('STOREFRONT_URL')?.replace(/\/$/, '') ?? '';
}

/** Reports which optional pieces are configured, for the settings screen. */
export function describeConfig(): { key: string; set: boolean; required: boolean }[] {
  return [
    { key: 'GITHUB_REPO', set: Boolean(optional('GITHUB_REPO')), required: true },
    { key: 'GITHUB_TOKEN', set: Boolean(optional('GITHUB_TOKEN')), required: true },
    { key: 'GITHUB_BRANCH', set: Boolean(optional('GITHUB_BRANCH')), required: false },
    {
      key: 'BUILDER_PASSWORD_HASH',
      set: Boolean(optional('BUILDER_PASSWORD_HASH')),
      required: true,
    },
    {
      key: 'BUILDER_SESSION_SECRET',
      set: Boolean(optional('BUILDER_SESSION_SECRET')),
      required: true,
    },
    { key: 'STOREFRONT_URL', set: Boolean(optional('STOREFRONT_URL')), required: false },
    {
      key: 'SHOPIFY_STORE_DOMAIN',
      set: Boolean(optional('SHOPIFY_STORE_DOMAIN')),
      required: false,
    },
    {
      key: 'SHOPIFY_STOREFRONT_ACCESS_TOKEN',
      set:
        Boolean(optional('SHOPIFY_STOREFRONT_ACCESS_TOKEN')) ||
        Boolean(optional('SHOPIFY_STOREFRONT_PRIVATE_TOKEN')),
      required: false,
    },
  ];
}

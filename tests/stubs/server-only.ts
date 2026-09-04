/**
 * `server-only` throws by design outside a React Server Component graph. The
 * unit suite exercises those modules directly in Node, so it is aliased to this
 * no-op. The real guard still applies to the application build.
 */
export {};

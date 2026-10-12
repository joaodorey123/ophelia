/**
 * Reading and writing values inside the content JSON by path.
 *
 * Paths are dotted — `hero.title`, `collections.cards` — and an empty path
 * means the document root, which is how the reviews file (a bare array) is
 * addressed.
 *
 * Writes are immutable: every set returns a new document, so the editor can
 * keep the original around to diff against and to know whether anything
 * actually changed.
 */

export type Json = string | number | boolean | null | Json[] | { [key: string]: Json };

/**
 * Rejects the prototype-polluting keys outright.
 *
 * The schema is authored by us, not by the client, so this should never fire —
 * but a set() that can reach `__proto__` is the kind of thing that turns a
 * content editor into a remote code execution bug, and the check is one line.
 */
const FORBIDDEN = new Set(['__proto__', 'constructor', 'prototype']);

function segments(path: string): string[] {
  if (!path) return [];
  const parts = path.split('.');
  for (const part of parts) {
    if (!part || FORBIDDEN.has(part)) {
      throw new Error(`Unsafe path segment in "${path}".`);
    }
  }
  return parts;
}

export function getPath(document: unknown, path: string): unknown {
  let current: unknown = document;
  for (const key of segments(path)) {
    if (current === null || typeof current !== 'object') return undefined;
    current = (current as Record<string, unknown>)[key];
  }
  return current;
}

/**
 * Returns a copy of `document` with `path` set to `value`.
 *
 * Only the nodes along the path are cloned; everything else is shared, which
 * keeps a large document cheap to edit and makes an identity comparison a
 * reliable "did this branch change" test.
 */
export function setPath<T>(document: T, path: string, value: unknown): T {
  const keys = segments(path);
  if (keys.length === 0) return value as T;

  const head = keys[0]!;
  const rest = keys.slice(1).join('.');

  if (Array.isArray(document)) {
    const index = Number(head);
    if (!Number.isInteger(index) || index < 0 || index >= document.length) {
      throw new Error(`Index ${head} is out of range for "${path}".`);
    }
    const next = [...document];
    next[index] = rest ? setPath(next[index], rest, value) : value;
    return next as unknown as T;
  }

  const source = (document ?? {}) as Record<string, unknown>;
  return {
    ...source,
    [head]: rest ? setPath(source[head], rest, value) : value,
  } as T;
}

/** Deep structural equality, used to decide whether a file needs committing. */
export function isEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (typeof a !== typeof b || a === null || b === null) return false;
  if (Array.isArray(a) !== Array.isArray(b)) return false;

  if (Array.isArray(a) && Array.isArray(b)) {
    return a.length === b.length && a.every((item, index) => isEqual(item, b[index]));
  }

  if (typeof a === 'object' && typeof b === 'object') {
    const aKeys = Object.keys(a as object);
    const bKeys = Object.keys(b as object);
    if (aKeys.length !== bKeys.length) return false;
    return aKeys.every((key) =>
      isEqual((a as Record<string, unknown>)[key], (b as Record<string, unknown>)[key]),
    );
  }

  return false;
}

/**
 * Serialises a content file the way the repository stores it.
 *
 * Two spaces and a trailing newline, matching what is already committed — so a
 * change to one field produces a one-line diff rather than reformatting the
 * entire file.
 */
export function serialise(document: unknown): string {
  return `${JSON.stringify(document, null, 2)}\n`;
}

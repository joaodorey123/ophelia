import { describe, expect, it } from 'vitest';

import { getPath, isEqual, serialise, setPath } from '@/lib/builder/paths';

const document = {
  hero: { title: 'a loja', cta: 'ver tudo' },
  cards: [{ name: 'cookies' }, { name: 'mercearia' }],
};

describe('getPath', () => {
  it('reads nested values, and the root for an empty path', () => {
    expect(getPath(document, 'hero.title')).toBe('a loja');
    expect(getPath(document, '')).toBe(document);
    expect(getPath(document, 'cards.0.name')).toBe('cookies');
  });

  it('returns undefined rather than throwing on a missing branch', () => {
    expect(getPath(document, 'nope.deeper')).toBeUndefined();
    expect(getPath(document, 'hero.title.deeper')).toBeUndefined();
  });
});

describe('setPath', () => {
  it('writes without mutating the original', () => {
    const next = setPath(document, 'hero.title', 'nova loja');
    expect(getPath(next, 'hero.title')).toBe('nova loja');
    expect(document.hero.title).toBe('a loja');
  });

  it('shares the branches it did not touch', () => {
    const next = setPath(document, 'hero.title', 'nova loja');
    expect(next.cards).toBe(document.cards);
  });

  it('writes into arrays by index', () => {
    const next = setPath(document, 'cards.1.name', 'café');
    expect(getPath(next, 'cards.1.name')).toBe('café');
    expect(getPath(next, 'cards.0.name')).toBe('cookies');
  });

  it('replaces the whole document for an empty path', () => {
    expect(setPath(document, '', 'replaced')).toBe('replaced');
  });

  it('refuses an out-of-range index instead of growing the array', () => {
    expect(() => setPath(document, 'cards.9.name', 'x')).toThrow(/out of range/);
  });

  /* A content editor that can reach __proto__ is a code-execution bug. */
  it('refuses prototype-polluting paths', () => {
    for (const path of ['__proto__.polluted', 'constructor.prototype.x', 'hero.__proto__.x']) {
      expect(() => setPath(document, path, true), path).toThrow(/Unsafe path/);
    }
    expect(({} as Record<string, unknown>).polluted).toBeUndefined();
  });
});

describe('isEqual', () => {
  it('compares structurally', () => {
    expect(isEqual({ a: [1, { b: 2 }] }, { a: [1, { b: 2 }] })).toBe(true);
    expect(isEqual({ a: [1] }, { a: [1, 2] })).toBe(false);
    expect(isEqual({ a: 1 }, { a: 1, b: undefined })).toBe(false);
    expect(isEqual(null, undefined)).toBe(false);
  });
});

describe('serialise', () => {
  it('matches how the repository already stores content', () => {
    expect(serialise({ a: 1 })).toBe('{\n  "a": 1\n}\n');
  });
});

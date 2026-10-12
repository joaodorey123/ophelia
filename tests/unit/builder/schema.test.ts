import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

import { getPath } from '@/lib/builder/paths';
import { ALL_SECTIONS, POST_FIELDS, type Field } from '@/lib/builder/schema';

/**
 * The schema must describe content that actually exists.
 *
 * The builder reads the content files from GitHub at runtime, so a field
 * pointing at a key that has been renamed would only show up as an empty input
 * in production. The checked-out content/ folder is compared directly.
 */
const STOREFRONT = resolve(import.meta.dirname, '../../..');
const available = existsSync(resolve(STOREFRONT, 'content/site.json'));

function load(file: string): unknown {
  return JSON.parse(readFileSync(resolve(STOREFRONT, file), 'utf8')) as unknown;
}

/**
 * Every path a field reads, relative to its file.
 *
 * A list contributes only its own path here; its sub-fields are checked
 * against each row further down, where the rows are actually available.
 */
function leafPaths(fields: Field[], prefix = ''): { path: string; field: Field }[] {
  return fields.map((field) => ({
    path: [prefix, field.path].filter(Boolean).join('.'),
    field,
  }));
}

describe('schema', () => {
  it('gives every section a unique id', () => {
    const ids = ALL_SECTIONS.map((section) => section.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('never points a field at a prototype-polluting path', () => {
    const walk = (fields: Field[]): string[] =>
      fields.flatMap((field) => [field.path, ...(field.kind === 'list' ? walk(field.fields) : [])]);

    for (const path of [...ALL_SECTIONS.flatMap((s) => walk(s.fields)), ...walk(POST_FIELDS)]) {
      for (const segment of path.split('.')) {
        expect(['__proto__', 'constructor', 'prototype']).not.toContain(segment);
      }
    }
  });

  it('only writes files the publish route accepts', () => {
    for (const section of ALL_SECTIONS) {
      expect(section.file, section.id).toMatch(/^content\/[a-z]+\.json$/);
    }
  });

  it.skipIf(!available)('points every field at content that exists', () => {
    for (const section of ALL_SECTIONS) {
      const document = load(section.file);

      for (const { path, field } of leafPaths(section.fields)) {
        const value = path ? getPath(document, path) : document;
        expect(value, `${section.id} → ${section.file}:${path || '(root)'}`).toBeDefined();

        if (field.kind === 'list') {
          expect(Array.isArray(value), `${section.id} → ${path} should be a list`).toBe(true);

          // Each declared sub-field must exist on each row, so editing one row
          // cannot produce a shape different from its siblings.
          for (const [index, item] of (value as unknown[]).entries()) {
            for (const sub of field.fields) {
              if (!sub.path) continue;
              expect(
                getPath(item, sub.path),
                `${section.id} → ${path}[${index}].${sub.path}`,
              ).toBeDefined();
            }
          }
        }
      }
    }
  });

  it.skipIf(!available)('describes every field of a diary article', () => {
    const posts = load('content/posts.json') as Record<string, unknown>[];
    expect(posts.length).toBeGreaterThan(0);

    for (const [index, post] of posts.entries()) {
      for (const field of POST_FIELDS) {
        expect(getPath(post, field.path), `post ${index} → ${field.path}`).toBeDefined();
      }
    }

    // And nothing in the file is left uneditable.
    const described = new Set(POST_FIELDS.map((field) => field.path));
    for (const key of Object.keys(posts[0] ?? {})) {
      expect(described, `posts.json has an uneditable field "${key}"`).toContain(key);
    }
  });

  it.skipIf(!available)('covers every colour and size the theme defines', () => {
    const theme = load('content/theme.json') as {
      colors: Record<string, string>;
      typeScale: Record<string, number>;
    };
    const themeSection = ALL_SECTIONS.find((section) => section.id === 'theme');
    const paths = new Set(themeSection?.fields.map((field) => field.path));

    for (const key of Object.keys(theme.colors)) {
      expect(paths, `theme colour "${key}" is not editable`).toContain(`colors.${key}`);
    }
    for (const key of Object.keys(theme.typeScale)) {
      expect(paths, `theme size "${key}" is not editable`).toContain(`typeScale.${key}`);
    }
  });
});

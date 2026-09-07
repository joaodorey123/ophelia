import { describe, expect, it } from 'vitest';

import { theme, themeStyle, type Theme } from '@/lib/content/theme';

/**
 * The theme layer's contract: an untouched theme must render the handoff's
 * design exactly, and a malformed one must never emit broken CSS.
 */
describe('themeStyle', () => {
  it('emits nothing when every value is the design default', () => {
    const untouched: Theme = {
      colors: {} as Theme['colors'],
      typeScale: {
        hero: 1,
        pageXl: 1,
        page: 1,
        pageSm: 1,
        article: 1,
        product: 1,
        section: 1,
        sectionSm: 1,
        band: 1,
        newsletter: 1,
        quote: 1,
        lede: 1,
      },
      bodyScale: 1,
    };
    expect(themeStyle(untouched)).toBe('');
  });

  it('maps a colour onto every custom property it drives', () => {
    const css = themeStyle({ ...theme, colors: { ...theme.colors, navy: '#123456' } });
    expect(css).toContain('--oph-navy:#123456');
    expect(css).toContain('--oph-ink:#123456');
  });

  it('ignores anything that is not a hex colour', () => {
    for (const bad of ['red', 'rgb(0,0,0)', 'javascript:alert(1)', '#12', '', null]) {
      const css = themeStyle({
        ...theme,
        colors: { ...theme.colors, navy: bad as string },
      });
      expect(css, String(bad)).not.toContain('--oph-navy:');
    }
  });

  it('emits a scale only when it differs from 1', () => {
    const css = themeStyle({
      ...theme,
      typeScale: { ...theme.typeScale, hero: 1.2 },
    });
    expect(css).toContain('--oph-scale-hero:1.2');
    expect(css).not.toContain('--oph-scale-section');
  });

  it('clamps a scale so the site can never be made unreadable', () => {
    const tiny = themeStyle({ ...theme, bodyScale: 0.1 });
    expect(tiny).toContain('--oph-scale-body:0.6');

    const huge = themeStyle({ ...theme, typeScale: { ...theme.typeScale, hero: 99 } });
    expect(huge).toContain('--oph-scale-hero:2');
  });

  it('survives a scale that is not a number', () => {
    const css = themeStyle({
      ...theme,
      bodyScale: 'big' as unknown as number,
    });
    expect(css).not.toContain('--oph-scale-body');
  });

  it('ships defaults that produce no overrides at all', () => {
    // theme.json as committed must be a no-op: the design lives in CSS, and
    // this file only ever records a deliberate deviation from it.
    expect(themeStyle()).toBe('');
  });

  it('emits a colour only once it differs from the design', () => {
    expect(themeStyle({ ...theme, colors: { ...theme.colors, gold: '#8F6B36' } })).toBe('');
    expect(themeStyle({ ...theme, colors: { ...theme.colors, gold: '#aa0000' } })).toContain(
      '--oph-gold:#aa0000',
    );
  });
});

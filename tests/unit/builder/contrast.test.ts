import { describe, expect, it } from 'vitest';

import { checkContrast, contrastRatio, parseHex } from '@/lib/builder/contrast';

describe('parseHex', () => {
  it('accepts both short and long form', () => {
    expect(parseHex('#fff')).toEqual({ r: 255, g: 255, b: 255 });
    expect(parseHex('#1E2F52')).toEqual({ r: 30, g: 47, b: 82 });
  });

  it('rejects anything else', () => {
    for (const bad of ['fff', '#gg0000', 'rgb(0,0,0)', '', '#12345']) {
      expect(parseHex(bad), bad).toBeNull();
    }
  });
});

describe('contrastRatio', () => {
  it('gives 21 for black on white and 1 for a colour on itself', () => {
    expect(contrastRatio('#000000', '#ffffff')).toBeCloseTo(21, 5);
    expect(contrastRatio('#1e2f52', '#1e2f52')).toBeCloseTo(1, 5);
  });

  it('is order independent', () => {
    const a = contrastRatio('#1e2f52', '#fbf8f3');
    const b = contrastRatio('#fbf8f3', '#1e2f52');
    expect(a).toBeCloseTo(b as number, 10);
  });

  it('returns null for an unparseable colour', () => {
    expect(contrastRatio('nope', '#ffffff')).toBeNull();
  });
});

describe('checkContrast', () => {
  /* The handoff states every ink colour clears 4.5:1 on cream and on beige. */
  it('confirms the design palette passes on both grounds', () => {
    for (const ground of ['#fbf8f3', '#f3f0e9']) {
      for (const ink of ['#1e2f52', '#2c3e63', '#3e4f73', '#4a5c85', '#4f6189', '#556790']) {
        const verdict = checkContrast(ink, ground);
        expect(verdict?.passesBody, `${ink} on ${ground} = ${verdict?.ratio}`).toBe(true);
      }
    }
  });

  it('fails a pair that would be unreadable', () => {
    const verdict = checkContrast('#c9c9c9', '#fbf8f3');
    expect(verdict?.passesBody).toBe(false);
    expect(verdict?.passesLarge).toBe(false);
  });

  it('separates the large-text threshold from the body one', () => {
    // Chosen to sit between 3:1 and 4.5:1.
    const verdict = checkContrast('#8a8a8a', '#ffffff');
    expect(verdict?.passesLarge).toBe(true);
    expect(verdict?.passesBody).toBe(false);
  });
});

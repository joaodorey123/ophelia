/**
 * WCAG contrast, so the editor can warn before a colour choice makes the site
 * unreadable.
 *
 * The handoff measured every ink/surface pair and states them as requirements
 * — the sobre hero scrim is called out as "a contrast requirement, not
 * decoration". A tool that lets someone quietly undo that is worse than one
 * with no colour controls at all.
 */

export type Rgb = { r: number; g: number; b: number };

export function parseHex(value: string): Rgb | null {
  const match = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(value.trim());
  if (!match) return null;

  const hex = match[1]!;
  const full =
    hex.length === 3
      ? hex
          .split('')
          .map((character) => character + character)
          .join('')
      : hex;

  return {
    r: parseInt(full.slice(0, 2), 16),
    g: parseInt(full.slice(2, 4), 16),
    b: parseInt(full.slice(4, 6), 16),
  };
}

/** Relative luminance, per WCAG 2.1. */
function luminance({ r, g, b }: Rgb): number {
  const channel = (value: number): number => {
    const scaled = value / 255;
    return scaled <= 0.03928 ? scaled / 12.92 : ((scaled + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

/** Contrast ratio between two colours, 1 to 21. */
export function contrastRatio(foreground: string, background: string): number | null {
  const a = parseHex(foreground);
  const b = parseHex(background);
  if (!a || !b) return null;

  const lighter = Math.max(luminance(a), luminance(b));
  const darker = Math.min(luminance(a), luminance(b));
  return (lighter + 0.05) / (darker + 0.05);
}

export type ContrastVerdict = {
  ratio: number;
  /** 4.5:1 — the AA threshold for body-sized text. */
  passesBody: boolean;
  /** 3:1 — the AA threshold for large text and interface components. */
  passesLarge: boolean;
};

export function checkContrast(foreground: string, background: string): ContrastVerdict | null {
  const ratio = contrastRatio(foreground, background);
  if (ratio === null) return null;
  return {
    ratio: Math.round(ratio * 100) / 100,
    passesBody: ratio >= 4.5,
    passesLarge: ratio >= 3,
  };
}

/**
 * The pairs the site actually renders, so a warning names a real combination
 * rather than an abstract one.
 *
 * `against` is the theme key of the surface the colour sits on; `largeText`
 * marks pairs that only ever appear at display sizes.
 */
export const CONTRAST_PAIRS: {
  ink: string;
  against: string;
  where: string;
  largeText?: boolean;
}[] = [
  { ink: 'inkBody', against: 'cream', where: 'parágrafos sobre o fundo da página' },
  { ink: 'inkBody', against: 'beige', where: 'parágrafos sobre as faixas' },
  { ink: 'muted', against: 'cream', where: 'texto secundário e preços' },
  { ink: 'muted', against: 'beige', where: 'texto secundário sobre as faixas' },
  { ink: 'navy', against: 'cream', where: 'títulos e links' },
  { ink: 'navy', against: 'beige', where: 'títulos sobre as faixas' },
  { ink: 'navy', against: 'heroCard', where: 'título do destaque', largeText: true },
  { ink: 'gold', against: 'white', where: 'estrelas das opiniões', largeText: true },
];

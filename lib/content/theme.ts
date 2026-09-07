import themeJson from '@/content/theme.json';

/**
 * The editable theme layer.
 *
 * Colour and type-size choices the client can change without a developer. The
 * values here override the corresponding CSS custom properties at runtime, so
 * `styles/tokens.css` stays the authoritative record of the design and this is
 * only ever a deliberate deviation from it.
 *
 * Every default matches the handoff exactly, so an untouched theme.json
 * renders the design as drawn.
 */

export type ThemeColorKey =
  | 'navy'
  | 'navyHover'
  | 'cream'
  | 'beige'
  | 'heroCard'
  | 'inkBody'
  | 'muted'
  | 'gold';

/**
 * Which CSS custom properties each editable colour drives, and the value the
 * design already uses.
 *
 * The default is recorded here so the theme can emit a declaration only when
 * the client has actually changed something. Without that, theme.json would
 * permanently shadow styles/tokens.css and a later change to the design would
 * silently have no effect.
 */
const COLOR_TOKENS: Record<ThemeColorKey, { variables: string[]; design: string }> = {
  navy: { variables: ['--oph-navy', '--oph-ink'], design: '#1e2f52' },
  navyHover: { variables: ['--oph-navy-hover'], design: '#2c4370' },
  cream: { variables: ['--oph-cream'], design: '#fbf8f3' },
  beige: { variables: ['--oph-beige'], design: '#f3f0e9' },
  heroCard: { variables: ['--oph-hero-card'], design: '#f7f2e7' },
  inkBody: { variables: ['--oph-ink-body'], design: '#3e4f73' },
  muted: { variables: ['--oph-muted-1'], design: '#4a5c85' },
  gold: { variables: ['--oph-gold'], design: '#8f6b36' },
};

/** The palette as the design draws it — what the builder resets to. */
export const DESIGN_COLORS = Object.fromEntries(
  Object.entries(COLOR_TOKENS).map(([key, token]) => [key, token.design]),
) as Record<ThemeColorKey, string>;

export type DisplaySizeKey =
  | 'hero'
  | 'pageXl'
  | 'page'
  | 'pageSm'
  | 'article'
  | 'product'
  | 'section'
  | 'sectionSm'
  | 'band'
  | 'newsletter'
  | 'quote'
  | 'lede';

export type Theme = {
  colors: Record<ThemeColorKey, string>;
  /** Multiplier per display size. 1 is the handoff's own value. */
  typeScale: Record<DisplaySizeKey, number>;
  /** Multiplier for body copy. */
  bodyScale: number;
};

export const theme = themeJson as Theme;

/** Only #rgb / #rrggbb is accepted: the builder writes nothing else, and a
 *  malformed value would otherwise emit broken CSS. */
function isHex(value: unknown): value is string {
  return typeof value === 'string' && /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i.test(value);
}

/** Clamped so a mistyped scale cannot make the site unreadable. */
function scale(value: unknown): number {
  const number = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(number)) return 1;
  return Math.min(2, Math.max(0.6, number));
}

/**
 * The `:root` overrides for the current theme, as a CSS string.
 *
 * Only values that actually differ from the token layer are emitted, so an
 * untouched theme adds nothing to the document.
 */
export function themeStyle(current: Theme = theme): string {
  const declarations: string[] = [];

  for (const [key, token] of Object.entries(COLOR_TOKENS) as [
    ThemeColorKey,
    (typeof COLOR_TOKENS)[ThemeColorKey],
  ][]) {
    const value = current.colors?.[key];
    if (!isHex(value)) continue;
    if (value.toLowerCase() === token.design.toLowerCase()) continue;
    for (const variable of token.variables) declarations.push(`${variable}:${value}`);
  }

  for (const key of Object.keys(current.typeScale ?? {}) as DisplaySizeKey[]) {
    const value = scale(current.typeScale[key]);
    if (value === 1) continue;
    declarations.push(`--oph-scale-${key}:${value}`);
  }

  const body = scale(current.bodyScale);
  if (body !== 1) declarations.push(`--oph-scale-body:${body}`);

  return declarations.length > 0 ? `:root{${declarations.join(';')}}` : '';
}

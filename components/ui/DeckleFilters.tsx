/**
 * The two torn-edge filters, declared once per document.
 *
 * Every taped photograph references one of these by id; alternating them
 * across adjacent photos is what stops two torn edges looking identical.
 * The SVG itself is zero-sized and hidden from assistive technology.
 *
 * Only the outline is displaced: the noise warps the photo's alpha, and the
 * untouched photo is then cut to that rough shape. Displacing the photo itself
 * shifted every pixel by up to 7px and smeared the whole picture.
 */
export function DeckleFilters() {
  return (
    <svg width="0" height="0" aria-hidden focusable="false" style={{ position: 'absolute' }}>
      <filter id="ophDeckle">
        <feTurbulence
          type="fractalNoise"
          baseFrequency="0.018"
          numOctaves="4"
          seed="7"
          result="n"
        />
        <feDisplacementMap
          in="SourceAlpha"
          in2="n"
          scale="7"
          xChannelSelector="R"
          yChannelSelector="G"
          result="edge"
        />
        <feComposite in="SourceGraphic" in2="edge" operator="in" />
      </filter>
      <filter id="ophDeckle2">
        <feTurbulence
          type="fractalNoise"
          baseFrequency="0.022"
          numOctaves="4"
          seed="19"
          result="n"
        />
        <feDisplacementMap
          in="SourceAlpha"
          in2="n"
          scale="6"
          xChannelSelector="R"
          yChannelSelector="G"
          result="edge"
        />
        <feComposite in="SourceGraphic" in2="edge" operator="in" />
      </filter>
    </svg>
  );
}

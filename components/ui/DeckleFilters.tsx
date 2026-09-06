/**
 * The two torn-edge filters, declared once per document.
 *
 * Every taped photograph references one of these by id; alternating them
 * across adjacent photos is what stops two torn edges looking identical.
 * The SVG itself is zero-sized and hidden from assistive technology.
 */
export function DeckleFilters() {
  return (
    <svg width="0" height="0" aria-hidden focusable="false" style={{ position: 'absolute' }}>
      <filter id="ophDeckle">
        <feTurbulence type="fractalNoise" baseFrequency="0.018" numOctaves="4" seed="7" result="n" />
        <feDisplacementMap
          in="SourceGraphic"
          in2="n"
          scale="7"
          xChannelSelector="R"
          yChannelSelector="G"
        />
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
          in="SourceGraphic"
          in2="n"
          scale="6"
          xChannelSelector="R"
          yChannelSelector="G"
        />
      </filter>
    </svg>
  );
}

import Image from 'next/image';

import styles from './Flower.module.css';

/**
 * The client's watercolour flowers and cut-out food photographs, used as
 * decoration across the site — pinned to photo corners in place of tape, and
 * scattered at the edges of sections.
 *
 * Always decorative: empty alt, hidden from assistive technology, and never
 * capturing a click meant for what sits underneath.
 */
const FLOWERS = {
  miosotis: [772, 1134],
  cosmos: [578, 1132],
  campainha: [497, 1132],
  'margarida-verde': [864, 734],
  'flor-branca': [864, 856],
  'flor-palida': [864, 838],
  papoila: [539, 1134],
  esporas: [330, 1134],
  prado: [1080, 1350],
  anemona: [507, 540],
  'flor-azul': [493, 480],
  margarida: [461, 416],
  fresia: [465, 1134],
  haste: [393, 1400],
  gipsofila: [800, 1134],
  ramo: [742, 1133],
  limonada: [472, 840],
  'cookie-sanduiche': [860, 558],
  mel: [755, 873],
  'cookie-maos': [747, 847],
  bowl: [860, 912],
  'cookie-caixa': [767, 916],
  batido: [717, 799],
  croissants: [730, 721],
  pavlova: [919, 781],
  'pavlova-mao': [858, 772],
} as const;

export type FlowerName = keyof typeof FLOWERS;

/** The flower heads that read well at tape size, pinned to a corner. */
export const PIN_FLOWERS: FlowerName[] = ['flor-azul', 'anemona', 'margarida', 'flor-branca'];

export function Flower({
  name,
  width,
  className,
  style,
}: {
  name: FlowerName;
  /** Rendered width in CSS pixels; the height follows the artwork. */
  width: number;
  className?: string;
  style?: React.CSSProperties;
}) {
  const [w, h] = FLOWERS[name];
  return (
    <Image
      className={`${styles.flower} ${className ?? ''}`}
      src={`/decor/${name}.webp`}
      alt=""
      aria-hidden
      width={width}
      height={Math.round((width * h) / w)}
      // CSS often draws decorations larger than `width`; leave headroom so
      // they are never stretched.
      sizes={`${Math.round(width * 1.4)}px`}
      style={style}
    />
  );
}

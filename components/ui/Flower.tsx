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
  miosotis: [490, 720],
  cosmos: [368, 720],
  campainha: [316, 720],
  'margarida-verde': [720, 612],
  'flor-branca': [720, 713],
  'flor-palida': [720, 698],
  papoila: [342, 720],
  esporas: [210, 720],
  prado: [1080, 1350],
  anemona: [507, 540],
  'flor-azul': [493, 480],
  margarida: [461, 416],
  fresia: [295, 720],
  haste: [202, 720],
  gipsofila: [508, 720],
  ramo: [472, 720],
  limonada: [405, 720],
  'cookie-sanduiche': [720, 467],
  mel: [623, 720],
  'cookie-maos': [635, 720],
  bowl: [679, 720],
  'cookie-caixa': [603, 720],
  batido: [646, 720],
  croissants: [720, 711],
  pavlova: [720, 612],
  'pavlova-mao': [720, 648],
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
      sizes={`${width}px`}
      style={style}
    />
  );
}

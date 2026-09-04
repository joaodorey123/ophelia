import type { Metadata } from 'next';
import Image from 'next/image';

import { ButtonLink } from '@/components/ui/Button';
import { ImageSlot } from '@/components/ui/ImageSlot';
import { FavouriteCard, PantryCard } from '@/components/product/ProductCard';
import { Kicker, SectionHeader } from '@/components/ui/Type';
import { Watercolour } from '@/components/ui/Watercolour';
import { catalogue } from '@/lib/commerce';
import type { Product } from '@/lib/commerce/types';
import { pageMetadata } from '@/lib/seo/metadata';
import { SITE } from '@/lib/site';

import styles from './home.module.css';
import sections from '@/styles/sections.module.css';

export const metadata: Metadata = pageMetadata({
  title: `${SITE.name} — ${SITE.tagline}`,
  description:
    'Cookies feitas por encomenda, mercearia da Serra da Estrela e presentes preparados à mão por uma família da Guarda. Loja no Estoril.',
  path: '/',
});

/** Public catalogue content — safe to cache and revalidate periodically. */
export const revalidate = 900;

const FAVOURITE_HANDLES = [
  'ophelia-cookies',
  'ophelia-cookiebrownie',
  'ophelia-cookie-banoffee',
  'granola-da-ophelia',
];

const PANTRY_HANDLES = [
  'azeite-da-ophelia',
  'mel-de-rosmaninho',
  'doce-de-pera-e-gengibre',
  'doce-de-maca-e-vinho-do-porto',
];

async function loadByHandle(handles: string[]): Promise<Product[]> {
  const products = await Promise.all(handles.map((handle) => catalogue().getProduct(handle)));
  return products.filter((product): product is Product => product !== null);
}

export default async function HomePage() {
  const [favourites, pantry] = await Promise.all([
    loadByHandle(FAVOURITE_HANDLES),
    loadByHandle(PANTRY_HANDLES),
  ]);

  return (
    <>
      {/* 1 — Hero */}
      <section className={styles.hero} aria-labelledby="hero-title">
        <div className={styles.heroMedia}>
          <ImageSlot
            image={{
              url: '/photography/hero-cookie-jars.jpg',
              altText: 'Cookies em jarros de vidro sobre um balcão',
              width: 1920,
              height: 1272,
            }}
            brief="Mesa Ophelia — cookies, bolos, mãos a servir (editorial, luz natural)"
            fill
            priority
            briefAlign="top"
            sizes="100vw"
          />
        </div>
        <div className={styles.heroScrim} />

        <div className={`${styles.heroContent} oph-animate-fade`}>
          <span className={styles.heroKicker}>Ophelia · Guarda · Estoril</span>
          <h1 id="hero-title" className={styles.heroTitle}>
            As melhores memórias constroem-se à volta de uma mesa.
          </h1>
          <p className={styles.heroLead}>
            Somos uma família da Guarda que cresceu entre almoços de domingo, bolos ainda quentes e
            conversas que não têm hora para acabar. A Ophelia é isso, embalado de azul e branco.
          </p>
          <div className={styles.heroActions}>
            <ButtonLink href="/quem-somos" variant="cream" size="lg">
              Descobrir Ophelia
            </ButtonLink>
            <ButtonLink href="/comprar/cookies" variant="outlineCream" size="lg">
              Comprar agora
            </ButtonLink>
          </div>
        </div>
      </section>

      {/* 2 — Os favoritos da Ophelia */}
      <section className={sections.section} aria-labelledby="favoritos-title">
        <Watercolour placement="topRight" />
        <div className={sections.sectionGap}>
          <SectionHeader
            kicker="A nossa curadoria"
            title="Os favoritos da Ophelia"
            titleId="favoritos-title"
            action={
              <ButtonLink href="/comprar/cookies" variant="link">
                Ver tudo
              </ButtonLink>
            }
          />
        </div>
        <div className={sections.gridFavourites}>
          {favourites.map((product, index) => (
            <FavouriteCard key={product.id} product={product} priority={index < 2} />
          ))}
        </div>
      </section>

      {/* 3 — As famosas Cookies da Ophelia */}
      <section
        className={`${sections.section} ${sections.groundBlue}`}
        data-ground="blue"
        aria-labelledby="cookies-band-title"
      >
        <div className={sections.twoColumn}>
          <div>
            <Kicker ground="blue">Sem farinha, com muito creme</Kicker>
            <h2 id="cookies-band-title" className={styles.bandTitle}>
              As famosas Cookies da Ophelia
            </h2>
            <p className={styles.bandLead}>
              Crocantes por fora, muito cremosas por dentro. Feitas por encomenda, embaladas uma a uma
              em saquinhos de celofane, seladas com o autocolante da Ophelia e arrumadas nas nossas
              caixas azuis.
            </p>
            <ul className={styles.flavourChips}>
              {['Tradicional', 'Red Velvet', 'Cacau', 'Limão'].map((flavour) => (
                <li key={flavour} className={styles.flavourChip}>
                  {flavour}
                </li>
              ))}
            </ul>
            <ButtonLink href="/comprar/cookies" variant="cream" size="lg">
              Ver todas as cookies
            </ButtonLink>
          </div>

          <div className={styles.mosaic}>
            <div className={styles.mosaicTall}>
              <ImageSlot brief="Cookie partida ao meio, creme a escorrer" fill sizes="(max-width: 767px) 50vw, 25vw" />
            </div>
            <div className={styles.mosaicSmall}>
              <ImageSlot brief="Caixa azul Ophelia fechada com fita" fill sizes="(max-width: 767px) 50vw, 25vw" />
            </div>
            <div className={styles.mosaicSmall}>
              <ImageSlot brief="Cookies embaladas com autocolante" fill sizes="(max-width: 767px) 50vw, 25vw" />
            </div>
          </div>
        </div>
      </section>

      {/* 4 — Mercearia da Ophelia */}
      <section
        className={`${sections.section} ${sections.groundSand}`}
        aria-labelledby="mercearia-title"
      >
        <div className={sections.sectionGapTight}>
          <SectionHeader
            kicker="Da Serra da Estrela para a sua mesa"
            title="Mercearia da Ophelia"
            titleId="mercearia-title"
            aside="Azeite dos nossos olivais, mel de rosmaninho e de carvalho, doces feitos em panela pequena. A despensa da nossa família."
          />
        </div>
        <div className={sections.gridPantry}>
          {pantry.map((product) => (
            <PantryCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* 5 — Gifting teaser */}
      <section
        className={`${sections.section} ${sections.twoColumn} ${sections.twoColumnWide}`}
        aria-labelledby="presentes-title"
      >
        <div className={styles.giftMedia}>
          <ImageSlot
            brief="Presente Ophelia a ser montado: cookies, café, mel, vela, cartão"
            fill
            sizes="(max-width: 767px) 100vw, 50vw"
          />
        </div>
        <div>
          <Image
            src="/brand/cesto.png"
            alt=""
            aria-hidden="true"
            width={220}
            height={220}
            className={styles.giftMark}
          />
          <h2 id="presentes-title" className={styles.giftTitle}>
            Cria o presente. Nós tratamos do resto.
          </h2>
          <p className={styles.giftLead}>
            Escolhe a caixa, junta cookies, café, mel, uma vela e um cartão escrito à mão. Preparamos
            tudo por encomenda, com o cuidado de quem oferece a um amigo.
          </p>
          <ul className={styles.giftList}>
            <li>Pequeno mimo · Cookies + cartão</li>
            <li>Para o pequeno-almoço · Granola + café + mel</li>
            <li>Presente especial · Cookies + café + mel + vela + cartão</li>
          </ul>
          <ButtonLink href="/comprar/presentes" variant="primary" size="lg">
            Ver os presentes
          </ButtonLink>
        </div>
      </section>

      {/* 6 — Shipping band */}
      <section
        className={`${sections.band} ${sections.groundBlue} ${styles.shipping}`}
        data-ground="blue"
        aria-label="Expedição e entrega"
      >
        <div>
          <h2 className={styles.shippingTitle}>Expedição</h2>
          <p className={styles.shippingCopy}>
            Segunda a quinta-feira. Encomendas após as 12:00 de quinta seguem na segunda seguinte.
          </p>
        </div>
        <div>
          <h2 className={styles.shippingTitle}>Entrega</h2>
          <p className={styles.shippingCopy}>
            Até 2 dias úteis. Sem expedições ao fim de semana.
          </p>
        </div>
        <div>
          <h2 className={styles.shippingTitle}>Encomendas grandes</h2>
          <p className={styles.shippingCopy}>
            Presentes de empresa e eventos podem precisar de mais tempo de preparação. Falamos
            contigo.
          </p>
        </div>
      </section>
    </>
  );
}

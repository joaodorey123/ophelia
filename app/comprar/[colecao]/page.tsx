import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { ButtonLink } from '@/components/ui/Button';
import { ImageSlot } from '@/components/ui/ImageSlot';
import { CategoryCard, PantryCard } from '@/components/product/ProductCard';
import { JsonLd } from '@/components/seo/JsonLd';
import { Kicker } from '@/components/ui/Type';
import { Watercolour } from '@/components/ui/Watercolour';
import { catalogue } from '@/lib/commerce';
import type { ProductSortKey } from '@/lib/commerce/types';
import { COLLECTION_HANDLES, collectionPath, PRIMARY_NAV, SHOP_FOOTER_NAV } from '@/lib/navigation';
import { clampDescription, pageMetadata } from '@/lib/seo/metadata';
import { breadcrumbSchema, collectionSchema } from '@/lib/seo/structured-data';

import styles from './collection.module.css';
import sections from '@/styles/sections.module.css';

export const revalidate = 900;

/** Pre-render the known collections; anything else 404s. */
export function generateStaticParams() {
  return COLLECTION_HANDLES.map((colecao) => ({ colecao }));
}

type PageProps = {
  params: Promise<{ colecao: string }>;
  searchParams: Promise<{ ordenar?: string }>;
};

/**
 * Sorting is a view of the same set, so every sorted view canonicalises back
 * to the unsorted collection URL. That keeps one indexable URL per collection.
 */
const SORTS: { key: string; label: string; sortKey: ProductSortKey; reverse: boolean }[] = [
  { key: 'destaque', label: 'Em destaque', sortKey: 'BEST_SELLING', reverse: false },
  { key: 'preco-asc', label: 'Preço: mais baixo', sortKey: 'PRICE', reverse: false },
  { key: 'preco-desc', label: 'Preço: mais alto', sortKey: 'PRICE', reverse: true },
  { key: 'nome', label: 'Nome', sortKey: 'TITLE', reverse: false },
];

function resolveSort(value: string | undefined) {
  return SORTS.find((sort) => sort.key === value) ?? SORTS[0]!;
}

/**
 * The kicker reads "Comprar · Cookies" — the section's short nav label, not the
 * collection's full editorial title.
 */
function shortName(handle: string, fallback: string): string {
  const target = collectionPath(handle);
  const match =
    PRIMARY_NAV.find((item) => item.href === target) ??
    SHOP_FOOTER_NAV.find((item) => item.href === target);
  return match?.label ?? fallback;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { colecao } = await params;
  const collection = await catalogue().getCollection(colecao);
  if (!collection) return pageMetadata({ title: 'Coleção não encontrada', description: '', path: collectionPath(colecao), noIndex: true });

  return pageMetadata({
    title: collection.seo.title ?? collection.title,
    description: clampDescription(collection.seo.description ?? collection.description),
    path: collectionPath(collection.handle),
    image: collection.image?.url ?? null,
  });
}

export default async function CollectionPage({ params, searchParams }: PageProps) {
  const { colecao } = await params;
  const { ordenar } = await searchParams;
  const sort = resolveSort(ordenar);

  const result = await catalogue().getCollectionProducts(colecao, {
    sortKey: sort.sortKey,
    reverse: sort.reverse,
    first: 48,
  });

  if (!result) notFound();

  const { collection, products } = result;
  const isCookies = collection.handle === 'cookies';
  const label = shortName(collection.handle, collection.title);

  const crumbs = [
    { name: 'Ophelia', path: '/' },
    { name: label, path: collectionPath(collection.handle) },
  ];

  return (
    <>
      <JsonLd data={[breadcrumbSchema(crumbs), collectionSchema(collection, products)]} />

      <div className={styles.crumbs}>
        <Breadcrumbs crumbs={crumbs} />
      </div>

      <section className={styles.header} aria-labelledby="collection-title">
        <Watercolour placement="topLeft" priority />
        <div className={sections.headerBlock}>
          <Kicker>Comprar · {label}</Kicker>
          <h1 id="collection-title" className={styles.title}>
            {collection.title}
          </h1>
          {collection.description ? <p className={styles.lead}>{collection.description}</p> : null}
        </div>
      </section>

      {products.length > 0 ? (
        <>
          <div className={styles.toolbar}>
            <span className={styles.count}>
              {products.length} {products.length === 1 ? 'produto' : 'produtos'}
            </span>
            {/* Sorting a single product is noise. */}
            {products.length > 1 ? (
            <nav className={styles.sort} aria-label="Ordenar produtos">
              {SORTS.map((option) => {
                const isActive = option.key === sort.key;
                return (
                  <Link
                    key={option.key}
                    href={
                      option.key === 'destaque'
                        ? collectionPath(collection.handle)
                        : `${collectionPath(collection.handle)}?ordenar=${option.key}`
                    }
                    scroll={false}
                    rel="nofollow"
                    className={[styles.sortLink, isActive ? styles.sortLinkActive : undefined]
                      .filter(Boolean)
                      .join(' ')}
                    aria-current={isActive ? 'true' : undefined}
                  >
                    {option.label}
                  </Link>
                );
              })}
            </nav>
            ) : null}
          </div>

          <section className={sections.sectionTight} aria-label={`Produtos em ${collection.title}`}>
            <div className={isCookies ? sections.gridCategory : sections.gridCollection}>
              {products.map((product, index) =>
                isCookies ? (
                  <CategoryCard
                    key={product.id}
                    product={product}
                    priority={index < 2}
                    headingLevel={2}
                  />
                ) : (
                  <PantryCard key={product.id} product={product} headingLevel={2} />
                ),
              )}
            </div>
          </section>
        </>
      ) : (
        <section className={styles.empty}>
          <h2 className={styles.emptyTitle}>Ainda não há nada por aqui.</h2>
          <p className={styles.emptyCopy}>
            Esta secção está a ser preparada. Enquanto isso, começa pelas cookies — é sempre por aí
            que começamos.
          </p>
          <ButtonLink href="/comprar/cookies" variant="primary" size="lg">
            Ver as cookies
          </ButtonLink>
        </section>
      )}

      {isCookies ? (
        <>
          {/* "É o presente perfeito." — copy from the client's product document. */}
          <section
            className={`${sections.section} ${sections.groundSand} ${sections.twoColumn}`}
            aria-labelledby="presente-perfeito-title"
          >
            <div>
              <h2 id="presente-perfeito-title" className={styles.giftTitle}>
                É o presente perfeito.
              </h2>
              <p className={styles.giftLead}>
                Cada caixa é preparada por encomenda. As cookies vão embaladas individualmente em
                saquinhos de celofane, seladas com o autocolante da Ophelia e arrumadas nas nossas
                caixas azuis ou brancas.
              </p>
              <ol className={styles.steps}>
                <li className={styles.step}>
                  <span className={styles.stepNumber} aria-hidden="true">
                    01
                  </span>
                  <span className={styles.stepCopy}>
                    Embaladas uma a uma, ainda no dia em que são feitas
                  </span>
                </li>
                <li className={styles.step}>
                  <span className={styles.stepNumber} aria-hidden="true">
                    02
                  </span>
                  <span className={styles.stepCopy}>Seladas com o autocolante da Ophelia</span>
                </li>
                <li className={styles.step}>
                  <span className={styles.stepNumber} aria-hidden="true">
                    03
                  </span>
                  <span className={styles.stepCopy}>
                    Arrumadas na caixa azul, com cartão escrito à mão se quiseres
                  </span>
                </li>
              </ol>
            </div>
            <div className={styles.giftMedia}>
              <ImageSlot
                brief="Caixa azul Ophelia aberta, cookies embaladas e cartão"
                fill
                sizes="(max-width: 767px) 100vw, 50vw"
              />
            </div>
          </section>

          <section
            className={`${sections.section} ${sections.groundBlue} ${sections.centred}`}
            data-ground="blue"
            aria-labelledby="personalizadas-title"
          >
            <Kicker ground="blue">Casamentos · Aniversários · Empresas · Batizados</Kicker>
            <h2 id="personalizadas-title" className={styles.personalizadasTitle}>
              Cookies personalizadas para o teu dia
            </h2>
            <p className={styles.personalizadasLead}>
              Personalizamos o autocolante com a tua imagem, desenho ou logótipo. Encomenda mínima de
              10 unidades — 10 · €35, 25 · €87, 35 · €122, 50 · €175.
            </p>
            <ButtonLink href="/personalizadas" variant="cream" size="xl">
              Personalizar as minhas cookies
            </ButtonLink>
          </section>
        </>
      ) : null}
    </>
  );
}

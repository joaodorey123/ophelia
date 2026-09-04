import type { Metadata } from 'next';

import { EnquiryForm, type EnquiryField } from '@/components/forms/EnquiryForm';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { ButtonLink } from '@/components/ui/Button';
import { ImageSlot } from '@/components/ui/ImageSlot';
import { JsonLd } from '@/components/seo/JsonLd';
import { Kicker } from '@/components/ui/Type';
import { Watercolour } from '@/components/ui/Watercolour';
import { catalogue } from '@/lib/commerce';
import { formatMoney } from '@/lib/format';
import { productPath } from '@/lib/navigation';
import { sizeSteps } from '@/lib/product';
import { pageMetadata } from '@/lib/seo/metadata';
import { breadcrumbSchema } from '@/lib/seo/structured-data';
import { SITE } from '@/lib/site';

import styles from './personalizadas.module.css';
import sections from '@/styles/sections.module.css';

export const revalidate = 900;

export const metadata: Metadata = pageMetadata({
  title: 'Cookies personalizadas',
  description:
    'Personalizamos o autocolante das nossas cookies com a tua imagem, desenho ou logótipo. Para casamentos, aniversários, batizados e eventos de empresa. Encomenda mínima de 10 unidades.',
  path: '/personalizadas',
});

const crumbs = [
  { name: 'Ophelia', path: '/' },
  { name: 'Cookies personalizadas', path: '/personalizadas' },
];

const PRODUCT_HANDLE = 'cookies-personalizadas';

const FIELDS: EnquiryField[] = [
  { name: 'nome', label: 'Nome', type: 'text', required: true, autoComplete: 'name' },
  { name: 'email', label: 'Email', type: 'email', required: true, autoComplete: 'email' },
  { name: 'telefone', label: 'Telefone', type: 'tel', autoComplete: 'tel' },
  {
    name: 'ocasiao',
    label: 'Ocasião',
    type: 'select',
    required: true,
    options: ['Casamento', 'Aniversário', 'Batizado', 'Evento de empresa', 'Outro'],
  },
  {
    name: 'quantidade',
    label: 'Quantidade',
    type: 'number',
    required: true,
    min: 10,
    help: 'Encomenda mínima de 10 unidades.',
  },
  { name: 'data', label: 'Data de entrega pretendida', type: 'date' },
  {
    name: 'mensagem',
    label: 'A tua ideia para o autocolante',
    type: 'textarea',
    full: true,
    placeholder: 'Descreve a imagem, o desenho ou o logótipo que queres no autocolante.',
  },
];

export default async function PersonalizadasPage() {
  const product = await catalogue().getProduct(PRODUCT_HANDLE);
  const ladder = product ? sizeSteps(product) : [];

  return (
    <>
      <JsonLd data={breadcrumbSchema(crumbs)} />

      <div style={{ padding: '22px var(--oph-section-px) 0' }}>
        <Breadcrumbs crumbs={crumbs} />
      </div>

      <section className={styles.hero} aria-labelledby="personalizadas-title">
        <Watercolour placement="topLeft" priority />
        <div className={sections.headerBlock}>
          <Kicker>Casamentos · Aniversários · Empresas · Batizados</Kicker>
          <h1 id="personalizadas-title" className={styles.title}>
            Cookies personalizadas para o teu dia
          </h1>
          <p className={styles.lead}>
            Personalizamos o autocolante com a tua imagem, desenho ou logótipo. Cada caixa é
            preparada sob encomenda, com um mínimo de 10 unidades e um mix de sabores.
          </p>

          {ladder.length > 0 ? (
            <ul className={styles.ladder} aria-label="Tamanhos e preços">
              {ladder.map((step) => (
                <li key={step.label} className={styles.ladderItem}>
                  <span className={styles.ladderSize}>{step.label}</span>
                  <span className={styles.ladderPrice}>{formatMoney(step.variant.price)}</span>
                </li>
              ))}
            </ul>
          ) : null}

          {product ? (
            <ButtonLink href={productPath(product.handle)} variant="primary" size="lg">
              Encomendar cookies personalizadas
            </ButtonLink>
          ) : null}
        </div>
      </section>

      <section
        className={`${sections.section} ${sections.groundSand} ${sections.twoColumn}`}
        aria-labelledby="personalizadas-como"
      >
        <div>
          <h2 id="personalizadas-como" className={styles.stepsTitle}>
            Como funciona
          </h2>
          <ol className={styles.steps}>
            <li className={styles.step}>
              <span className={styles.stepNumber} aria-hidden="true">
                01
              </span>
              <span className={styles.stepCopy}>
                Conta-nos a ocasião, a quantidade e a data. Respondemos com a proposta.
              </span>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber} aria-hidden="true">
                02
              </span>
              <span className={styles.stepCopy}>
                Envias a imagem, o desenho ou o logótipo e preparamos o autocolante.
              </span>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber} aria-hidden="true">
                03
              </span>
              <span className={styles.stepCopy}>
                Aprovas a prova final. Só depois é que fazemos as cookies.
              </span>
            </li>
          </ol>
        </div>
        <div className={styles.media}>
          <ImageSlot
            brief="Cookies com autocolante personalizado de casamento"
            fill
            sizes="(max-width: 767px) 100vw, 50vw"
          />
        </div>
      </section>

      <section className={sections.section} aria-labelledby="personalizadas-form-title">
        <Kicker>Pedido de personalização</Kicker>
        <h2 id="personalizadas-form-title" className={styles.formTitle}>
          Personalizar as minhas cookies
        </h2>
        <p className={styles.formLead}>
          Preenche o formulário com a tua ideia e respondemos com a proposta e os próximos passos.
        </p>

        <EnquiryForm
          type="personalizadas"
          fields={FIELDS}
          submitLabel="Enviar pedido"
          successMessage="Recebemos o teu pedido. Respondemos por email com a proposta e os próximos passos."
        />

        <div className={styles.uploadNote}>
          <h3 className={styles.uploadTitle}>Envio da imagem</h3>
          <p className={styles.uploadCopy}>
            Descreve a tua ideia no formulário e enviamos-te por email o link para carregares o
            ficheiro. O carregamento directo no site fica disponível quando o serviço de
            armazenamento estiver ligado — até lá, podes responder ao nosso email com a imagem em
            anexo, ou escrever-nos para <a href={`mailto:${SITE.email}`}>{SITE.email}</a>.
          </p>
        </div>
      </section>
    </>
  );
}

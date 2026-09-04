import type { Metadata } from 'next';

import { EnquiryForm, type EnquiryField } from '@/components/forms/EnquiryForm';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { ImageSlot } from '@/components/ui/ImageSlot';
import { JsonLd } from '@/components/seo/JsonLd';
import { Kicker } from '@/components/ui/Type';
import { Watercolour } from '@/components/ui/Watercolour';
import { pageMetadata } from '@/lib/seo/metadata';
import { breadcrumbSchema } from '@/lib/seo/structured-data';
import { SITE } from '@/lib/site';

import styles from './eventos.module.css';
import sections from '@/styles/sections.module.css';

export const metadata: Metadata = pageMetadata({
  title: 'Eventos',
  description:
    'A Ophelia começou em 2019 como empresa de eventos na Guarda: casamentos, aniversários, jantares entre amigos e eventos de empresa. Conta-nos o que estás a preparar.',
  path: '/eventos',
});

const crumbs = [
  { name: 'Ophelia', path: '/' },
  { name: 'Eventos', path: '/eventos' },
];

/**
 * Field set from the handoff's own list (Known gaps → Eventos page + enquiry
 * form: Nome, Email, Tipo de evento, Data, Número de pessoas, Localização,
 * Mensagem).
 */
const FIELDS: EnquiryField[] = [
  { name: 'nome', label: 'Nome', type: 'text', required: true, autoComplete: 'name' },
  { name: 'email', label: 'Email', type: 'email', required: true, autoComplete: 'email' },
  { name: 'telefone', label: 'Telefone', type: 'tel', autoComplete: 'tel' },
  {
    name: 'tipoEvento',
    label: 'Tipo de evento',
    type: 'select',
    required: true,
    options: [
      'Casamento',
      'Aniversário',
      'Batizado',
      'Evento de empresa',
      'Jantar entre amigos',
      'Outro',
    ],
  },
  { name: 'data', label: 'Data', type: 'date' },
  { name: 'pessoas', label: 'Número de pessoas', type: 'number', min: 1 },
  { name: 'localizacao', label: 'Localização', type: 'text' },
  {
    name: 'mensagem',
    label: 'Mensagem',
    type: 'textarea',
    required: true,
    full: true,
    placeholder: 'Conta-nos o que estás a preparar.',
  },
];

export default function EventosPage() {
  return (
    <>
      <JsonLd data={breadcrumbSchema(crumbs)} />

      <div style={{ padding: '22px var(--oph-section-px) 0' }}>
        <Breadcrumbs crumbs={crumbs} />
      </div>

      <section className={styles.hero} aria-labelledby="eventos-title">
        <Watercolour placement="topLeft" priority />
        <div className={sections.headerBlock}>
          <Kicker>Casamentos · Aniversários · Empresas · Batizados</Kicker>
          <h1 id="eventos-title" className={styles.title}>
            Falamos sobre o teu evento
          </h1>
          <p className={styles.lead}>
            A Ophelia nasceu em 2019 como uma pequena empresa de eventos na Guarda. Organizámos
            eventos corporativos, festas de aniversário, casamentos e jantares entre amigos — e
            continuamos a fazê-lo.
          </p>
        </div>
      </section>

      <section
        className={`${sections.section} ${sections.groundSand} ${sections.twoColumn}`}
        aria-labelledby="eventos-oferta"
      >
        <div>
          <h2 id="eventos-oferta" className={styles.offerTitle}>
            O que preparamos
          </h2>
          <p className={styles.offerCopy}>
            Cada evento é preparado por encomenda. Falamos contigo sobre o dia, as pessoas e o que
            gostavas de pôr na mesa, e respondemos com uma proposta.
          </p>
          <ul className={styles.offerList}>
            <li>
              <span className={styles.offerMark} aria-hidden="true">
                01
              </span>
              <span>Cookies personalizadas com o teu autocolante, a partir de 10 unidades</span>
            </li>
            <li>
              <span className={styles.offerMark} aria-hidden="true">
                02
              </span>
              <span>Bolos e sobremesas feitos na nossa cozinha do Estoril</span>
            </li>
            <li>
              <span className={styles.offerMark} aria-hidden="true">
                03
              </span>
              <span>Presentes de empresa e lembranças para os convidados</span>
            </li>
          </ul>
        </div>
        <div className={styles.offerMedia}>
          <ImageSlot
            brief="Mesa posta de evento Ophelia, velas e caixas azuis"
            fill
            sizes="(max-width: 767px) 100vw, 50vw"
          />
        </div>
      </section>

      <section className={sections.section} aria-labelledby="eventos-form-title">
        <Kicker>Pedido de informação</Kicker>
        <h2 id="eventos-form-title" className={styles.formTitle}>
          Falar sobre o meu evento
        </h2>
        <p className={styles.formLead}>
          Preenche o formulário e respondemos com uma proposta. Encomendas grandes e presentes de
          empresa podem precisar de mais tempo de preparação.
        </p>

        <EnquiryForm
          type="evento"
          fields={FIELDS}
          submitLabel="Enviar pedido"
          successMessage="Recebemos o teu pedido. Respondemos por email assim que possível."
        />

        <address className={styles.contactAside}>
          Preferes falar connosco directamente? <a href={`mailto:${SITE.email}`}>{SITE.email}</a> ·{' '}
          <a href={`tel:${SITE.phone}`}>{SITE.phoneDisplay}</a>
        </address>
      </section>
    </>
  );
}

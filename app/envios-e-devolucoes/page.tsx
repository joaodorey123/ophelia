import type { Metadata } from 'next';

import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { JsonLd } from '@/components/seo/JsonLd';
import { Kicker } from '@/components/ui/Type';
import { DELIVERY_ESTIMATE, SHIPPING_FULL } from '@/lib/content/shipping';
import { pageMetadata } from '@/lib/seo/metadata';
import { breadcrumbSchema } from '@/lib/seo/structured-data';
import { SITE } from '@/lib/site';

import styles from '../legal.module.css';

export const metadata: Metadata = pageMetadata({
  title: 'Envios e devoluções',
  description:
    'Expedimos de segunda a quinta-feira, com entrega até 2 dias úteis. Política de entrega, receção da encomenda e devoluções da Ophelia.',
  path: '/envios-e-devolucoes',
});

const crumbs = [
  { name: 'Ophelia', path: '/' },
  { name: 'Envios e devoluções', path: '/envios-e-devolucoes' },
];

/**
 * Copy verbatim from the client's "Termos e Condições + Políticas de
 * Privacidade" document. Nothing here is paraphrased into a stronger promise
 * than the client made.
 */
export default function ShippingPage() {
  return (
    <>
      <JsonLd data={breadcrumbSchema(crumbs)} />
      <article className={styles.page}>
        <Breadcrumbs crumbs={crumbs} />
        <Kicker>Informação</Kicker>
        <h1 className={styles.title}>Envios e devoluções</h1>
        <p className={styles.updated}>
          Documento fornecido pela {SITE.legalName} ({SITE.taxId}).
        </p>

        <section className={styles.section}>
          <h2 className={styles.heading}>Expedição</h2>
          <p className={styles.body}>{SHIPPING_FULL}</p>
          <p className={styles.body}>{DELIVERY_ESTIMATE}</p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.heading}>Política de entrega</h2>
          <p className={styles.body}>
            A Ophelia honrará as encomendas recebidas online até ao limite dos stocks disponíveis. Na
            falta de disponibilidade do produto ou serviço, a Ophelia compromete-se a informar o
            cliente logo que lhe seja possível.
          </p>
          <p className={styles.body}>
            As encomendas são entregues por empresas de correio ou outras empresas que efetuem
            entregas. A encomenda considera-se entregue quando a transportadora a entrega ao cliente
            e este assina o documento de receção. É da responsabilidade do cliente verificar o estado
            das embalagens no momento da receção e indicar quaisquer anomalias na nota de entrega —
            condição essencial, sem a qual não será aceite qualquer reclamação por danos de
            transporte.
          </p>
          <p className={styles.body}>
            Assim que o consumidor toma posse dos bens, o risco de perda ou dano é transferido para
            ele. Por isso é importante:
          </p>
          <ul className={styles.list}>
            <li>Não ceder à pressão dos entregadores e examinar os bens com o tempo necessário.</li>
            <li>
              Não assinar a nota de entrega antes de verificar o estado das caixas e, se possível, da
              mercadoria.
            </li>
            <li>
              Rejeitar os bens e indicar explicitamente as reservas na nota de entrega, caso não
              estejam conformes ou tenham sido danificados no transporte.
            </li>
          </ul>
          <p className={styles.body}>
            A Ophelia não se responsabiliza por atrasos na entrega atribuíveis a terceiros
            (transportadora, greves, condições climatéricas). Para evitar incidências, garanta que
            está alguém na morada indicada para receber a encomenda. A Ophelia não se responsabiliza
            por moradas incompletas ou incorretas, contactos telefónicos errados, intercomunicadores
            avariados, ausência do destinatário, ou encomendas recusadas na receção.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.heading}>Política de devolução</h2>
          <p className={styles.body}>
            De acordo com o Decreto-Lei português n.º 24/2014, artigo 17.º, alínea e), os clientes
            não beneficiam do direito de retratação de 14 dias, uma vez que os produtos da Ophelia
            são produtos alimentares perecíveis sujeitos a rápida deterioração ou personalizados. No
            entanto, os clientes têm direito a apresentar uma reclamação se o produto chegar
            danificado, com defeito, fora de validade ou incorreto.
          </p>
          <p className={styles.body}>
            Nesses casos, o cliente deve contactar-nos até 24 horas após a entrega, por email para{' '}
            <a href={`mailto:${SITE.email}`}>{SITE.email}</a>, indicando o número do pedido e, se
            possível, uma fotografia do problema. A Ophelia compromete-se a substituir o produto ou a
            reembolsar o preço de compra, sem custos adicionais para o cliente. O reembolso tem um
            prazo máximo de 15 dias úteis.
          </p>
          <p className={styles.body}>
            Alterações de morada, código-postal ou localidade devem ser efetuadas através de um
            operador da Ophelia, por telefone ou email, no próprio dia da encomenda; podem estar
            sujeitas à disponibilidade de distribuição e a um pagamento extra.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.heading}>Garantia</h2>
          <p className={styles.body}>
            Os produtos alimentares comercializados pela Ophelia estão abrangidos pela garantia legal
            de conformidade, limitada ao prazo de validade indicado na embalagem. A garantia cobre
            exclusivamente defeitos de fabrico, problemas de qualidade ou danos ocorridos durante o
            transporte. Não são aceites reclamações por armazenamento incorreto, alterações naturais
            de sabor ou textura dentro do prazo de validade, ou consumo após o prazo de validade.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.heading}>Falar connosco</h2>
          <address className={styles.body}>
            <a href={`mailto:${SITE.email}`}>{SITE.email}</a>
            <br />
            <a href={`tel:${SITE.phone}`}>{SITE.phoneDisplay}</a>
          </address>
        </section>
      </article>
    </>
  );
}

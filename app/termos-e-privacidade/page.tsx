import type { Metadata } from 'next';
import Link from 'next/link';

import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { JsonLd } from '@/components/seo/JsonLd';
import { Kicker } from '@/components/ui/Type';
import { pageMetadata } from '@/lib/seo/metadata';
import { breadcrumbSchema } from '@/lib/seo/structured-data';
import { SITE } from '@/lib/site';

import styles from '../legal.module.css';

export const metadata: Metadata = pageMetadata({
  title: 'Termos e privacidade',
  description:
    'Termos e condições, política de privacidade e política de cookies da loja online da Ophelia (Receita Consistente, Lda.).',
  path: '/termos-e-privacidade',
});

const crumbs = [
  { name: 'Ophelia', path: '/' },
  { name: 'Termos e privacidade', path: '/termos-e-privacidade' },
];

const SECTIONS = [
  { id: 'termos', label: 'Termos e condições' },
  { id: 'privacidade', label: 'Política de privacidade' },
  { id: 'cookies', label: 'Política de cookies' },
];

/**
 * Legal copy, verbatim from the client's own document. Not summarised and not
 * rewritten: this is the text the business is bound by.
 */
export default function TermsPage() {
  return (
    <>
      <JsonLd data={breadcrumbSchema(crumbs)} />
      <article className={styles.page}>
        <Breadcrumbs crumbs={crumbs} />
        <Kicker>Informação legal</Kicker>
        <h1 className={styles.title}>Termos e privacidade</h1>
        <p className={styles.updated}>
          {SITE.legalName}, {SITE.taxId}, com sede na {SITE.address.street}, {SITE.address.locality}.
        </p>

        <nav className={styles.toc} aria-label="Nesta página">
          <h2 className={styles.tocTitle}>Nesta página</h2>
          <ul className={styles.tocList}>
            {SECTIONS.map((section) => (
              <li key={section.id}>
                <Link href={`#${section.id}`}>{section.label}</Link>
              </li>
            ))}
          </ul>
        </nav>

        <section className={styles.section} id="termos">
          <h2 className={styles.heading}>Termos e condições</h2>
          <p className={styles.body}>
            O acesso e a navegação na loja online estão sujeitos aos presentes termos e condições,
            que integram as condições gerais de venda da loja, assim como a política de privacidade
            apresentadas pela {SITE.legalName}, {SITE.taxId}, com sede na {SITE.address.street},{' '}
            {SITE.address.locality}, com o email <a href={`mailto:${SITE.email}`}>{SITE.email}</a> e o
            número de telefone <a href={`tel:${SITE.phone}`}>{SITE.phoneDisplay}</a>.
          </p>

          <h3 className={styles.subheading}>Âmbito</h3>
          <p className={styles.body}>
            Ao utilizar a loja online, o cliente está a concordar com os termos e condições aqui
            presentes. Os termos e condições podem ser atualizados ocasionalmente.
          </p>

          <h3 className={styles.subheading}>Produtos e informações</h3>
          <p className={styles.body}>
            Fazemos todos os esforços para garantir que as descrições, imagens, preços e
            características dos produtos sejam corretos. No entanto, podem ocorrer pequenas
            variações, nomeadamente em cores ou embalagens. Reservamo-nos o direito de alterar
            produtos, preços ou promoções sem aviso prévio.
          </p>

          <h3 className={styles.subheading}>Processo de compra</h3>
          <p className={styles.body}>
            A Ophelia oferece aos seus clientes uma variedade de artigos de pastelaria, azeite, mel,
            doces caseiros e merchandising da marca, entre outros. A compra é efetuada através da
            seleção dos produtos, preenchimento dos dados necessários e confirmação do pagamento. A
            encomenda só será considerada válida após confirmação do pagamento. Dado que os nossos
            produtos principais são produzidos no próprio dia de entrega, a Ophelia não processa
            encomendas que não estejam pagas.
          </p>
          <p className={styles.body}>
            As imagens dos produtos na loja online são apenas uma ilustração dos mesmos, não
            constituindo por si só propostas vinculativas de venda. A sua utilização, reprodução,
            cópia e divulgação sem aviso prévio é proibida.
          </p>

          <h3 className={styles.subheading}>Preços</h3>
          <p className={styles.body}>
            Aos preços indicados já se encontra incluído o IVA à taxa legal em vigor, aos quais
            acrescem valores de portes de envio, quando aplicáveis. A Ophelia apenas desenvolve
            relações comerciais com consumidores finais: não se efetuam taxas especiais ao comércio
            grossista nem descontos de revendedor. A Ophelia reserva-se o direito de alterar os
            preços em qualquer momento, comprometendo-se a aplicar os preços indicados no momento da
            realização do pedido de compra. No caso de erro informático, manual ou técnico que cause
            uma alteração substancial não prevista no preço de venda ao público, o pedido de compra
            será considerado inválido e anulado, e o montante pago será devolvido ao cliente.
          </p>

          <h3 className={styles.subheading}>Métodos de pagamento</h3>
          <p className={styles.body}>
            As encomendas podem ser pagas por cartão de crédito (MasterCard, Visa e American
            Express), por Multibanco ou por PayPal. Não é possível efetuar pagamento por cheque ou
            envio de dinheiro. No caso de pagamento por cartão de crédito, os montantes ficam
            cativos uma semana depois do envio dos produtos. Nos pagamentos por Multibanco, ao
            finalizar a encomenda é gerada uma referência que o cliente recebe no email de
            confirmação; a encomenda não é produzida enquanto não for paga, pelo que se recomenda o
            pagamento com dois dias de antecedência em relação ao dia de entrega.
          </p>

          <h3 className={styles.subheading}>Entrega, devoluções e garantia</h3>
          <p className={styles.body}>
            As condições de entrega, devolução e garantia estão descritas em{' '}
            <Link href="/envios-e-devolucoes">Envios e devoluções</Link>.
          </p>

          <h3 className={styles.subheading}>Reclamações e resolução de litígios</h3>
          <p className={styles.body}>
            O cliente pode apresentar reclamações através do email{' '}
            <a href={`mailto:${SITE.email}`}>{SITE.email}</a>. A Ophelia disponibiliza ainda acesso
            ao Livro de Reclamações Eletrónico em{' '}
            <a href="https://www.livroreclamacoes.pt" rel="noopener noreferrer" target="_blank">
              livroreclamacoes.pt
            </a>
            . Antes de recorrer aos tribunais, o cliente tem o direito de tentar resolver qualquer
            litígio extrajudicialmente através da Plataforma Europeia de Resolução de Litígios em
            Linha, em{' '}
            <a
              href="https://webgate.ec.europa.eu/odr"
              rel="noopener noreferrer"
              target="_blank"
            >
              webgate.ec.europa.eu/odr
            </a>
            . Em Portugal, pode igualmente recorrer aos Centros de Arbitragem de Conflitos de
            Consumo, em{' '}
            <a href="https://www.consumidor.gov.pt" rel="noopener noreferrer" target="_blank">
              consumidor.gov.pt
            </a>
            .
          </p>

          <h3 className={styles.subheading}>Direito de propriedade</h3>
          <p className={styles.body}>
            Todos os produtos e bens são propriedade da Ophelia até que se realize o pagamento total
            dos mesmos por parte do cliente. Antes da transmissão de propriedade, a doação, a
            transferência de propriedade como forma de garantia, o processamento ou a remodelação não
            são permitidos sem a aprovação da Ophelia.
          </p>

          <h3 className={styles.subheading}>Legislação e disposições finais</h3>
          <p className={styles.body}>
            As presentes condições gerais e todos os contratos celebrados ao seu abrigo regem-se pela
            legislação portuguesa. O website da Ophelia pode conter ligações a outros websites sobre
            os quais não exerce qualquer controlo, nem é responsável pelo seu conteúdo. A Ophelia
            reserva-se o direito de alterar estes termos e condições a qualquer momento, sem aviso
            prévio; será aplicada a versão publicada no site no momento do pedido.
          </p>
        </section>

        <section className={styles.section} id="privacidade">
          <h2 className={styles.heading}>Política de privacidade</h2>
          <p className={styles.body}>
            A sua privacidade é importante para nós. A {SITE.legalName} compromete-se a proteger a
            privacidade de cada utilizador do seu site. Os dados recolhidos não podem ser utilizados
            para envio de newsletters sem o expresso consentimento do utilizador, nem podem ser
            cedidos a entidades terceiras.
          </p>
          <p className={styles.body}>
            Apenas retemos as informações recolhidas pelo tempo necessário para fornecer o serviço
            solicitado. Quando armazenamos dados, protegemo-los dentro de meios comercialmente
            aceitáveis para evitar perdas e roubos, bem como acesso, divulgação, cópia, uso ou
            modificação não autorizados. Não partilhamos informações de identificação pessoal
            publicamente ou com terceiros, exceto quando exigido por lei.
          </p>
          <p className={styles.body}>
            O nosso site pode ter ligações para sites externos que não são operados por nós. Não
            temos controlo sobre o conteúdo e as práticas desses sites e não podemos aceitar
            responsabilidade pelas suas respetivas políticas de privacidade.
          </p>
          <p className={styles.body}>
            Está no seu direito recusar a nossa solicitação de informações pessoais, entendendo que
            talvez não possamos fornecer alguns dos serviços desejados. O uso continuado do nosso
            site será considerado como aceitação das nossas práticas em torno de privacidade e
            informações pessoais.
          </p>
          <p className={styles.body}>
            Os dados pessoais são tratados em conformidade com o Regulamento (UE) 2016/679 (RGPD) e
            utilizados exclusivamente para processamento de pedidos e comunicação com o cliente. Os
            clientes podem, a qualquer momento, cessar, corrigir ou solicitar a eliminação dos seus
            dados, contactando <a href={`mailto:${SITE.email}`}>{SITE.email}</a>.
          </p>
        </section>

        <section className={styles.section} id="cookies">
          <h2 className={styles.heading}>Política de cookies</h2>
          <h3 className={styles.subheading}>O que são cookies?</h3>
          <p className={styles.body}>
            Utilizamos cookies e tecnologias semelhantes para garantir o correto funcionamento da
            nossa loja online, melhorar a sua experiência de navegação e apresentar conteúdos e
            ofertas relevantes, em conformidade com o Regulamento Geral sobre a Proteção de Dados
            (RGPD). Os cookies são pequenos ficheiros de texto armazenados no seu dispositivo quando
            visita um site. Permitem reconhecer o seu dispositivo e recordar determinadas informações
            sobre a sua navegação.
          </p>

          <h3 className={styles.subheading}>Cookies que definimos</h3>
          <ul className={styles.list}>
            <li>
              <strong>Sessão e conta.</strong> Utilizamos cookies quando tem sessão iniciada, para
              não ter de a iniciar em cada página. São removidos quando termina a sessão.
            </li>
            <li>
              <strong>Newsletter.</strong> Recordam se já subscreveu, para não repetirmos avisos.
            </li>
            <li>
              <strong>Processamento de encomendas.</strong> Essenciais para que o seu pedido seja
              recordado entre páginas e possa ser processado corretamente.
            </li>
            <li>
              <strong>Formulários.</strong> Podem recordar dados que introduziu, para correspondência
              futura.
            </li>
            <li>
              <strong>Preferências do site.</strong> Guardam as preferências de funcionamento do site
              que escolheu.
            </li>
          </ul>

          <h3 className={styles.subheading}>Desativar cookies</h3>
          <p className={styles.body}>
            Pode configurar o seu navegador para bloquear ou eliminar cookies. Note que a desativação
            de cookies essenciais pode afetar o funcionamento do site.
          </p>
        </section>
      </article>
    </>
  );
}

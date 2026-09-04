/**
 * The Ophelia story.
 *
 * Chapter copy is condensed from the client's own "Ophelia - Quem somos"
 * document and matches the six chapters in the design handoff. The full
 * narrative paragraphs below are the client's text, lightly set into the
 * editorial layout — no marketing claims have been added.
 */

export type Chapter = {
  /** Year or place, set large in Caprasimo terracotta. */
  year: string;
  title: string;
  body: string;
  /** Intended photograph for this row. */
  imageBrief: string;
};

export const OPENING_LEAD =
  'Crescemos entre jantares de família, avós que nos recebiam sempre com um bolo acabado de sair do forno e tardes na rua a brincar até o sol se pôr. A nossa mãe, Isabel, seguiu esses passos. Nós fizemos dela uma casa.';

export const CHAPTERS: Chapter[] = [
  {
    year: 'Guarda',
    title: 'Onde a história começa',
    body: 'As mesas de domingo eram recheadas de cabrito no forno, esparregado da avó Isabel e batatinhas assadas — mas nunca podiam faltar as sobremesas da avó Alice. Desconfiamos que o nosso gosto em receber venha exatamente daí.',
    imageBrief: 'Guarda, serra, mesa de família',
  },
  {
    year: '2019',
    title: 'A Ophelia nasce como empresa de eventos',
    body: 'Abrimos a Ophelia como uma pequena empresa de eventos sediada na Guarda. Durante um ano organizámos eventos corporativos, festas de aniversário, casamentos e jantares entre amigos.',
    imageBrief: 'Mesa posta de evento, velas',
  },
  {
    year: 'Pandemia',
    title: 'Reinventar para continuar a celebrar',
    body: 'Com a chegada da pandemia perdemos alguns dos nossos principais clientes. Foi então que reinventámos o nosso caminho: começámos a entregar kits de aniversário e brunches em casa, para que ninguém deixasse de celebrar quem ama, mesmo à distância.',
    imageBrief: 'Kit de aniversário entregue em casa',
  },
  {
    year: 'Estoril',
    title: 'A mana mais nova muda-se',
    body: 'A empresa continuou a crescer e a cozinha da nossa mãe deixou de ter espaço para esta loucura. A mana mais nova veio para o Estoril estudar Gestão e Produção Alimentar e, depois de trabalhar em vários espaços, sentiu que era o momento certo para dar nova vida à Ophelia.',
    imageBrief: 'Cozinha profissional, mãos a trabalhar massa',
  },
  {
    year: '2022',
    title: 'A Ophelia abre portas',
    body: 'Depois de mais um ano à procura do lugar certo, surgiu uma loja pequenina, mas com duas cozinhas independentes que permitiam conciliar o serviço de loja com eventos e encomendas de bolos e sobremesas. Era ali.',
    imageBrief: 'Fachada da loja Ophelia',
  },
  {
    year: 'Hoje',
    title: 'A família continua a construir',
    body: 'Os valores continuam a ser os mesmos que nos acompanham desde sempre. Acreditamos que a comida tem a magia de confortar, de aquecer o coração e de eternizar momentos.',
    imageBrief: 'Retrato de família na loja',
  },
];

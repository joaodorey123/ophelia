/**
 * What is editable, and how each field should be presented.
 *
 * This is the whole contract between the builder and the storefront's content
 * files. The storefront owns the shapes (`lib/content/types.ts` over there);
 * this describes how a person edits them. `npm test` validates the two against
 * each other, so a field cannot silently point at a key that no longer exists.
 */

export type Field =
  /** One line of copy. */
  | { kind: 'text'; path: string; label: string; help?: string; max?: number }
  /** A paragraph. */
  | { kind: 'textarea'; path: string; label: string; help?: string; rows?: number; max?: number }
  /** A list of plain strings — one input per entry, reorderable. */
  | { kind: 'strings'; path: string; label: string; help?: string; itemLabel: string; multiline?: boolean }
  /** A photograph. */
  | { kind: 'image'; path: string; label: string; help?: string; ratio?: string }
  | { kind: 'number'; path: string; label: string; help?: string; min?: number; max?: number; step?: number }
  | { kind: 'toggle'; path: string; label: string; help?: string }
  | { kind: 'color'; path: string; label: string; help?: string }
  /** A size multiplier, shown as a slider with a live sample. */
  | { kind: 'scale'; path: string; label: string; help?: string; sample: string; preview: PreviewStyle }
  /** Pick a product from the shop, instead of typing its identifier. */
  | { kind: 'product'; path: string; label: string; help?: string }
  /** Pick a collection from the shop. */
  | { kind: 'collection'; path: string; label: string; help?: string; allowNone?: string }
  /** A list of objects. */
  | {
      kind: 'list';
      path: string;
      label: string;
      help?: string;
      itemLabel: string;
      /** Sub-field paths are relative to the item. */
      fields: Field[];
      /** Which sub-field to show as the row's summary. */
      titleField: string;
      min?: number;
      max?: number;
    };

/** How a piece of copy is set on the storefront, so the editor can show it truthfully. */
export type PreviewStyle = 'display' | 'serif' | 'body' | 'kicker';

export type Section = {
  id: string;
  title: string;
  /** Which content file this section writes to. */
  file: string;
  description: string;
  /** The storefront path this section appears on, for the preview pane. */
  previewPath?: string;
  fields: Field[];
};

export const SECTIONS: Section[] = [
  {
    id: 'home-hero',
    title: 'Início — destaque',
    file: 'content/home.json',
    previewPath: '/',
    description: 'A fotografia grande e o cartão sobreposto no topo da página inicial.',
    fields: [
      { kind: 'image', path: 'hero.image', label: 'Fotografia', ratio: '16 / 9' },
      {
        kind: 'text',
        path: 'hero.alt',
        label: 'Descrição da fotografia',
        help: 'Uma frase curta a dizer o que se vê. É lida por quem navega sem ver imagens, e ajuda o Google.',
      },
      { kind: 'text', path: 'hero.kicker', label: 'Linha pequena', max: 60 },
      { kind: 'text', path: 'hero.title', label: 'Título', max: 80 },
      { kind: 'text', path: 'hero.cta', label: 'Texto do link', max: 30 },
    ],
  },
  {
    id: 'home-collections',
    title: 'Início — coleções',
    file: 'content/home.json',
    previewPath: '/',
    description:
      'Os cartões das categorias. Se uma categoria ainda não estiver publicada na loja, o cartão dela não aparece no site.',
    fields: [
      { kind: 'text', path: 'collections.heading', label: 'Título da secção' },
      { kind: 'textarea', path: 'collections.note', label: 'Nota ao lado', rows: 2 },
      {
        kind: 'list',
        path: 'collections.cards',
        label: 'Cartões',
        itemLabel: 'Cartão',
        titleField: 'name',
        fields: [
          { kind: 'text', path: 'name', label: 'Nome' },
          { kind: 'text', path: 'note', label: 'Nota' },
          { kind: 'image', path: 'image', label: 'Fotografia', ratio: '4 / 5' },
          {
            kind: 'collection',
            path: 'handle',
            label: 'Para onde leva',
            help: 'Escolhe a categoria que este cartão abre.',
            allowNone: 'Todos os produtos',
          },
        ],
      },
    ],
  },
  {
    id: 'home-favourites',
    title: 'Início — favoritos',
    file: 'content/home.json',
    previewPath: '/',
    description:
      'Os produtos em destaque na página inicial. Os preços e as fotografias vêm da loja — aqui escolhes só quais aparecem.',
    fields: [
      { kind: 'text', path: 'favourites.heading', label: 'Título da secção' },
      { kind: 'text', path: 'favourites.cta', label: 'Texto do link' },
      {
        kind: 'list',
        path: 'favourites.handles',
        label: 'Produtos em destaque',
        itemLabel: 'Produto',
        titleField: '',
        help: 'Escolhe até quatro produtos, pela ordem em que devem aparecer.',
        max: 4,
        fields: [{ kind: 'product', path: '', label: 'Produto' }],
      },
    ],
  },
  {
    id: 'home-story',
    title: 'Início — a nossa história',
    file: 'content/home.json',
    previewPath: '/',
    description: 'A faixa com a fotografia e o texto sobre a casa.',
    fields: [
      { kind: 'text', path: 'story.kicker', label: 'Linha pequena' },
      { kind: 'strings', path: 'story.headingLines', label: 'Título', itemLabel: 'Linha', help: 'Cada linha aparece numa linha própria.' },
      { kind: 'textarea', path: 'story.body', label: 'Texto', rows: 5 },
      { kind: 'text', path: 'story.cta', label: 'Texto do link' },
      { kind: 'image', path: 'story.image', label: 'Fotografia', ratio: '1 / 1' },
      { kind: 'text', path: 'story.alt', label: 'Descrição da fotografia' },
    ],
  },
  {
    id: 'home-sections',
    title: 'Início — outros títulos',
    file: 'content/home.json',
    previewPath: '/',
    description: 'Os títulos das duas últimas secções da página inicial.',
    fields: [
      { kind: 'text', path: 'reviews.heading', label: 'Título das opiniões' },
      { kind: 'text', path: 'diary.heading', label: 'Título do diário' },
      { kind: 'text', path: 'diary.cta', label: 'Link do diário' },
    ],
  },
  {
    id: 'reviews',
    title: 'Opiniões',
    file: 'content/reviews.json',
    previewPath: '/',
    description: 'As opiniões que aparecem na página inicial.',
    fields: [
      {
        kind: 'list',
        path: '',
        label: 'Opiniões',
        itemLabel: 'Opinião',
        titleField: 'who',
        fields: [
          { kind: 'textarea', path: 'text', label: 'Texto', rows: 4 },
          { kind: 'text', path: 'who', label: 'Quem escreveu', help: 'Por exemplo: MARTA S. · PORTO' },
          { kind: 'text', path: 'stars', label: 'Estrelas', help: 'Cinco estrelas: ★★★★★' },
        ],
      },
    ],
  },
  {
    id: 'about',
    title: 'Quem somos',
    file: 'content/about.json',
    previewPath: '/quem-somos',
    description: 'A página da história da casa.',
    fields: [
      { kind: 'image', path: 'hero.image', label: 'Fotografia do topo', ratio: '16 / 9' },
      { kind: 'text', path: 'hero.alt', label: 'Descrição da fotografia' },
      { kind: 'text', path: 'hero.kicker', label: 'Linha pequena' },
      { kind: 'text', path: 'hero.title', label: 'Título' },
      { kind: 'strings', path: 'lede.lines', label: 'Frase de abertura', itemLabel: 'Linha' },
      { kind: 'strings', path: 'story.paragraphs', label: 'Texto', itemLabel: 'Parágrafo', multiline: true },
      { kind: 'image', path: 'story.image', label: 'Fotografia do texto', ratio: '4 / 5' },
      { kind: 'text', path: 'story.alt', label: 'Descrição da fotografia' },
      {
        kind: 'list',
        path: 'timeline',
        label: 'Cronologia',
        itemLabel: 'Ano',
        titleField: 'year',
        fields: [
          { kind: 'text', path: 'year', label: 'Ano' },
          { kind: 'text', path: 'title', label: 'Título' },
          { kind: 'textarea', path: 'body', label: 'Texto', rows: 3 },
        ],
      },
      {
        kind: 'list',
        path: 'gallery',
        label: 'Galeria',
        itemLabel: 'Fotografia',
        titleField: 'alt',
        min: 4,
        max: 4,
        fields: [
          { kind: 'image', path: 'image', label: 'Fotografia', ratio: '3 / 4' },
          { kind: 'text', path: 'alt', label: 'Descrição' },
        ],
      },
      { kind: 'text', path: 'closing.headingLead', label: 'Citação — início' },
      { kind: 'text', path: 'closing.headingEmphasis', label: 'Citação — fim' },
      { kind: 'textarea', path: 'closing.note', label: 'Nota final', rows: 2 },
    ],
  },
  {
    id: 'contacto',
    title: 'Contacto',
    file: 'content/contacto.json',
    previewPath: '/contacto',
    description: 'A página de contacto, o formulário e a informação da loja.',
    fields: [
      { kind: 'text', path: 'kicker', label: 'Linha pequena' },
      { kind: 'text', path: 'title', label: 'Título' },
      { kind: 'textarea', path: 'lede', label: 'Texto de abertura', rows: 3 },
      { kind: 'image', path: 'image', label: 'Fotografia', ratio: '4 / 3' },
      { kind: 'text', path: 'alt', label: 'Descrição da fotografia' },
      { kind: 'strings', path: 'subjects', label: 'Assuntos do formulário', itemLabel: 'Assunto' },
      { kind: 'text', path: 'success.title', label: 'Confirmação — título' },
      { kind: 'textarea', path: 'success.body', label: 'Confirmação — texto', rows: 2 },
      { kind: 'text', path: 'success.reset', label: 'Confirmação — link' },
      {
        kind: 'list',
        path: 'info',
        label: 'Informação da loja',
        itemLabel: 'Linha',
        titleField: 'label',
        fields: [
          { kind: 'text', path: 'label', label: 'Etiqueta' },
          { kind: 'textarea', path: 'value', label: 'Valor', rows: 3, help: 'Podes usar várias linhas.' },
        ],
      },
    ],
  },
  {
    id: 'shop',
    title: 'Loja — introdução',
    file: 'content/shop.json',
    previewPath: '/comprar',
    description: 'O texto no topo da página de produtos.',
    fields: [
      { kind: 'text', path: 'kicker', label: 'Linha pequena' },
      { kind: 'text', path: 'title', label: 'Título' },
      { kind: 'textarea', path: 'lede', label: 'Texto', rows: 3 },
    ],
  },
  {
    id: 'diario-intro',
    title: 'Diário — introdução',
    file: 'content/diario.json',
    previewPath: '/diario',
    description: 'O texto no topo do diário. Os artigos editam-se no separador Diário.',
    fields: [
      { kind: 'text', path: 'kicker', label: 'Linha pequena' },
      { kind: 'text', path: 'titleLead', label: 'Título — início' },
      { kind: 'text', path: 'titleEmphasis', label: 'Título — fim' },
      { kind: 'textarea', path: 'lede', label: 'Texto', rows: 3 },
    ],
  },
  {
    id: 'site',
    title: 'Cabeçalho e rodapé',
    file: 'content/site.json',
    description: 'A barra azul no topo, a newsletter e o rodapé. Aparecem em todas as páginas.',
    fields: [
      { kind: 'text', path: 'brand.tagline', label: 'Frase do rodapé' },
      {
        kind: 'textarea',
        path: 'brand.description',
        label: 'Descrição do site',
        rows: 2,
        help: 'O texto que aparece no Google e quando alguém partilha o site.',
      },
      { kind: 'toggle', path: 'announcement.enabled', label: 'Mostrar a barra de avisos' },
      { kind: 'strings', path: 'announcement.messages', label: 'Avisos', itemLabel: 'Aviso' },
      { kind: 'text', path: 'newsletter.kicker', label: 'Newsletter — linha pequena' },
      { kind: 'strings', path: 'newsletter.headingLines', label: 'Newsletter — título', itemLabel: 'Linha' },
      { kind: 'text', path: 'newsletter.placeholder', label: 'Newsletter — texto do campo' },
      { kind: 'text', path: 'newsletter.cta', label: 'Newsletter — botão' },
      { kind: 'text', path: 'footer.helpHeading', label: 'Rodapé — título da coluna' },
      { kind: 'strings', path: 'footer.help', label: 'Rodapé — linhas de ajuda', itemLabel: 'Linha' },
      { kind: 'text', path: 'footer.legalRight', label: 'Rodapé — canto direito' },
    ],
  },
  {
    id: 'shipping',
    title: 'Envios',
    file: 'content/site.json',
    description:
      'O que o cesto diz sobre portes. Importante: estes valores têm de ser iguais aos que estão configurados na loja, senão o cliente vê "envio grátis" no site e é cobrado no pagamento.',
    fields: [
      {
        kind: 'number',
        path: 'shipping.freeShippingFrom',
        label: 'Envio grátis a partir de (€)',
        min: 0,
        max: 500,
        step: 1,
      },
      { kind: 'number', path: 'shipping.shippingRate', label: 'Custo de envio (€)', min: 0, max: 100, step: 0.1 },
      { kind: 'textarea', path: 'shipping.note', label: 'Nota sobre envios', rows: 2 },
    ],
  },
  {
    id: 'product',
    title: 'Página de produto',
    file: 'content/site.json',
    description: 'Os textos que se repetem em todas as páginas de produto. Os nomes, preços e fotografias vêm da loja.',
    fields: [
      { kind: 'text', path: 'product.giftCardTitle', label: 'Cartão personalizado — título' },
      { kind: 'text', path: 'product.giftCardNote', label: 'Cartão personalizado — nota' },
      {
        kind: 'product',
        path: 'product.giftCardHandle',
        label: 'Cartão personalizado — que produto é',
        help: 'O produto que é adicionado ao cesto quando alguém pede um cartão escrito à mão. Se não existir, a opção não aparece no site.',
      },
      { kind: 'text', path: 'product.suggestHeading', label: 'Título das sugestões' },
      {
        kind: 'list',
        path: 'product.panels',
        label: 'Secções expansíveis',
        itemLabel: 'Secção',
        titleField: 'title',
        fields: [
          { kind: 'text', path: 'title', label: 'Título' },
          { kind: 'textarea', path: 'body', label: 'Texto', rows: 5 },
        ],
      },
    ],
  },
];

/** Colours and text sizes. Separate because it changes how the whole site looks. */
export const THEME_SECTION: Section = {
  id: 'theme',
  title: 'Cores e tamanhos',
  file: 'content/theme.json',
  description:
    'Ajustes ao aspecto do site. Tudo começa como foi desenhado — muda só o que quiseres, e podes sempre voltar atrás.',
  fields: [
    { kind: 'color', path: 'colors.navy', label: 'Azul principal', help: 'Títulos, botões, barra de avisos.' },
    { kind: 'color', path: 'colors.navyHover', label: 'Azul — rato por cima' },
    { kind: 'color', path: 'colors.cream', label: 'Fundo da página' },
    { kind: 'color', path: 'colors.beige', label: 'Fundo das faixas' },
    { kind: 'color', path: 'colors.heroCard', label: 'Cartão do destaque' },
    { kind: 'color', path: 'colors.inkBody', label: 'Texto dos parágrafos' },
    { kind: 'color', path: 'colors.muted', label: 'Texto secundário' },
    { kind: 'color', path: 'colors.gold', label: 'Estrelas das opiniões' },
    { kind: 'scale', path: 'bodyScale', label: 'Tamanho do texto corrido', sample: 'Preparamos tudo sob encomenda.', preview: 'body' },
    { kind: 'scale', path: 'typeScale.hero', label: 'Título do destaque', sample: 'a loja da ophelia', preview: 'display' },
    { kind: 'scale', path: 'typeScale.section', label: 'Títulos de secção', sample: 'as nossas coleções', preview: 'display' },
    { kind: 'scale', path: 'typeScale.page', label: 'Títulos de página', sample: 'produtos', preview: 'display' },
    { kind: 'scale', path: 'typeScale.article', label: 'Títulos de artigo', sample: 'A granola que fazemos', preview: 'display' },
    { kind: 'scale', path: 'typeScale.product', label: 'Nome do produto', sample: 'Ophelia Cookies', preview: 'display' },
    { kind: 'scale', path: 'typeScale.quote', label: 'Citação final', sample: 'eternizar momentos.', preview: 'display' },
    { kind: 'scale', path: 'typeScale.lede', label: 'Frase de abertura', sample: 'Não somos uma empresa —', preview: 'display' },
    { kind: 'scale', path: 'typeScale.newsletter', label: 'Título da newsletter', sample: 'receitas e novidades,', preview: 'display' },
    { kind: 'scale', path: 'typeScale.band', label: 'Título da faixa', sample: 'somos uma família.', preview: 'display' },
    { kind: 'scale', path: 'typeScale.pageXl', label: 'Título "quem somos"', sample: 'quem somos', preview: 'display' },
    { kind: 'scale', path: 'typeScale.pageSm', label: 'Título do diário', sample: 'receitas, épocas', preview: 'display' },
    { kind: 'scale', path: 'typeScale.sectionSm', label: 'Título das sugestões', sample: 'fica ainda melhor com', preview: 'display' },
  ],
};

/** One diary article. The list itself is managed by the Diário screen. */
export const POST_FIELDS: Field[] = [
  { kind: 'text', path: 'title', label: 'Título' },
  {
    kind: 'text',
    path: 'slug',
    label: 'Endereço',
    help: 'A parte final do endereço do artigo. Sai automaticamente do título — muda só se precisares.',
  },
  { kind: 'text', path: 'kicker', label: 'Categoria', help: 'Por exemplo: receitas, épocas, presentes.' },
  { kind: 'text', path: 'date', label: 'Data', help: 'Escrita como deve aparecer no site. Por exemplo: 28 agosto.' },
  { kind: 'image', path: 'image', label: 'Fotografia', ratio: '16 / 11' },
  { kind: 'textarea', path: 'excerpt', label: 'Resumo', rows: 3, help: 'A frase grande no início do artigo e no cartão da lista.' },
  { kind: 'strings', path: 'body', label: 'Texto', itemLabel: 'Parágrafo', multiline: true },
];

export const ALL_SECTIONS = [...SECTIONS, THEME_SECTION];

export function findSection(id: string): Section | undefined {
  return ALL_SECTIONS.find((section) => section.id === id);
}

/** Every content file the schema touches. */
export function filesUsed(): string[] {
  return [...new Set(ALL_SECTIONS.map((section) => section.file))];
}

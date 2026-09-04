/**
 * Local development catalogue.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * THIS IS NOT PRODUCTION DATA. It exists so the storefront can be developed
 * and reviewed before the Shopify store is connected. Every field is copied
 * from material the client supplied — the design handoff's data model
 * (design-handoff/README.md → "Data model") and the client's own
 * "Ophelia - PRODUTOS SITE" document (descriptions, ingredients, sizes,
 * prices). Nothing here is invented.
 *
 * When SHOPIFY_STORE_DOMAIN and SHOPIFY_STOREFRONT_ACCESS_TOKEN are set, this
 * file is never loaded: lib/commerce/index.ts selects the Shopify adapter and
 * Shopify becomes the single source of truth. See docs/SHOPIFY.md for the
 * products, options and metafields to create so the two match.
 * ─────────────────────────────────────────────────────────────────────────
 */

export type SeedVariant = {
  /** Option values, in the order the product's options are declared. */
  options: string[];
  price: number;
  sku: string;
};

export type SeedProduct = {
  handle: string;
  title: string;
  productType: string;
  tags: string[];
  kicker: string;
  badge?: string;
  /** One line, used on category cards. */
  shortDescription: string;
  /** Full description shown on the product page. */
  description: string;
  /** Client-supplied ingredient list, verbatim. Omitted when the client
   *  document does not state one. */
  ingredients?: string;
  optionNames: string[];
  variants: SeedVariant[];
  /** Intended photography, from the prototype's image-slot captions. */
  imageBrief: string;
  updatedAt: string;
};

const SHIPPING_NOTE =
  'Expedimos de segunda a quinta-feira. As encomendas feitas após as 12:00 de quinta-feira seguem na segunda-feira seguinte. Não fazemos envios ao fim de semana. A entrega demora até 2 dias úteis. Encomendas grandes e presentes de empresa podem precisar de mais tempo de preparação.';

const UPDATED = '2026-01-01T00:00:00Z';

/**
 * Builds a stable, unique SKU. The index suffix matters: two sizes can share
 * their digits ("250 g · em grão" and "250 g · em pó" are both 250), and a
 * duplicate SKU would end up in the Product structured data.
 */
function sku(base: string, index: number, ...parts: string[]): string {
  const slug = parts
    .map((part) =>
      part
        .normalize('NFD')
        .replace(/\p{Diacritic}/gu, '')
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, '')
        .slice(0, 6),
    )
    .filter(Boolean)
    .join('-');
  return `${base}-${slug}-${index + 1}`;
}

/** Builds the flavour × size variant matrix in a stable order. */
function matrix(
  flavours: string[],
  sizes: { label: string; price: number }[],
  skuBase: string,
): SeedVariant[] {
  const variants: SeedVariant[] = [];
  for (const flavour of flavours) {
    for (const size of sizes) {
      variants.push({
        options: [flavour, size.label],
        price: size.price,
        sku: sku(skuBase, variants.length, flavour, size.label),
      });
    }
  }
  return variants;
}

function sized(sizes: { label: string; price: number }[], skuBase: string): SeedVariant[] {
  return sizes.map((size, index) => ({
    options: [size.label],
    price: size.price,
    sku: sku(skuBase, index, size.label),
  }));
}

export const SEED_PRODUCTS: SeedProduct[] = [
  {
    handle: 'ophelia-cookies',
    title: 'Ophelia Cookies',
    productType: 'Cookies',
    tags: ['cookies', 'presentes'],
    kicker: 'Cookies · o clássico',
    shortDescription: 'O nosso clássico, em quatro sabores.',
    description:
      'A cookie que nos deu nome: crocante por fora, muito cremosa por dentro. Cada caixa é preparada sob encomenda. As cookies são embaladas uma a uma em saquinhos de celofane, seladas com o autocolante da Ophelia e arrumadas nas nossas caixas azuis ou brancas.',
    ingredients:
      'Farinha, chocolate 70%, chocolate 36,5%, chocolate branco, manteiga, açúcar amarelo, açúcar branco, ovos, gemas, baunilha, bicarbonato, fermento, sal, cacau, corante vermelho, leite em pó, amido de milho, limão. Cada cookie contém 100 gramas.',
    optionNames: ['Sabor', 'Tamanho'],
    variants: matrix(
      ['Tradicional', 'Red Velvet', 'Cacau', 'Limão'],
      [
        { label: '4 unidades', price: 17 },
        { label: '8 unidades', price: 32 },
        { label: '12 unidades', price: 48 },
      ],
      'OPH-CK',
    ),
    imageBrief: 'Ophelia Cookies em quatro sabores, vista de cima',
    updatedAt: UPDATED,
  },
  {
    handle: 'ophelia-cookiebrownie',
    title: 'Ophelia CookieBrownie',
    productType: 'Cookies',
    tags: ['cookies', 'presentes'],
    kicker: 'Cookies · sem farinha',
    shortDescription: 'Crocante por fora e muito cremosa por dentro. Não contém farinha.',
    description:
      'Crocante por fora e muito cremosa por dentro. Não contém farinha — só chocolate, paciência e o ponto certo de forno. Cada caixa é preparada sob encomenda, com as cookies embaladas uma a uma e arrumadas na caixa azul da Ophelia.',
    ingredients: 'Chocolate 70%, manteiga, açúcar, ovos, cacau. Cada cookie contém 100 gramas.',
    optionNames: ['Tamanho'],
    variants: sized(
      [
        { label: '4 unidades', price: 20 },
        { label: '8 unidades', price: 40 },
        { label: '12 unidades', price: 57 },
      ],
      'OPH-CB',
    ),
    imageBrief: 'CookieBrownie partida, interior de chocolate',
    updatedAt: UPDATED,
  },
  {
    handle: 'ophelia-cookie-banoffee',
    title: 'Ophelia Cookie Banoffee',
    productType: 'Cookies',
    tags: ['cookies', 'presentes', 'novidade'],
    kicker: 'Novidade',
    badge: 'Novo',
    shortDescription: 'Banana, caramelo e creme — a nossa novidade.',
    description:
      'Banana, caramelo e creme, dentro de uma cookie. A mais nova da casa. Cada caixa é preparada sob encomenda, com as cookies embaladas uma a uma e arrumadas na caixa azul da Ophelia.',
    ingredients:
      'Chocolate de leite, açúcar mascavado, açúcar branco, manteiga, farinha, ovos, sal, bicarbonato, amido de milho, leite em pó, banana, doce de leite. Cada cookie contém 100 gramas.',
    optionNames: ['Tamanho'],
    variants: sized(
      [
        { label: '4 unidades', price: 20 },
        { label: '8 unidades', price: 40 },
        { label: '12 unidades', price: 57 },
      ],
      'OPH-BN',
    ),
    imageBrief: 'Cookie Banoffee com caramelo e banana',
    updatedAt: UPDATED,
  },
  {
    handle: 'pack-especial-de-cookies',
    title: 'Pack Especial de Cookies',
    productType: 'Cookies',
    tags: ['cookies', 'presentes'],
    kicker: 'Para provar tudo',
    shortDescription: 'Banoffee, CookieBrownie e Cookie Cheesecake na mesma caixa.',
    description:
      'Uma caixa com as três que não conseguimos escolher: Cookie Banoffee, CookieBrownie e Cookie Cheesecake. Preparada sob encomenda, com as cookies embaladas uma a uma e arrumadas na nossa caixa azul ou branca.',
    ingredients:
      'Chocolate de leite, açúcar mascavado, açúcar branco, manteiga, farinha, ovos, sal, bicarbonato, amido de milho, leite em pó, banana, doce de leite, chocolate 70%, cacau. Cada cookie contém 100 gramas.',
    optionNames: ['Tamanho'],
    variants: sized(
      [
        { label: '3 unidades', price: 18 },
        { label: '6 unidades', price: 30 },
        { label: '9 unidades', price: 43 },
      ],
      'OPH-PK',
    ),
    imageBrief: 'Pack especial: três cookies diferentes na caixa azul',
    updatedAt: UPDATED,
  },
  {
    handle: 'cookies-personalizadas',
    title: 'Cookies Personalizadas',
    productType: 'Cookies',
    tags: ['cookies', 'personalizadas', 'eventos'],
    kicker: 'Eventos e empresas',
    badge: 'Personalizável',
    shortDescription:
      'Autocolante personalizado com a tua imagem, desenho ou logótipo. Mínimo 10 unidades.',
    description:
      'Para casamentos, aniversários, batizados, festas e eventos de empresa. Personalizamos o autocolante com a tua imagem, desenho ou logótipo. Cada caixa é preparada sob encomenda, com um mínimo de 10 unidades e um mix de sabores.',
    ingredients:
      'Farinha, chocolate 70%, chocolate 36,5%, chocolate branco, manteiga, açúcar amarelo, açúcar branco, ovos, gemas, baunilha, bicarbonato, fermento, sal, cacau, corante vermelho, leite em pó, amido de milho, limão. Cada cookie contém 60 gramas.',
    optionNames: ['Tamanho'],
    variants: sized(
      [
        { label: '10 unidades', price: 35 },
        { label: '25 unidades', price: 87 },
        { label: '35 unidades', price: 122 },
        { label: '50 unidades', price: 175 },
      ],
      'OPH-PR',
    ),
    imageBrief: 'Cookies com autocolante personalizado de casamento',
    updatedAt: UPDATED,
  },
  {
    handle: 'granola-da-ophelia',
    title: 'A Granola da Ophelia',
    productType: 'Mercearia',
    tags: ['mercearia', 'presentes', 'pequeno-almoco'],
    kicker: 'Feita todos os dias',
    shortDescription: 'Aveia, frutos secos, coco laminado, mel e canela.',
    description:
      'Fazemos granola todos os dias na Ophelia. O cheiro dos frutos secos caramelizados invade a loja e ninguém lhe resiste. Feita de forma artesanal, apenas com aveia grossa, frutos secos, coco laminado, mel, canela e flocos de milho.',
    ingredients:
      'Aveia, flocos de milho, noz, caju, pistácio, avelã, amêndoa, noz-pecã, coco laminado, mel e canela.',
    optionNames: ['Tamanho'],
    variants: sized(
      [
        { label: '300 g', price: 8 },
        { label: '600 g', price: 14 },
      ],
      'OPH-GR',
    ),
    imageBrief: 'Granola com frutos secos, textura em detalhe',
    updatedAt: UPDATED,
  },
  {
    handle: 'cafe-da-ophelia',
    title: 'Café da Ophelia',
    productType: 'Mercearia',
    tags: ['mercearia', 'presentes', 'pequeno-almoco'],
    kicker: 'O ritual da manhã',
    shortDescription: 'Blend 70% Brasil · 30% Etiópia, torrado na nossa loja.',
    description:
      'O nosso blend exclusivo combina o melhor de dois mundos: 70% Brasil e 30% Etiópia, numa chávena equilibrada e aromática. Do Brasil vêm as notas suaves, achocolatadas e de frutos secos; da Etiópia, a elegância floral e os toques cítricos. O resultado é um café harmonioso, com doçura natural, corpo médio e um aroma vibrante. É torrado na nossa loja todos os dias.',
    ingredients: 'Grão de café: 70% Brasil, 30% Etiópia.',
    optionNames: ['Tamanho'],
    variants: sized(
      [
        { label: '250 g · em grão', price: 18 },
        { label: '250 g · em pó', price: 8 },
      ],
      'OPH-CF',
    ),
    imageBrief: 'Café em grão a ser servido, pacote Ophelia',
    updatedAt: UPDATED,
  },
  {
    handle: 'mel-de-rosmaninho',
    title: 'Mel de Rosmaninho',
    productType: 'Mercearia',
    tags: ['mercearia', 'presentes'],
    kicker: 'Mercearia',
    shortDescription: 'Colhido na Serra da Estrela, entre julho e agosto.',
    description:
      'A Ophelia nasceu numa pequena cidade do interior do país, a Guarda. Por isso, trouxemos o que há de melhor na montanha. Este mel, com predominância polínica de rosmaninho, caracteriza-se pelo tom claro-âmbar, suave e de textura fina e leve, e é colhido entre os meses de julho e agosto.',
    ingredients:
      'Mel puro. A cristalização do mel é garantia de pureza e pode ser eliminada por aquecimento em banho-maria a 40 graus.',
    optionNames: ['Tamanho'],
    variants: sized([{ label: '300 ml', price: 7.8 }], 'OPH-MR'),
    imageBrief: 'Frasco de mel com colher, luz lateral',
    updatedAt: UPDATED,
  },
  {
    handle: 'mel-de-carvalho',
    title: 'Mel de Carvalho',
    productType: 'Mercearia',
    tags: ['mercearia', 'presentes'],
    kicker: 'Mercearia',
    shortDescription: 'Cor escura, sabor intenso e ligeiramente amargo.',
    description:
      'A Ophelia nasceu numa pequena cidade do interior do país, a Guarda. Por isso, trouxemos o que há de melhor na montanha. Este mel tem cor escura com notas avermelhadas, um sabor intenso e ligeiramente amargo.',
    ingredients:
      'Mel puro. A cristalização do mel é garantia de pureza e pode ser eliminada por aquecimento em banho-maria a 40 graus.',
    optionNames: ['Tamanho'],
    variants: sized([{ label: '300 ml', price: 7.8 }], 'OPH-MC'),
    imageBrief: 'Frasco de mel de carvalho, luz lateral',
    updatedAt: UPDATED,
  },
  {
    handle: 'azeite-da-ophelia',
    title: 'Azeite da Ophelia',
    productType: 'Mercearia',
    tags: ['mercearia', 'presentes'],
    kicker: 'Da montanha',
    shortDescription: 'Virgem extra, de oliveiras do sopé da Serra da Estrela.',
    description:
      'A Ophelia nasceu numa pequena cidade do interior do país, a Guarda. Três irmãos e um sonho em comum. Por isso, trouxemos o que há de melhor na montanha: azeite virgem extra de oliveiras de um sopé da Serra da Estrela.',
    ingredients: 'Azeite puro.',
    optionNames: ['Tamanho'],
    variants: sized(
      [
        { label: '500 ml', price: 13.9 },
        { label: '750 ml', price: 19.9 },
      ],
      'OPH-AZ',
    ),
    imageBrief: 'Garrafa de azeite Ophelia',
    updatedAt: UPDATED,
  },
  {
    handle: 'doce-de-alperce-e-amendoa',
    title: 'Doce de Alperce e Amêndoa',
    productType: 'Mercearia',
    tags: ['mercearia', 'doces'],
    kicker: 'Doces caseiros',
    shortDescription: 'Feito em panela pequena, apenas com fruta e açúcar.',
    description:
      'Criámos quatro sabores únicos de doces caseiros, feitos de forma totalmente artesanal apenas com a fruta e o açúcar.',
    ingredients: 'Alperce, amêndoa, água, açúcar, limão.',
    optionNames: ['Tamanho'],
    variants: sized([{ label: '225 ml', price: 4.85 }], 'OPH-DA'),
    imageBrief: 'Doce de alperce e amêndoa',
    updatedAt: UPDATED,
  },
  {
    handle: 'doce-de-maca-e-vinho-do-porto',
    title: 'Doce de Maçã e Vinho do Porto',
    productType: 'Mercearia',
    tags: ['mercearia', 'doces'],
    kicker: 'Doces caseiros',
    shortDescription: 'Feito em panela pequena, apenas com fruta e açúcar.',
    description:
      'Criámos quatro sabores únicos de doces caseiros, feitos de forma totalmente artesanal apenas com a fruta e o açúcar.',
    ingredients: 'Maçã, açúcar amarelo, vinho do Porto.',
    optionNames: ['Tamanho'],
    variants: sized([{ label: '225 ml', price: 4.85 }], 'OPH-DM'),
    imageBrief: 'Doce de maçã e vinho do Porto',
    updatedAt: UPDATED,
  },
  {
    handle: 'doce-de-pera-e-gengibre',
    title: 'Doce de Pera e Gengibre',
    productType: 'Mercearia',
    tags: ['mercearia', 'doces'],
    kicker: 'Doces caseiros',
    shortDescription: 'Feito em panela pequena, apenas com fruta e açúcar.',
    description:
      'Criámos quatro sabores únicos de doces caseiros, feitos de forma totalmente artesanal apenas com a fruta e o açúcar.',
    ingredients: 'Pera rocha, gengibre e açúcar.',
    optionNames: ['Tamanho'],
    variants: sized([{ label: '225 ml', price: 4.85 }], 'OPH-DP'),
    imageBrief: 'Doce de pera e gengibre',
    updatedAt: UPDATED,
  },
  {
    handle: 'doce-de-morango-com-baunilha',
    title: 'Doce de Morango com Baunilha',
    productType: 'Mercearia',
    tags: ['mercearia', 'doces'],
    kicker: 'Doces caseiros',
    shortDescription: 'Feito em panela pequena, apenas com fruta e açúcar.',
    description:
      'Criámos quatro sabores únicos de doces caseiros, feitos de forma totalmente artesanal apenas com a fruta e o açúcar.',
    ingredients: 'Morango, açúcar, vagem de baunilha.',
    optionNames: ['Tamanho'],
    variants: sized([{ label: '225 ml', price: 4.85 }], 'OPH-DB'),
    imageBrief: 'Doce de morango com baunilha',
    updatedAt: UPDATED,
  },
  {
    handle: 'vela-aromatica',
    title: 'Vela aromática',
    productType: 'Lifestyle',
    tags: ['lifestyle', 'presentes'],
    kicker: 'Para casa',
    shortDescription: 'Com o aroma dos nossos croissants.',
    description: 'O cheiro dela é delicioso e dá vontade de comer: o aroma dos nossos croissants.',
    optionNames: ['Tamanho'],
    variants: sized([{ label: '250 g', price: 18 }], 'OPH-VL'),
    imageBrief: 'Vela aromática acesa',
    updatedAt: UPDATED,
  },
  {
    handle: 'cartao-personalizado',
    title: 'Cartão personalizado',
    productType: 'Presentes',
    tags: ['presentes'],
    kicker: 'Escrito à mão',
    shortDescription: 'Escrito à mão por nós e colocado dentro da caixa.',
    description:
      'Um cartão escrito à mão por nós, com a tua mensagem, colocado dentro da caixa antes de a fecharmos.',
    optionNames: ['Tamanho'],
    variants: [{ options: ['Único'], price: 4, sku: 'OPH-CT-UNICO-1' }],
    imageBrief: 'Cartão escrito à mão dentro da caixa azul',
    updatedAt: UPDATED,
  },
];

export type SeedCollection = {
  handle: string;
  title: string;
  description: string;
  productHandles: string[];
};

export const SEED_COLLECTIONS: SeedCollection[] = [
  {
    handle: 'cookies',
    title: 'As famosas Cookies da Ophelia',
    description:
      'Feitas todos os dias na nossa cozinha, embaladas uma a uma e arrumadas na caixa azul. Escolhe o sabor, o tamanho e a quem as queres oferecer.',
    productHandles: [
      'ophelia-cookies',
      'ophelia-cookiebrownie',
      'ophelia-cookie-banoffee',
      'pack-especial-de-cookies',
      'cookies-personalizadas',
    ],
  },
  {
    handle: 'mercearia',
    title: 'Mercearia da Ophelia',
    description:
      'Azeite dos nossos olivais, mel de rosmaninho e de carvalho, doces feitos em panela pequena. A despensa da nossa família.',
    productHandles: [
      'azeite-da-ophelia',
      'mel-de-rosmaninho',
      'mel-de-carvalho',
      'doce-de-pera-e-gengibre',
      'doce-de-maca-e-vinho-do-porto',
      'doce-de-alperce-e-amendoa',
      'doce-de-morango-com-baunilha',
      'granola-da-ophelia',
      'cafe-da-ophelia',
    ],
  },
  {
    handle: 'presentes',
    title: 'Presentes da Ophelia',
    description:
      'Preparamos tudo por encomenda, com o cuidado de quem oferece a um amigo. Junta cookies, café, mel, uma vela e um cartão escrito à mão.',
    productHandles: [
      'ophelia-cookies',
      'pack-especial-de-cookies',
      'granola-da-ophelia',
      'cafe-da-ophelia',
      'mel-de-rosmaninho',
      'vela-aromatica',
      'cartao-personalizado',
    ],
  },
  {
    /**
     * The cross-sell set shown on the product page ("Fica ainda melhor com…")
     * and in the cart drawer ("Ainda falta alguma coisa?"). The design fixes
     * this set — "Escolhido por nós, não por um algoritmo" — so in Shopify it
     * is a merchant-curated collection, not an algorithmic recommendation.
     */
    handle: 'complementos',
    title: 'Fica ainda melhor com…',
    description: 'Escolhido por nós, não por um algoritmo.',
    productHandles: [
      'cafe-da-ophelia',
      'granola-da-ophelia',
      'mel-de-rosmaninho',
      'vela-aromatica',
    ],
  },
  {
    handle: 'lifestyle',
    title: 'Lifestyle',
    description: 'As coisas que fazem uma casa cheirar a Ophelia.',
    productHandles: ['vela-aromatica'],
  },
];


export { SHIPPING_NOTE };

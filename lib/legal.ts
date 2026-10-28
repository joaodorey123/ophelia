/**
 * The client's legal texts, from her document "Política de Privacidade.docx"
 * (privacy, cookies, and terms and conditions). Kept as written: only typing
 * slips are corrected — this is the text the business is bound by, so it is
 * not summarised or rewritten.
 *
 * Emails, web addresses and the phone number in the text become links when
 * rendered; see components/legal/LegalDocument.
 */

export type LegalBlock =
  | { kind: 'h2'; text: string; id?: string }
  | { kind: 'h3'; text: string }
  | { kind: 'p'; text: string }
  /** A list; an item may lead with a bold phrase, as the cookie list does. */
  | { kind: 'ul'; items: (string | { lead: string; text: string })[] };

export const PRIVACY: LegalBlock[] = [
  {
    kind: 'p',
    text: 'A sua privacidade é importante para nós. A empresa Receita Consistente, Lda. compromete-se a proteger a privacidade de cada utilizador do seu site.',
  },
  {
    kind: 'p',
    text: 'Os dados recolhidos não podem ser utilizados para envio de newsletters sem o expresso consentimento do utilizador, nem podem ser cedidos a entidades terceiras.',
  },
  {
    kind: 'p',
    text: 'Apenas retemos as informações coletadas pelo tempo necessário para fornecer o serviço solicitado. Quando armazenamos dados, protegemos dentro de meios comercialmente aceitáveis para evitar perdas e roubos, bem como acesso, divulgação, cópia, uso ou modificação não autorizados. Não compartilhamos informações de identificação pessoal publicamente ou com terceiros, exceto quando exigido por lei.',
  },
  {
    kind: 'p',
    text: 'O nosso site pode ter links para sites externos que não são operados por nós. Esteja ciente de que não temos controle sobre o conteúdo e práticas desses sites e não podemos aceitar responsabilidade pelas suas respetivas políticas de privacidade.',
  },
  {
    kind: 'p',
    text: 'Está no seu direito de recusar a nossa solicitação de informações pessoais, entendendo que talvez não possamos fornecer alguns dos serviços desejados. O uso continuado do nosso site será considerado como aceitação das nossas práticas em torno de privacidade e informações pessoais. Se você tiver alguma dúvida sobre como lidamos com dados do utilizador e informações pessoais, entre em contacto connosco.',
  },

  { kind: 'h2', text: 'Política de cookies', id: 'cookies' },
  { kind: 'h3', text: 'O que são cookies?' },
  {
    kind: 'p',
    text: 'Utilizamos cookies e tecnologias semelhantes para garantir o correto funcionamento da nossa loja online, melhorar a sua experiência de navegação e apresentar conteúdos e ofertas relevantes, em conformidade com o Regulamento Geral sobre a Proteção de Dados (RGPD).',
  },
  {
    kind: 'p',
    text: 'Cookies são pequenos arquivos de texto armazenados no seu dispositivo (computador, tablet ou smartphone) quando você visita um site. Eles permitem reconhecer o seu dispositivo e lembrar determinadas informações sobre a sua navegação.',
  },
  { kind: 'h3', text: 'Como usamos os cookies?' },
  {
    kind: 'p',
    text: 'Utilizamos cookies por vários motivos, detalhados abaixo. Infelizmente, na maioria dos casos, não existem opções padrão do setor para desativar os cookies sem desativar completamente a funcionalidade e os recursos que eles adicionam a este site. É recomendável que deixe todos os cookies se não tiver a certeza se precisa ou não deles, caso sejam usados para fornecer um serviço que pretende usar.',
  },
  { kind: 'h3', text: 'Desativar cookies' },
  {
    kind: 'p',
    text: 'Ao aceder ao nosso site, você pode aceitar, recusar ou personalizar o uso de cookies através do banner de consentimento. Também é possível alterar as suas preferências a qualquer momento.',
  },
  {
    kind: 'p',
    text: 'Pode configurar o seu navegador para bloquear ou eliminar cookies. Note que a desativação de cookies essenciais pode afetar o funcionamento do site.',
  },
  { kind: 'h3', text: 'Cookies que definimos' },
  {
    kind: 'ul',
    items: [
      {
        lead: 'Cookies relacionados com o login.',
        text: 'Utilizamos cookies quando tem sessão iniciada, para que possamos memorizar essa ação. Isso evita que precise de fazer login sempre que visitar uma nova página. Esses cookies são normalmente removidos ou limpos quando efetua logout para garantir que possa aceder apenas a recursos e áreas restritas ao efetuar login.',
      },
      {
        lead: 'Cookies relacionados com newsletters por e-mail.',
        text: 'Este site oferece serviços de assinatura de newsletters informativas ou e-mail e os cookies podem ser usados para lembrar se já está registado e se deve mostrar determinadas notificações válidas apenas para utilizadores inscritos / não inscritos.',
      },
      {
        lead: 'Cookies relacionados com o processamento de pedidos.',
        text: 'Este site oferece facilidades de comércio eletrónico e pagamento e alguns cookies são essenciais para garantir que o seu pedido seja lembrado entre as páginas, para que possamos processá-lo adequadamente.',
      },
      {
        lead: 'Cookies relacionados com pesquisas.',
        text: 'Periodicamente, oferecemos pesquisas e questionários para fornecer informações interessantes, ferramentas úteis ou para entender a nossa base de utilizadores com maior precisão. Essas pesquisas podem usar cookies para lembrar quem já participou numa pesquisa ou para fornecer resultados precisos após a alteração das páginas.',
      },
      {
        lead: 'Cookies relacionados com formulários.',
        text: 'Quando envia dados através de um formulário, os cookies podem ser configurados para lembrar os detalhes do utilizador para correspondência futura.',
      },
      {
        lead: 'Cookies de preferências do site.',
        text: 'Para proporcionar uma ótima experiência neste site, fornecemos a funcionalidade para definir as suas preferências de como esse site é executado quando o usa. Para guardar as suas preferências, precisamos de recorrer aos cookies para que essas informações possam ser processadas sempre que interagir com uma página.',
      },
    ],
  },
];

export const TERMS: LegalBlock[] = [
  {
    kind: 'p',
    text: 'O acesso e a navegação na loja online www.callmeophelia.com estão sujeitos aos presentes termos e condições, que integram as condições gerais de venda da loja, assim como a política de privacidade apresentadas pela RECEITA CONSISTENTE LDA, NIPC 517225085, com sede na Rua Rosa Parracho nº27, Cascais, com o e-mail info@callmeophelia.com e o número de telefone +351962363861.',
  },

  { kind: 'h2', text: 'Âmbito' },
  {
    kind: 'p',
    text: 'Ao utilizar www.callmeophelia.com o cliente está a concordar com os termos e condições aqui presentes. Os termos e condições podem ser atualizados ocasionalmente.',
  },

  { kind: 'h2', text: 'Produtos e informações' },
  {
    kind: 'p',
    text: 'Fazemos todos os esforços para garantir que as descrições, imagens, preços e características dos produtos sejam corretos. No entanto, pequenas variações podem ocorrer, nomeadamente em cores ou embalagens. Reservamo-nos o direito de alterar produtos, preços ou promoções sem aviso prévio.',
  },

  { kind: 'h2', text: 'Processo de compra' },
  {
    kind: 'p',
    text: 'A Ophelia oferece aos seus clientes uma ampla variedade de artigos relativos a Pastelaria, Azeite, Mel, Doces Caseiros, Merchandising da marca, entre outros.',
  },
  {
    kind: 'p',
    text: 'A compra é efetuada através da seleção dos produtos, preenchimento dos dados necessários e confirmação do pagamento. A encomenda só será considerada válida após confirmação do pagamento.',
  },
  {
    kind: 'p',
    text: 'Dado que os nossos produtos principais são produzidos no próprio dia de entrega, a Ophelia não processa encomendas que não estejam pagas.',
  },
  {
    kind: 'p',
    text: 'As imagens dos produtos na loja online são apenas uma ilustração dos mesmos, não constituindo por si só propostas vinculativas de venda. A sua utilização, reprodução, cópia e divulgação sem aviso prévio é proibida.',
  },

  { kind: 'h2', text: 'Preços' },
  {
    kind: 'p',
    text: 'Aos preços indicados já se encontra incluído o IVA à taxa legal em vigor, aos quais acrescem valores de portes de envio, quando aplicáveis. A Ophelia apenas desenvolve relações comerciais com consumidores finais. Não se efetuam taxas especiais ao comércio de grossistas, nem descontos de revendedor. Os produtos são vendidos apenas para compradores privados, podendo estes ser empresas. A Ophelia reserva o direito de alterar os preços em qualquer momento. No entanto, a Ophelia compromete-se a aplicar as taxas e preços indicados no momento da realização do pedido de compra. No caso de ocorrência de erro informático, manual, técnico, ou de qualquer outra origem, que cause uma alteração substancial não prevista pela Ophelia no preço de venda ao público, de tal modo que este se transforme exorbitante ou manifestamente irrisório, o pedido de compra será considerado inválido e anulado. Neste caso, o montante pago pelo cliente será devolvido ao mesmo.',
  },

  { kind: 'h2', text: 'Política de entrega' },
  {
    kind: 'p',
    text: 'A Ophelia honrará as encomendas recebidas online até ao limite dos stocks disponíveis. Na falta de disponibilidade do produto/serviço a Ophelia compromete-se a informar o Cliente logo que lhe seja possível. Quando a encomenda for entregue, a Ophelia recomenda que o cliente verifique se todos os produtos chegaram como devido. Assim, poderá confirmar de imediato que a encomenda foi totalmente entregue e nas devidas condições.',
  },
  {
    kind: 'p',
    text: 'As encomendas serão entregues ao cliente por empresas de correio ou outras empresas que efetuem entregas. A encomenda será considerada entregue quando a transportadora entregar a encomenda ao cliente, e o cliente assinar o documento de recibo de entrega. É da responsabilidade do cliente verificar o estado das embalagens (encomendas/embalagens) no momento da receção e indicar quaisquer anomalias na nota de entrega (condição essencial, caso contrário não será aceite qualquer reclamação por rutura de transporte).',
  },
  {
    kind: 'p',
    text: 'No momento da entrega: assim que o consumidor toma posse dos bens, o risco de perda ou dano é transferido para ele. É, portanto, importante:',
  },
  {
    kind: 'ul',
    items: [
      'Não ceda à pressão dos entregadores, tome o tempo necessário para examinar os seus bens.',
      'Não assinar a nota de entrega até ter verificado o estado das caixas, e se possível, o estado da mercadoria.',
    ],
  },
  {
    kind: 'p',
    text: 'Se, ao inspecionar produtos, se verificar que não estão em conformidade com a encomenda ou que foram danificados durante o transporte, tem a opção de rejeitar os bens, indicando explicitamente as suas reservas na nota de entrega (condição obrigatória para fazer qualquer reclamação por quebra ou dano durante o transporte). Caso não seja reportado nenhum problema aquando da entrega, a encomenda será marcada como concluída com sucesso e a Ophelia poderá não se responsabilizar por qualquer dano que ocorra a partir de então.',
  },
  {
    kind: 'p',
    text: 'A Ophelia não se responsabiliza por atrasos na entrega atribuíveis a terceiros (transportadora, greves, condições climáticas, etc.).',
  },
  {
    kind: 'p',
    text: 'Tentaremos fazer tudo para que a entrega seja feita com sucesso na primeira tentativa de entrega. É objetivo da empresa entregar todas as encomendas no dia selecionado. No entanto, para evitar qualquer incidência no processo de entrega, deverá garantir que tem alguém na morada indicada para receber a encomenda. Em suma, a Ophelia não se responsabiliza pelos seguintes erros/incidentes:',
  },
  {
    kind: 'ul',
    items: [
      'morada incompleta, isto é, sem número de porta e/ou andar;',
      'morada, código-postal ou localidade incorreto;',
      'contacto(s) telefónico(s) errados ou incontactáveis;',
      'intercomunicador ou campainha avariados sem aviso prévio e contacto telefónico;',
      'ausência do destinatário ou outra pessoa que possa receber na morada e horário selecionados;',
      'encomenda recusada por parte do destinatário ou na receção de empresas, hospitais ou outro tipo de estabelecimentos.',
    ],
  },
  {
    kind: 'p',
    text: 'O prazo de entrega estimado é de 2 a 5 dias úteis após a expedição (desde que todos os produtos da encomenda estejam em stock).',
  },

  { kind: 'h2', text: 'Política de devolução' },
  {
    kind: 'p',
    text: 'De acordo com o Decreto-Lei português n.º 24/2014, artigo 17.º, alínea e), os clientes não beneficiam do direito de retratação de 14 dias, uma vez que os produtos da Ophelia são produtos alimentares perecíveis sujeitos a rápida deterioração ou personalizados. No entanto, os clientes têm direito a:',
  },
  {
    kind: 'ul',
    items: [
      'Apresentar uma reclamação se o produto chegar danificado, com defeito, vencido ou incorreto.',
      'Nesses casos, o cliente deve entrar em contacto connosco em até 24 horas após a entrega, por e-mail, no endereço info@callmeophelia.com, informando o número do pedido e, se possível, uma foto do problema.',
      'A Ophelia compromete-se a substituir o produto ou reembolsar o preço de compra, sem custos adicionais para o cliente.',
    ],
  },
  {
    kind: 'p',
    text: 'No caso de reentrega da sua encomenda, a Ophelia não se responsabiliza se algum dos produtos não estiver em condições no dia da reentrega. Será informado caso algum dos produtos não se encontre em condições. Este tipo de situações não dá direito a reembolso por se tratar de um produto perecível e por não ter sido entregue devido a algum dos pontos enumerados nas políticas de entrega, e que não é responsabilidade da Ophelia.',
  },
  {
    kind: 'p',
    text: 'Alterações de morada, código postal ou localidade devem ser efetuadas através de um operador da Ophelia pelas vias disponíveis (telefone ou email) no próprio dia da encomenda. No próprio dia pode estar sujeito a disponibilidade de distribuição e poderá estar sujeito a um pagamento extra, consoante o tipo de alteração.',
  },
  { kind: 'p', text: 'O reembolso tem um prazo máximo de 15 dias úteis.' },

  { kind: 'h2', text: 'Métodos de pagamento' },
  {
    kind: 'p',
    text: 'As encomendas podem ser pagas pelos métodos de pagamento abaixo. A Ophelia reserva o direito de aceitar determinados meios de pagamento, em casos específicos, ou dependendo do tipo de envio escolhido pelos clientes. Não é possível efetuar pagamento por cheque ou envio de dinheiro.',
  },
  { kind: 'h3', text: 'Pagamento por cartão de crédito' },
  {
    kind: 'p',
    text: 'No caso de pagamento por cartão de crédito, os montantes ficam cativos uma semana depois do envio dos produtos. A Ophelia aceita pagamentos via MasterCard, Visa e American Express.',
  },
  { kind: 'h3', text: 'Pagamento por Multibanco' },
  {
    kind: 'p',
    text: 'Os pagamentos por Multibanco podem ser efetuados através da rede de caixas Multibanco. Ao finalizar a sua encomenda será gerada uma referência Multibanco. O cliente receberá esta referência no e-mail de confirmação da encomenda. Se não encontrar o e-mail, verifique a caixa de SPAM. A encomenda não é produzida enquanto não for paga. Recomenda-se que a encomenda seja paga dois dias antes do dia da entrega.',
  },
  { kind: 'h3', text: 'Pagamento por PayPal' },
  {
    kind: 'p',
    text: 'Os pagamentos via PayPal podem ser feitos através da conta PayPal do cliente ou com cartão de crédito. Neste caso, o pagamento será processado pelo PayPal, mesmo que o cliente utilize o seu cartão de crédito, uma vez que não é obrigatório ter uma conta PayPal para utilizar este meio de pagamento.',
  },

  { kind: 'h2', text: 'Garantia' },
  {
    kind: 'p',
    text: 'Os produtos alimentares comercializados pela Ophelia estão abrangidos pela garantia legal de conformidade, limitada ao prazo de validade indicado na embalagem. A garantia cobre exclusivamente defeitos de fabrico, problemas de qualidade ou danos ocorridos durante o transporte. Não serão aceites reclamações nos seguintes casos:',
  },
  {
    kind: 'ul',
    items: [
      'Armazenamento incorreto por parte do cliente (ex. exposição a calor, humidade ou após abertura da embalagem).',
      'Alterações naturais de sabor ou textura ao longo do tempo, desde que dentro do prazo de validade.',
      'Consumo após o prazo de validade.',
    ],
  },

  { kind: 'h2', text: 'Reclamações e resolução de litígios' },
  {
    kind: 'p',
    text: 'O cliente pode apresentar reclamações diretamente através do email info@callmeophelia.com. A Ophelia disponibiliza ainda acesso ao Livro de Reclamações Eletrónico: www.livroreclamacoes.pt. Antes de recorrer aos tribunais, o cliente tem o direito de tentar resolver qualquer litígio extrajudicialmente através da Plataforma Europeia de Resolução de Litígios em Linha (RLL): https://webgate.ec.europa.eu/odr. Em Portugal, o cliente pode igualmente recorrer aos Centros de Arbitragem de Conflitos de Consumo: www.consumidor.gov.pt.',
  },

  { kind: 'h2', text: 'Privacidade e proteção de dados' },
  {
    kind: 'ul',
    items: [
      'Os dados pessoais são tratados em conformidade com o Regulamento (UE) 2016/679 (RGPD).',
      'Os dados são utilizados exclusivamente para processamento de pedidos e comunicação com o cliente.',
      'Os clientes podem, a qualquer momento, aceder, corrigir ou solicitar a exclusão dos seus dados entrando em contacto com info@callmeophelia.com.',
    ],
  },

  { kind: 'h2', text: 'Direito de propriedade' },
  {
    kind: 'p',
    text: 'Todos os produtos e bens são propriedade da Ophelia até que se realize o pagamento total dos mesmos, por parte do cliente. Antes da transmissão de propriedade, quer a doação, a transferência de propriedade como forma de garantia, o processamento ou a remodelação não são permitidas sem a aprovação da Ophelia.',
  },

  { kind: 'h2', text: 'Legislação' },
  {
    kind: 'p',
    text: 'As presentes condições gerais e todos os contratos que vierem a ser celebrados ao abrigo da mesma regem-se pela legislação portuguesa. O website da Ophelia pode conter ligações a outros websites sobre os quais não exerce qualquer controlo, nem é responsável pelo seu conteúdo.',
  },
  {
    kind: 'p',
    text: 'A inclusão de ligações a outros websites é feita unicamente como referência informativa e sem nenhum tipo de opinião sobre os conteúdos, proprietários, serviços ou produtos oferecidos. A Ophelia reserva-se o direito de exigir a retirada de qualquer comentário que considerar menos próprio, sendo este critério exclusivamente da sua responsabilidade.',
  },

  { kind: 'h2', text: 'Disposições finais' },
  {
    kind: 'p',
    text: 'A Ophelia reserva-se o direito de alterar estes Termos e Condições a qualquer momento, sem aviso prévio. Será aplicada a versão publicada no site no momento do pedido. Para quaisquer dúvidas sobre estes Termos e Condições, os clientes podem entrar em contacto connosco por e-mail no endereço info@callmeophelia.com.',
  },
];

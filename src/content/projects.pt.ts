import type { CaseSection } from './projects';
import { KERN_NAME } from './names';

// =========================================
// Case-study bodies in Portuguese.
//
// projects.ts holds the English source. Projects listed here read in
// Portuguese when the site is in PT; the rest fall back to English with
// the "this case is in English" note. Same images, same order: only the
// words change, so keep both files in step when a case is edited.
// =========================================

export const caseSectionsPt: Record<string, CaseSection[]> = {
  ilha: [
    {
      type: 'lead',
      body:
        'A Ilha faz o Windows se comportar como um Mac onde importa no dia a dia: um notch no estilo da Dynamic Island, feito como um único app nativo em Rust, sem navegador embutido e sem instalador de terceiros.',
    },
    {
      type: 'image',
      src: '/projects/ilha/inicio.webp',
      alt: 'Ilha — página inicial: relógio, clima, o dia, água e música',
      caption: 'Início: relógio, clima, o que tem para hoje, a água e a música tocando.',
    },
    { type: 'heading', text: 'O que ela faz' },
    {
      type: 'list',
      items: [
        'Música de qualquer player que avisa o Windows, com capa, controles e letra sincronizada pelo lrclib.net.',
        'Avisos do sistema no lugar dos do Windows: volume, brilho, layout do teclado, bateria, rede, fones.',
        'Agenda com lembretes que avisam dez minutos antes e mostram um botão Entrar para links de chamada.',
        'Histórico da área de transferência em memória, timer de foco e cronômetro, meta de água com lembretes e arquivos guardados na ilha.',
        'Busca com Alt+Espaço para apps, arquivos, configurações, contas e conversão de unidades.',
      ],
    },
    {
      type: 'image',
      src: '/projects/ilha/musica.webp',
      alt: 'Ilha — página de música com letra sincronizada',
      caption: 'Página de música: a linha sendo cantada, com a letra inteira a um clique.',
    },
    { type: 'heading', text: 'A Ayla, dentro da ilha' },
    {
      type: 'paragraph',
      body:
        'Diga "Ayla" e o pedido, ou toque nos olhos dela com a ilha aberta. Comandos diretos — próxima música, volume, timers, água, abrir um app — rodam no próprio PC, sem internet. Perguntas vão para o Gemini com um resumo curto do momento (hora, música, foco, água, clima, agenda), então ela responde sem precisar perguntar de volta, e age em cima do resultado.',
    },
    {
      type: 'paragraph',
      body:
        'Os olhos dela mostram o estado: arregalados ouvindo, apertados e olhando de lado pensando, pulando enquanto fala, âmbar com a cabeça inclinada quando precisa de um sim. Parada, ela espia de vez em quando e dorme quando o PC descansa.',
    },
  ],

  designon: [
    {
      type: 'lead',
      body:
        'O DesignOn virou o app principal da empresa. Ele junta três coisas que viviam separadas: o estoque físico, os pedidos de material da equipe e o dinheiro.',
    },
    { type: 'heading', text: 'O que ele faz' },
    {
      type: 'list',
      items: [
        'Estoque físico mapeado nos andares e áreas reais da empresa, com etiquetas QR que abrem um local ou um produto direto pela câmera do celular.',
        'Pedidos de material da equipe, ligados ao estoque, para ninguém ficar sem material na obra e ninguém comprar duas vezes.',
        'Fluxo de caixa para o dono: entradas e saídas, contas a pagar e a receber, contas fixas, DRE e lucro por serviço.',
        'Um modo simples para quem está em campo — três abas: pedir material, os serviços em que está (checklist, pausar com motivo, finalizar com foto) e eu.',
        'Notificações nativas para pedidos novos, estoque baixo, pedidos prontos e contas vencendo.',
      ],
    },
    { type: 'heading', text: 'Feito para o chão da empresa, não para o escritório' },
    {
      type: 'paragraph',
      body:
        'A maior parte do uso acontece com uma mão só, no celular, no depósito ou na obra. O que a equipe marca sem sinal fica guardado no celular e sincroniza quando a conexão volta. Os dados de dinheiro só chegam ao aparelho do administrador, e os serviços finalizados mandam o resumo e a foto para o grupo da equipe, guardando só o resumo depois de uma semana.',
    },
    {
      type: 'image',
      src: '/projects/designon/producao.webp',
      alt: 'Quadro de produção: obras passando de aprovado a entregue',
      caption: 'Produção: cada obra numa etapa; a equipe avança pelo celular.',
    },
    {
      type: 'gallery',
      images: [
        { src: '/projects/designon/pedidos.webp', alt: 'Pedidos de material da equipe com o status de cada um', caption: 'Pedidos: o que a equipe pediu e se tem tudo no estoque.' },
        { src: '/projects/designon/locais.webp', alt: 'Mapa dos andares e áreas com o que cada um guarda', caption: 'Locais: andares, áreas e prateleiras, com o que tem em cada um.' },
        { src: '/projects/designon/caixa.webp', alt: 'Resumo do caixa com entradas, saídas e o resultado do mês', caption: 'Caixa: o que entrou, o que saiu, o que falta receber e pagar.' },
        { src: '/projects/designon/estoque.webp', alt: 'Lista do estoque com os itens baixos marcados', caption: 'Estoque: onde está cada material, com os que estão acabando marcados.' },
      ],
    },
    {
      type: 'gallery',
      images: [
        { src: '/projects/designon/celular-inicio.webp', alt: 'Tela inicial no celular', caption: 'No celular, o mesmo app.', variant: 'mobile' },
        { src: '/projects/designon/celular-pedidos.webp', alt: 'Pedidos no celular', caption: 'Pedidos na obra.', variant: 'mobile' },
      ],
    },
    {
      type: 'paragraph',
      body: 'As telas aqui rodam com uma empresa de demonstração, com materiais, obras e valores inventados; o estoque e as finanças reais continuam privados.',
    },
  ],

  kern: [
    {
      type: 'lead',
      body:
        'Um programa para o trabalho inteiro da oficina: desenhar ou importar, encaixar as peças na chapa, gerar os percursos da ferramenta, conferir e salvar o G-code — com Router, Laser e Impressão 3D como três áreas de trabalho lado a lado.',
    },
    {
      type: 'image',
      src: '/projects/kern/tela.webp',
      alt: `${KERN_NAME} — área do router com um percurso sendo simulado`,
      caption: 'Área do router: letreiro com o caminho de corte, propriedades e a simulação do percurso.',
    },
    { type: 'heading', text: 'Como funciona' },
    {
      type: 'list',
      items: [
        'Editor nativo com camadas, snap, edição numérica, ferramentas de transformação e desfazer/refazer centralizado.',
        'Importação de DXF e SVG; STL e 3MF vão direto para a mesa da impressão 3D.',
        'Operações de CAM — contorno, bolsão e furação — com biblioteca de ferramentas e saída em G-code.',
        'Um formato de projeto .kern em JSON legível e versionado: versões novas continuam abrindo projetos antigos.',
        'Receitas: um trabalho que se repete, salvo uma vez e aplicado em um clique.',
      ],
    },
    {
      type: 'image',
      src: '/projects/kern/chapa.webp',
      alt: `${KERN_NAME} — peças encaixadas na chapa`,
      caption: 'Encaixe: as peças organizadas na chapa antes do corte.',
    },
    {
      type: 'paragraph',
      body:
        'Cada área de trabalho tem o próprio arquivo, título, histórico de desfazer e lista de recentes, então abrir um desenho no router nunca mexe no que está no laser. A tela inicial mostra as três áreas, as máquinas da oficina e os desenhos recentes com miniaturas.',
    },
    {
      type: 'image',
      src: '/projects/kern/conferir.webp',
      alt: `${KERN_NAME} — conferindo o trabalho antes de salvar`,
      caption: 'Conferir antes de cortar.',
    },
  ],
};

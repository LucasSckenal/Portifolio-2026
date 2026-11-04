// =========================================
// Translated summary copy for each project.
//
// projects.ts holds the English source (and the full case-study bodies,
// which stay in English for now). This file translates the short layer
// every visitor reads: status line, tagline, home description and team.
// English falls back to the source, so only the other locales live here.
// =========================================

import type { Locale } from '@/lib/i18n';

export type ProjectCopy = {
  status: string;
  tagline: string;
  // Longer pitch shown on the home project scenes
  summary: string;
  team?: string;
};

type Slug =
  | 'ilha'
  | 'kern'
  | 'designon'
  | 'ma-finance-os'
  | 'nexo'
  | 'lj-treinamento-integrado'
  | 'onde-estao-os-netos'
  | 'medical-chatbot'
  | 'phantom-commerce';

export const projectCopy: Record<Locale, Record<Slug, ProjectCopy>> = {
  en: {
    designon: {
      status: "Internal · In daily use",
      tagline: "Stock, requests and cash for one company, in the pocket of whoever is on site.",
      summary:
        "An internal app for a visual communication company: stock by floor and area, the crew's material requests and the cash flow, as a PWA on the team's phones.",
    },
    ilha: {
      status: "Personal · Daily use",
      tagline: "A Dynamic Island for Windows, with an assistant that acts.",
      summary:
        "A lightweight notch for Windows in native Rust — music with synced lyrics, notices, agenda, clipboard, focus and water — with Ayla, a voice assistant on Gemini that controls the PC.",
    },
    kern: {
      status: "Desktop · Released builds",
      tagline: "CAD/CAM for the workshop: from drawing to G-code.",
      summary:
        "A 2D/2.5D CAD/CAM app for Windows that prepares CNC router, laser and 3D printing jobs — nesting, toolpaths and G-code in one program.",
    },
    'ma-finance-os': {
      status: 'Live · In production',
      tagline: 'A minimalist operating system for personal finance — with AI that acts.',
      summary:
        "A minimalist operating system for personal finance — net worth, budgets, goals, and investments tracked in real time, with a Gemini-powered assistant that doesn't just answer questions, it executes actions on your behalf.",
    },
    nexo: {
      status: 'Live · In production',
      tagline: 'A team workspace where AI is part of the team.',
      summary:
        'A team workspace where AI is part of the team — Kanban boards, backlog, client and member management, analytics, and a Gemini assistant that drafts tasks and refines text from inside the work, not from a sidebar.',
    },
    'lj-treinamento-integrado': {
      status: 'Live · Production',
      tagline: 'A boutique training studio that sells trust before it sells classes.',
      summary:
        'A marketing and booking site for a boutique training studio in Ijuí — max four students per class, single specialist trainer. The site reads like a private practice, not a gym. Free slots link straight to WhatsApp reservations, no friction account creation.',
      team: 'Solo · Client: Luis Joris',
    },
    'onde-estao-os-netos': {
      status: 'v1.0 · In development · PI-4',
      tagline: 'A Tower Defense built for the player we never see.',
      summary:
        'A Tower Defense game where grandparents Afonso and Berta — pulled into an antique board game — must cross six themed worlds to rescue their grandchildren. Day-and-night loop with roguelike power-ups and an in-game AI advisor. Built in Godot 4.6 and designed from the start around accessibility for elderly players.',
      team: 'Team of 4 · SENAC · UI / Frontend systems',
    },
    'medical-chatbot': {
      status: 'Academic · Live demo · PI-3',
      tagline: 'Voice or text symptoms, translated into structured triage.',
      summary:
        'A multilingual medical assistant that turns patient symptoms — spoken or typed — into structured reports for faster clinical triage. Persistent medical profiles, diagnostic history, voice + text input, and full UI theming. React + Vite frontend, Node + Express backend, Firebase Auth + Firestore.',
      team: 'Team of 3 · Unijui · Front-End lead',
    },
    'phantom-commerce': {
      status: 'Academic · Concept',
      tagline: 'The store as exhibit, not as catalogue.',
      summary:
        'A gaming-focused commerce platform built around premium product presentation, animated interactions, and a glass-deep visual language. The store as exhibit, not as catalogue. Full-stack Next.js with Firebase for auth and Firestore for the product / user data.',
      team: 'Team of 3 · Unijui',
    },
  },

  pt: {
    designon: {
      status: "Interno · Uso diário",
      tagline: "Estoque, pedidos e caixa de uma empresa, no bolso de quem está na obra.",
      summary:
        "Um app interno para uma empresa de comunicação visual: estoque por andar e área, pedidos de material da equipe e o caixa, como PWA no celular do time.",
    },
    ilha: {
      status: "Pessoal · Uso diário",
      tagline: "Uma Dynamic Island para o Windows, com uma assistente que age.",
      summary:
        "Um notch leve para o Windows em Rust nativo — música com letra sincronizada, avisos, agenda, clipboard, foco e água — com a Ayla, assistente de voz no Gemini que comanda o PC.",
    },
    kern: {
      status: "Desktop · Versões publicadas",
      tagline: "CAD/CAM para a oficina: do desenho ao G-code.",
      summary:
        "Um programa CAD/CAM 2D/2.5D para Windows que prepara trabalhos de fresa CNC, laser e impressão 3D — organização na chapa, percursos e G-code num programa só.",
    },
    'ma-finance-os': {
      status: 'No ar · Em produção',
      tagline: 'Um sistema operacional minimalista para finanças pessoais — com uma IA que age.',
      summary:
        'Um sistema operacional minimalista para finanças pessoais — patrimônio, orçamentos, metas e investimentos acompanhados em tempo real, com um assistente movido a Gemini que não só responde perguntas: executa ações por você.',
    },
    nexo: {
      status: 'No ar · Em produção',
      tagline: 'Um workspace de equipe onde a IA faz parte do time.',
      summary:
        'Um workspace de equipe onde a IA faz parte do time — quadros Kanban, backlog, gestão de clientes e membros, analytics e um assistente Gemini que rascunha tarefas e refina textos de dentro do trabalho, não de uma barra lateral.',
    },
    'lj-treinamento-integrado': {
      status: 'No ar · Produção',
      tagline: 'Um estúdio de treinamento boutique que vende confiança antes de vender aulas.',
      summary:
        'Site institucional e de agendamento para um estúdio de treinamento boutique em Ijuí — no máximo quatro alunos por turma, um único treinador especialista. O site parece um consultório particular, não uma academia. Horários livres levam direto à reserva pelo WhatsApp, sem precisar criar conta.',
      team: 'Solo · Cliente: Luis Joris',
    },
    'onde-estao-os-netos': {
      status: 'v1.0 · Em desenvolvimento · PI-4',
      tagline: 'Um Tower Defense feito para o jogador que a gente nunca vê.',
      summary:
        'Um jogo Tower Defense em que os avós Afonso e Berta — puxados para dentro de um jogo de tabuleiro antigo — precisam atravessar seis mundos temáticos para resgatar os netos. Ciclo de dia e noite com power-ups roguelike e um conselheiro de IA dentro do jogo. Feito em Godot 4.6 e pensado desde o início para a acessibilidade de jogadores idosos.',
      team: 'Equipe de 4 · SENAC · UI / sistemas de frontend',
    },
    'medical-chatbot': {
      status: 'Acadêmico · Demo no ar · PI-3',
      tagline: 'Sintomas por voz ou texto, traduzidos em triagem estruturada.',
      summary:
        'Um assistente médico multilíngue que transforma os sintomas do paciente — falados ou digitados — em relatórios estruturados para uma triagem clínica mais rápida. Perfis médicos persistentes, histórico de diagnósticos, entrada por voz e texto e temas completos de interface. Frontend em React + Vite, backend em Node + Express, Firebase Auth + Firestore.',
      team: 'Equipe de 3 · Unijui · Líder de front-end',
    },
    'phantom-commerce': {
      status: 'Acadêmico · Conceito',
      tagline: 'A loja como exposição, não como catálogo.',
      summary:
        'Uma plataforma de e-commerce voltada a games, construída em torno de uma apresentação premium dos produtos, interações animadas e uma linguagem visual de vidro profundo. A loja como exposição, não como catálogo. Next.js full-stack com Firebase para autenticação e Firestore para os dados de produtos e usuários.',
      team: 'Equipe de 3 · Unijui',
    },
  },

  es: {
    designon: {
      status: "Interno · Uso diario",
      tagline: "Stock, pedidos y caja de una empresa, en el bolsillo de quien está en obra.",
      summary:
        "Una app interna para una empresa de comunicación visual: stock por piso y área, pedidos de material del equipo y la caja, como PWA en el móvil del equipo.",
    },
    ilha: {
      status: "Personal · Uso diario",
      tagline: "Una Dynamic Island para Windows, con una asistente que actúa.",
      summary:
        "Un notch ligero para Windows en Rust nativo — música con letra sincronizada, avisos, agenda, portapapeles, foco y agua — con Ayla, asistente de voz en Gemini que controla el PC.",
    },
    kern: {
      status: "Escritorio · Versiones publicadas",
      tagline: "CAD/CAM para el taller: del dibujo al G-code.",
      summary:
        "Un programa CAD/CAM 2D/2.5D para Windows que prepara trabajos de fresadora CNC, láser e impresión 3D — anidado en la plancha, trayectorias y G-code en un solo programa.",
    },
    'ma-finance-os': {
      status: 'En línea · En producción',
      tagline: 'Un sistema operativo minimalista para las finanzas personales — con una IA que actúa.',
      summary:
        'Un sistema operativo minimalista para las finanzas personales — patrimonio, presupuestos, metas e inversiones seguidos en tiempo real, con un asistente impulsado por Gemini que no solo responde preguntas: ejecuta acciones por ti.',
    },
    nexo: {
      status: 'En línea · En producción',
      tagline: 'Un espacio de trabajo donde la IA es parte del equipo.',
      summary:
        'Un espacio de trabajo en equipo donde la IA es parte del equipo — tableros Kanban, backlog, gestión de clientes y miembros, analíticas y un asistente Gemini que redacta tareas y pule textos desde dentro del trabajo, no desde una barra lateral.',
    },
    'lj-treinamento-integrado': {
      status: 'En línea · Producción',
      tagline: 'Un estudio de entrenamiento boutique que vende confianza antes que clases.',
      summary:
        'Sitio de marketing y reservas para un estudio de entrenamiento boutique en Ijuí — máximo cuatro alumnos por clase, un único entrenador especialista. El sitio se lee como una consulta privada, no como un gimnasio. Los horarios libres llevan directo a la reserva por WhatsApp, sin crear cuenta.',
      team: 'Solo · Cliente: Luis Joris',
    },
    'onde-estao-os-netos': {
      status: 'v1.0 · En desarrollo · PI-4',
      tagline: 'Un Tower Defense hecho para el jugador que nunca vemos.',
      summary:
        'Un juego Tower Defense en el que los abuelos Afonso y Berta — atrapados en un antiguo juego de mesa — deben cruzar seis mundos temáticos para rescatar a sus nietos. Ciclo de día y noche con potenciadores roguelike y un consejero de IA dentro del juego. Hecho en Godot 4.6 y pensado desde el inicio para la accesibilidad de jugadores mayores.',
      team: 'Equipo de 4 · SENAC · UI / sistemas frontend',
    },
    'medical-chatbot': {
      status: 'Académico · Demo en línea · PI-3',
      tagline: 'Síntomas por voz o texto, convertidos en un triaje estructurado.',
      summary:
        'Un asistente médico multilingüe que convierte los síntomas del paciente — hablados o escritos — en informes estructurados para un triaje clínico más rápido. Perfiles médicos persistentes, historial de diagnósticos, entrada por voz y texto y temas completos de interfaz. Frontend en React + Vite, backend en Node + Express, Firebase Auth + Firestore.',
      team: 'Equipo de 3 · Unijui · Líder de front-end',
    },
    'phantom-commerce': {
      status: 'Académico · Concepto',
      tagline: 'La tienda como exposición, no como catálogo.',
      summary:
        'Una plataforma de comercio enfocada en gaming, construida en torno a una presentación premium de productos, interacciones animadas y un lenguaje visual de vidrio profundo. La tienda como exposición, no como catálogo. Next.js full-stack con Firebase para la autenticación y Firestore para los datos de productos y usuarios.',
      team: 'Equipo de 3 · Unijui',
    },
  },

  it: {
    designon: {
      status: "Interno · Uso quotidiano",
      tagline: "Magazzino, richieste e cassa di un’azienda, in tasca a chi è in cantiere.",
      summary:
        "Un’app interna per un’azienda di comunicazione visiva: magazzino per piano e area, richieste di materiale della squadra e cassa, come PWA sui telefoni del team.",
    },
    ilha: {
      status: "Personale · Uso quotidiano",
      tagline: "Una Dynamic Island per Windows, con un’assistente che agisce.",
      summary:
        "Un notch leggero per Windows in Rust nativo — musica con testi sincronizzati, avvisi, agenda, appunti, focus e acqua — con Ayla, assistente vocale su Gemini che comanda il PC.",
    },
    kern: {
      status: "Desktop · Versioni pubblicate",
      tagline: "CAD/CAM per l’officina: dal disegno al G-code.",
      summary:
        "Un programma CAD/CAM 2D/2.5D per Windows che prepara lavori di fresa CNC, laser e stampa 3D — nesting sulla lastra, percorsi e G-code in un solo programma.",
    },
    'ma-finance-os': {
      status: 'Online · In produzione',
      tagline: 'Un sistema operativo minimalista per le finanze personali — con un’IA che agisce.',
      summary:
        'Un sistema operativo minimalista per le finanze personali — patrimonio, budget, obiettivi e investimenti seguiti in tempo reale, con un assistente basato su Gemini che non si limita a rispondere: esegue azioni al posto tuo.',
    },
    nexo: {
      status: 'Online · In produzione',
      tagline: 'Uno spazio di lavoro in cui l’IA fa parte del team.',
      summary:
        'Uno spazio di lavoro in cui l’IA fa parte del team — bacheche Kanban, backlog, gestione di clienti e membri, analytics e un assistente Gemini che scrive bozze di task e rifinisce i testi dall’interno del lavoro, non da una barra laterale.',
    },
    'lj-treinamento-integrado': {
      status: 'Online · Produzione',
      tagline: 'Uno studio di allenamento boutique che vende fiducia prima delle lezioni.',
      summary:
        'Sito di presentazione e prenotazione per uno studio di allenamento boutique a Ijuí — massimo quattro allievi per lezione, un solo allenatore specialista. Il sito si legge come uno studio privato, non come una palestra. Gli slot liberi portano dritti alla prenotazione su WhatsApp, senza creare un account.',
      team: 'Solo · Cliente: Luis Joris',
    },
    'onde-estao-os-netos': {
      status: 'v1.0 · In sviluppo · PI-4',
      tagline: 'Un Tower Defense pensato per il giocatore che non vediamo mai.',
      summary:
        'Un gioco Tower Defense in cui i nonni Afonso e Berta — risucchiati in un antico gioco da tavolo — devono attraversare sei mondi a tema per salvare i nipoti. Ciclo giorno-notte con potenziamenti roguelike e un consigliere IA nel gioco. Realizzato in Godot 4.6 e progettato fin dall’inizio per l’accessibilità dei giocatori anziani.',
      team: 'Team di 4 · SENAC · UI / sistemi frontend',
    },
    'medical-chatbot': {
      status: 'Accademico · Demo online · PI-3',
      tagline: 'Sintomi a voce o per iscritto, tradotti in un triage strutturato.',
      summary:
        'Un assistente medico multilingue che trasforma i sintomi del paziente — detti o scritti — in report strutturati per un triage clinico più rapido. Profili medici persistenti, storico delle diagnosi, input vocale e testuale e temi completi dell’interfaccia. Frontend in React + Vite, backend in Node + Express, Firebase Auth + Firestore.',
      team: 'Team di 3 · Unijui · Responsabile front-end',
    },
    'phantom-commerce': {
      status: 'Accademico · Concept',
      tagline: 'Il negozio come mostra, non come catalogo.',
      summary:
        'Una piattaforma di e-commerce dedicata al gaming, costruita attorno a una presentazione premium dei prodotti, interazioni animate e un linguaggio visivo di vetro profondo. Il negozio come mostra, non come catalogo. Next.js full-stack con Firebase per l’autenticazione e Firestore per i dati di prodotti e utenti.',
      team: 'Team di 3 · Unijui',
    },
  },

  ja: {
    designon: {
      status: "社内 · 毎日使用",
      tagline: "会社の在庫・資材依頼・資金を、現場の人のポケットに。",
      summary:
        "看板・サイン制作会社のための社内アプリ。フロアとエリアごとの在庫、チームの資材依頼、資金管理を、スタッフのスマホに入る PWA で。",
    },
    ilha: {
      status: "個人 · 毎日使用",
      tagline: "Windows のための Dynamic Island と、動いてくれるアシスタント。",
      summary:
        "ネイティブ Rust 製の Windows 用ノッチ。同期歌詞つきの音楽、通知、予定、クリップボード、集中、水分記録 — そして PC を操作する Gemini の音声アシスタント、Ayla。",
    },
    kern: {
      status: "デスクトップ · 公開ビルド",
      tagline: "工房のための CAD/CAM。図面から G-code まで。",
      summary:
        "CNC ルーター、レーザー、3D プリントの作業を準備する Windows 用 2D/2.5D CAD/CAM。板取り、ツールパス、G-code をひとつのプログラムで。",
    },
    'ma-finance-os': {
      status: '公開中 · 運用中',
      tagline: '個人の資産のための、ミニマルなオペレーティングシステム — 動く AI とともに。',
      summary:
        '個人の資産のためのミニマルなオペレーティングシステム。純資産、予算、目標、投資をリアルタイムで追跡し、Gemini を使ったアシスタントが質問に答えるだけでなく、あなたの代わりに操作まで行う。',
    },
    nexo: {
      status: '公開中 · 運用中',
      tagline: 'AI がチームの一員になるワークスペース。',
      summary:
        'AI がチームの一員になるワークスペース。カンバン、バックログ、クライアントとメンバーの管理、分析、そしてサイドバーではなく作業の中でタスクを下書きし文章を整える Gemini アシスタント。',
    },
    'lj-treinamento-integrado': {
      status: '公開中 · 本番',
      tagline: 'レッスンより先に信頼を届ける、ブティック型トレーニングスタジオ。',
      summary:
        'イジュイにあるブティック型トレーニングスタジオのための集客・予約サイト。1クラス最大4名、専任トレーナーは1人。ジムではなく個人の診療所のように読めるサイトで、空き枠からそのまま WhatsApp で予約でき、アカウント作成は不要。',
      team: '個人制作 · クライアント: Luis Joris',
    },
    'onde-estao-os-netos': {
      status: 'v1.0 · 開発中 · PI-4',
      tagline: '見えないプレイヤーのために作ったタワーディフェンス。',
      summary:
        '古いボードゲームに引き込まれた祖父母アフォンソとベルタが、孫を救うために6つのテーマ世界を越えていくタワーディフェンス。昼と夜のループ、ローグライクの強化、ゲーム内の AI アドバイザー。Godot 4.6 で制作し、最初から高齢のプレイヤーのアクセシビリティを軸に設計。',
      team: '4人チーム · SENAC · UI / フロントエンド',
    },
    'medical-chatbot': {
      status: '大学 · デモ公開中 · PI-3',
      tagline: '声や文字で伝えた症状を、構造化されたトリアージへ。',
      summary:
        '患者が話したり入力したりした症状を、構造化されたレポートに変えて診療前のトリアージを速める多言語の医療アシスタント。医療プロフィールの保存、診断履歴、音声とテキストの入力、UI テーマの切り替え。フロントエンドは React + Vite、バックエンドは Node + Express、Firebase Auth + Firestore。',
      team: '3人チーム · Unijui · フロントエンドリード',
    },
    'phantom-commerce': {
      status: '大学 · コンセプト',
      tagline: 'カタログではなく、展示としてのストア。',
      summary:
        'ゲーム向けのコマースプラットフォーム。上質な商品の見せ方、アニメーションするインタラクション、深いガラスのビジュアル言語を軸に構築。カタログではなく、展示としてのストア。Next.js のフルスタックで、認証に Firebase、商品とユーザーのデータに Firestore。',
      team: '3人チーム · Unijui',
    },
  },
};

export function getProjectCopy(slug: string, locale: Locale): ProjectCopy | undefined {
  return (projectCopy[locale] as Record<string, ProjectCopy>)[slug];
}

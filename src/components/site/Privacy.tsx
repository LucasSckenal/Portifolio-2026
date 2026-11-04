'use client';

import Link from 'next/link';
import { useLocale } from '@/components/providers/LanguageProvider';
import type { Locale } from '@/lib/i18n';
import { EMAIL } from './links';
import styles from './privacy.module.scss';

// Draft written from what the site actually does (lucas-patterns/legal):
// no cookies, no analytics, no forms; one local preference; hosting logs;
// one image served by GitHub. Review before publishing.
const TEXT: Record<Locale, { title: string; updated: string; back: string; items: Array<[string, string]> }> = {
  pt: {
    title: 'Privacidade',
    updated: 'Atualizado em novembro de 2026',
    back: 'Voltar',
    items: [
      ['O que este site coleta', 'Nada que identifique você. Não há formulários, contas, cookies de rastreamento, analytics nem pixels de anúncio.'],
      ['O que fica no seu navegador', 'Só o idioma que você escolher (e, na edição 2026, o tema claro ou escuro), salvos no armazenamento local e num cookie do próprio site (“lang”), só para lembrar a sua escolha e já abrir a página no seu idioma. Não é usado para rastrear nem é compartilhado; você pode apagar limpando os dados do site.'],
      ['Com quem o site conversa', 'O site é hospedado na Vercel, que registra dados técnicos de acesso (como endereço IP e navegador) para entregar as páginas e proteger o serviço. Uma imagem do projeto “Onde Estão os Netos?” é carregada do GitHub. Fontes, vídeos e as demais imagens são servidos pelo próprio site.'],
      ['Contato', 'Se você me escrever por e-mail ou WhatsApp, uso a mensagem só para responder. O WhatsApp é um serviço da Meta, com a política de privacidade dela. Para pedir acesso, correção ou exclusão de qualquer dado, escreva para o endereço abaixo.'],
    ],
  },
  en: {
    title: 'Privacy',
    updated: 'Updated November 2026',
    back: 'Back',
    items: [
      ['What this site collects', 'Nothing that identifies you. There are no forms, accounts, tracking cookies, analytics or ad pixels.'],
      ['What stays in your browser', 'Only the language you pick (and, in the 2026 edition, the light or dark theme), saved in local storage and in one first-party cookie (“lang”), only to remember your choice and open the page in your language. It is not used for tracking or shared; clearing the site data removes it.'],
      ['Who the site talks to', 'The site is hosted on Vercel, which logs technical access data (such as IP address and browser) to serve pages and protect the service. One image of the “Onde Estão os Netos?” project loads from GitHub. Fonts, videos and the other images are served by the site itself.'],
      ['Contact', 'If you write to me by email or WhatsApp, I use the message only to reply. WhatsApp is a Meta service, under its own privacy policy. To ask for access to, correction or deletion of any data, write to the address below.'],
    ],
  },
  es: {
    title: 'Privacidad',
    updated: 'Actualizado en noviembre de 2026',
    back: 'Volver',
    items: [
      ['Qué recoge este sitio', 'Nada que te identifique. No hay formularios, cuentas, cookies de rastreo, analíticas ni píxeles publicitarios.'],
      ['Qué queda en tu navegador', 'Solo el idioma que elijas (y, en la edición 2026, el tema claro u oscuro), guardado en el almacenamiento local y en una cookie propia del sitio (“lang”), solo para recordar tu elección y abrir la página en tu idioma. No se usa para rastrear ni se comparte; se borra al limpiar los datos del sitio.'],
      ['Con quién habla el sitio', 'El sitio está alojado en Vercel, que registra datos técnicos de acceso (como IP y navegador) para servir las páginas y proteger el servicio. Una imagen del proyecto “Onde Estão os Netos?” se carga desde GitHub. Fuentes, vídeos y las demás imágenes las sirve el propio sitio.'],
      ['Contacto', 'Si me escribes por email o WhatsApp, uso el mensaje solo para responder. WhatsApp es un servicio de Meta, con su propia política de privacidad. Para pedir acceso, corrección o eliminación de cualquier dato, escribe a la dirección de abajo.'],
    ],
  },
  it: {
    title: 'Privacy',
    updated: 'Aggiornato a novembre 2026',
    back: 'Indietro',
    items: [
      ['Cosa raccoglie questo sito', 'Niente che ti identifichi. Non ci sono moduli, account, cookie di tracciamento, analytics né pixel pubblicitari.'],
      ['Cosa resta nel tuo browser', 'Solo la lingua che scegli (e, nell’edizione 2026, il tema chiaro o scuro), salvata nella memoria locale e in un cookie del sito stesso (“lang”), solo per ricordare la scelta e aprire la pagina nella tua lingua. Non serve a tracciare e non viene condiviso; si cancella pulendo i dati del sito.'],
      ['Con chi parla il sito', 'Il sito è ospitato su Vercel, che registra dati tecnici di accesso (come IP e browser) per servire le pagine e proteggere il servizio. Un’immagine del progetto “Onde Estão os Netos?” viene caricata da GitHub. Font, video e le altre immagini sono serviti dal sito stesso.'],
      ['Contatto', 'Se mi scrivi via email o WhatsApp, uso il messaggio solo per rispondere. WhatsApp è un servizio di Meta, con la sua informativa sulla privacy. Per chiedere accesso, correzione o cancellazione di qualsiasi dato, scrivi all’indirizzo qui sotto.'],
    ],
  },
  ja: {
    title: 'プライバシー',
    updated: '2026年11月更新',
    back: '戻る',
    items: [
      ['このサイトが集めるもの', 'あなたを特定する情報は何も集めません。フォーム、アカウント、追跡用 Cookie、アクセス解析、広告ピクセルはありません。'],
      ['ブラウザに残るもの', '選んだ言語（2026年版ではライト／ダークのテーマも）だけを、選択を覚えてページをその言語で開くためだけに、ローカルストレージとこのサイト自身の Cookie（“lang”）に保存します。追跡には使わず、共有もしません。サイトのデータを消去すれば削除されます。'],
      ['サイトがやり取りする相手', 'サイトは Vercel でホストされており、ページの配信とサービス保護のために技術的なアクセス情報（IP アドレスやブラウザなど）が記録されます。「Onde Estão os Netos?」の画像1枚は GitHub から読み込まれます。フォント、動画、その他の画像はサイト自身が配信します。'],
      ['連絡先', 'メールや WhatsApp でご連絡いただいた場合、返信のためだけに使います。WhatsApp は Meta のサービスで、同社のプライバシーポリシーが適用されます。データの開示・訂正・削除の依頼は下記のアドレスまでご連絡ください。'],
    ],
  },
};

export default function Privacy() {
  const { locale } = useLocale();
  const t = TEXT[locale];
  return (
    <div className={styles.scroll}>
      <article className={styles.page}>
        <Link href="/" className={styles.back}>
          ← {t.back}
        </Link>
        <h1 className={styles.title}>{t.title}</h1>
        <p className={styles.updated}>{t.updated}</p>
        {t.items.map(([h, body]) => (
          <section key={h} className={styles.block}>
            <h2>{h}</h2>
            <p>{body}</p>
          </section>
        ))}
        <a className={styles.email} href={`mailto:${EMAIL}`}>
          {EMAIL}
        </a>
      </article>
    </div>
  );
}

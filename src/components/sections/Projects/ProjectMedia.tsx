// Three custom media compositions — placeholders that evoke each project's
// world. Replace with real screenshots / video later via the marked slots.
import Image from 'next/image';
import styles from './ProjectMedia.module.scss';

// ─────────────────────────────────────────
// GAME — dark cinematic HUD frame
// Pass `screenshot` to layer a real in-game image behind the synthetic HUD —
// reads as "design annotations" overlaid on a real screenshot.
// ─────────────────────────────────────────
type GameMediaProps = {
  screenshot?: string;
  screenshotAlt?: string;
};

export function GameMedia({ screenshot, screenshotAlt = '' }: GameMediaProps = {}) {
  return (
    <div className={`${styles.media} ${styles.game}`}>
      {screenshot ? (
        <>
          <Image
            src={screenshot}
            alt={screenshotAlt}
            className={styles.gameScreenshot}
            fill
            sizes="(max-width: 900px) 100vw, 60vw"
            loading="lazy"
          />
          <div className={styles.gameScreenshotDim} aria-hidden />
        </>
      ) : (
        <div className={styles.gameBackdrop} aria-hidden />
      )}
      <div className={styles.gameScanlines} aria-hidden />

      {/* HUD corners */}
      <span className={`${styles.bracket} ${styles.bracketTL}`} aria-hidden />
      <span className={`${styles.bracket} ${styles.bracketTR}`} aria-hidden />
      <span className={`${styles.bracket} ${styles.bracketBL}`} aria-hidden />
      <span className={`${styles.bracket} ${styles.bracketBR}`} aria-hidden />

      {/* Top HUD strip */}
      <div className={styles.gameTopHud}>
        <span className={styles.gameTag}>◆ Mundo 06</span>
        <span className={styles.gameBoss}>Covil do Dragão</span>
        <span className={styles.gameTag}>Wave 18 / 20</span>
      </div>

      {/* Centerpiece — huge atmospheric kanji */}
      <div className={styles.gameCenter} aria-hidden>
        <span className={styles.gameKanji}>戦</span>
      </div>

      {/* Castle health bar */}
      <div className={styles.gameHealthWrap}>
        <div className={styles.gameHealthTrack}>
          <div className={styles.gameHealthFill} />
          <div className={styles.gameHealthDelay} />
        </div>
        <div className={styles.gameHealthMeta}>
          <span>Castle HP</span>
          <span>740 / 1000</span>
        </div>
      </div>

      {/* Lower-left resource readout */}
      <div className={styles.gameTelemetry}>
        <span>Gold · 240</span>
        <span>Lives · 03</span>
        <span className={styles.gameLink}>IA · Build Mortar</span>
      </div>

      {/* Lower-right speed controls (touch-only game) */}
      <div className={styles.gameActions}>
        <span><kbd>0.5×</kbd></span>
        <span><kbd>1×</kbd></span>
        <span><kbd>2×</kbd></span>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────
// CHATBOT — calm multilingual conversation
// Three render modes, picked by what you pass:
//   · `screenshots` (3+ items) → cinematic device stack (recommended)
//   · `screenshot`  (single)   → one screenshot, lightly framed
//   · neither                  → synthetic chat bubbles (fallback)
// ─────────────────────────────────────────
type Screenshot = { src: string; alt?: string };
type ChatbotMediaProps = {
  screenshot?: string;
  screenshotAlt?: string;
  screenshots?: Screenshot[];
};

// ── Helper — a single browser-framed device ──
function ChatDevice({
  src,
  alt = '',
  variant,
}: {
  src: string;
  alt?: string;
  variant: 'main' | 'backLeft' | 'backRight';
}) {
  const variantClass =
    variant === 'main'
      ? styles.chatDeviceMain
      : variant === 'backLeft'
      ? styles.chatDeviceBackLeft
      : styles.chatDeviceBackRight;

  return (
    <div className={`${styles.chatDevice} ${variantClass}`}>
      <div className={styles.chatDeviceBar} aria-hidden>
        <span />
        <span />
        <span />
      </div>
      <div className={styles.chatDeviceImageWrap}>
        <Image
          src={src}
          alt={alt}
          className={styles.chatDeviceScreen}
          fill
          sizes="(max-width: 900px) 90vw, 35vw"
          loading="lazy"
        />
      </div>
    </div>
  );
}

export function ChatbotMedia({
  screenshot,
  screenshotAlt = '',
  screenshots,
}: ChatbotMediaProps = {}) {
  // ── Mode 1: Device stack (3 screenshots) ──
  if (screenshots && screenshots.length >= 3) {
    const [main, backLeft, backRight] = screenshots;
    return (
      <div className={`${styles.media} ${styles.chatStack}`}>
        <div className={styles.chatStackGlow} aria-hidden />
        <ChatDevice src={backLeft.src}  alt={backLeft.alt}  variant="backLeft"  />
        <ChatDevice src={backRight.src} alt={backRight.alt} variant="backRight" />
        <ChatDevice src={main.src}      alt={main.alt}      variant="main"      />
      </div>
    );
  }

  // ── Mode 2: Single screenshot ──
  if (screenshot) {
    return (
      <div className={`${styles.media} ${styles.chatScreenshot}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={screenshot}
          alt={screenshotAlt}
          className={styles.chatScreenshotImg}
          loading="lazy"
        />
        <div className={styles.chatScreenshotDim} aria-hidden />
      </div>
    );
  }

  // ── Mode 3: Synthetic fallback ──
  return (
    <div className={`${styles.media} ${styles.chat}`}>
      <div className={styles.chatBackdrop} aria-hidden />

      {/* Top window bar */}
      <div className={styles.chatBar}>
        <span className={styles.chatDot} />
        <span className={styles.chatDot} />
        <span className={styles.chatDot} />
        <span className={styles.chatTitle}>Medical Assistant — Multilingual</span>
        <span className={styles.chatLang}>EN · ES · AR</span>
      </div>

      {/* Conversation thread */}
      <div className={styles.chatThread}>
        <div className={`${styles.chatBubble} ${styles.chatBubbleUser}`}>
          <span className={styles.chatLangChip}>EN</span>
          <p>I've had a headache for three days. Should I be concerned?</p>
        </div>

        <div className={`${styles.chatBubble} ${styles.chatBubbleAi}`}>
          <span className={styles.chatLangChip}>EN</span>
          <p>
            A few questions to help you better — could you describe where the pain
            is located, and whether it changes with light or movement?
          </p>
        </div>

        <div className={`${styles.chatBubble} ${styles.chatBubbleUser}`}>
          <span className={styles.chatLangChip}>ES</span>
          <p>Es más fuerte cerca de los ojos.</p>
        </div>

        <div className={`${styles.chatBubble} ${styles.chatBubbleAi}`}>
          <span className={styles.chatLangChip}>ES</span>
          <p>Entendido. Voy a sugerir algunas observaciones antes de…</p>
        </div>

        <div className={styles.chatTyping} aria-hidden>
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────
// PHANTOM COMMERCE — premium glass product
// Modes:
//   · `screenshots` (2+ items) → dual device stack on dark stage
//   · neither                  → synthetic glass product card
// ─────────────────────────────────────────
type PhantomMediaProps = {
  screenshots?: Screenshot[];
};

function PhantomDevice({
  src,
  alt = '',
  variant,
}: {
  src: string;
  alt?: string;
  variant: 'main' | 'back';
}) {
  const variantClass =
    variant === 'main' ? styles.phantomDeviceMain : styles.phantomDeviceBack;

  return (
    <div className={`${styles.phantomDevice} ${variantClass}`}>
      <div className={styles.phantomDeviceBar} aria-hidden>
        <span />
        <span />
        <span />
      </div>
      <div className={styles.phantomDeviceImageWrap}>
        <Image
          src={src}
          alt={alt}
          className={styles.phantomDeviceScreen}
          fill
          sizes="(max-width: 900px) 90vw, 35vw"
          loading="lazy"
        />
      </div>
    </div>
  );
}

export function PhantomMedia({ screenshots }: PhantomMediaProps = {}) {
  // ── Mode 1: Dual device stack on dark stage ──
  if (screenshots && screenshots.length >= 2) {
    const [main, back] = screenshots;
    return (
      <div className={`${styles.media} ${styles.phantomStack}`}>
        <div className={styles.phantomStackBackdrop} aria-hidden />
        <div className={styles.phantomStackGrid} aria-hidden />
        <div className={styles.phantomStackGlow} aria-hidden />

        <PhantomDevice src={back.src} alt={back.alt} variant="back" />
        <PhantomDevice src={main.src} alt={main.alt} variant="main" />
      </div>
    );
  }

  // ── Mode 2: Synthetic glass product card (fallback) ──
  return (
    <div className={`${styles.media} ${styles.phantom}`}>
      <div className={styles.phantomBackdrop} aria-hidden />
      <div className={styles.phantomGrid} aria-hidden />
      <div className={styles.phantomGlow} aria-hidden />

      {/* Top metadata */}
      <div className={styles.phantomTop}>
        <span>Phantom Commerce</span>
        <span>SKU · PH-0427</span>
      </div>

      {/* Product silhouette */}
      <div className={styles.phantomStage}>
        <div className={styles.phantomObject} aria-hidden />
        <span className={styles.phantomGhost}>幻</span>
      </div>

      {/* Glass card */}
      <div className={styles.phantomCard}>
        <div className={styles.phantomCardHead}>
          <span className={styles.phantomCardTitle}>Aether Mouse · Carbon</span>
          <span className={styles.phantomCardPrice}>¥ 14,800</span>
        </div>
        <div className={styles.phantomCardFoot}>
          <span className={styles.phantomMeta}>In stock · Ships today</span>
          <span className={styles.phantomCta}>
            Add to cart <span className={styles.phantomCtaArrow}>→</span>
          </span>
        </div>
      </div>
    </div>
  );
}

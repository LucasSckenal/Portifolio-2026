// Custom media compositions — each project's world rendered as a stage.
// All variants accept `screenshots` for real product imagery and fall back to
// a synthetic mood frame (kanji + glow) when no images are wired yet.
import FadeImage from '@/components/ui/FadeImage';
import styles from './ProjectMedia.module.scss';

type Screenshot = { src: string; alt?: string };

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
          <FadeImage
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
        <FadeImage
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
        <FadeImage
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

// ─────────────────────────────────────────
// NEXO — workspace SaaS (dark stage, AI accent)
// Modes (in priority order — first defined wins):
//   · `video`        → single device frame autoloops a muted screencast
//   · `screenshots`  → cinematic device stack (Kanban, Analytics, AI)
//   · neither        → synthetic workspace frame with kanji glow
// ─────────────────────────────────────────
type NexoMediaProps = {
  /**
   * One or more video sources for the device frame. The browser picks the
   * first it can play (WebM → MP4 fallback). Autoplays muted, loops, and
   * pauses automatically when off-screen.
   */
  video?: VideoSource[];
  /** Optional poster image while the video buffers */
  videoPoster?: string;
  /** Alt-text equivalent for the video frame */
  videoAlt?: string;
  screenshots?: Screenshot[];
};

// Same pattern as LJVideoDevice, dark/indigo themed to match Nexo's stage.
function NexoVideoDevice({
  sources,
  poster,
  ariaLabel,
}: {
  sources: VideoSource[];
  poster?: string;
  ariaLabel?: string;
}) {
  // Pause off-screen to save GPU. Mirrors Hero's video pattern.
  const setVideoRef = (node: HTMLVideoElement | null) => {
    if (!node) return;
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
      node.play().catch(() => {});
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) node.play().catch(() => {});
        else node.pause();
      },
      { threshold: 0.15 }
    );
    observer.observe(node);
  };

  return (
    <div className={`${styles.nexoDevice} ${styles.nexoDeviceSolo}`}>
      <div className={styles.nexoDeviceBar} aria-hidden>
        <span />
        <span />
        <span />
      </div>
      <div className={styles.nexoDeviceImageWrap}>
        <video
          ref={setVideoRef}
          className={styles.nexoDeviceVideo}
          poster={poster}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          aria-label={ariaLabel}
        >
          {sources.map((s) => (
            <source key={s.src} src={s.src} type={s.type} />
          ))}
        </video>
      </div>
    </div>
  );
}

function NexoDevice({
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
      ? styles.nexoDeviceMain
      : variant === 'backLeft'
      ? styles.nexoDeviceBackLeft
      : styles.nexoDeviceBackRight;

  return (
    <div className={`${styles.nexoDevice} ${variantClass}`}>
      <div className={styles.nexoDeviceBar} aria-hidden>
        <span />
        <span />
        <span />
      </div>
      <div className={styles.nexoDeviceImageWrap}>
        <FadeImage
          src={src}
          alt={alt}
          className={styles.nexoDeviceScreen}
          fill
          sizes="(max-width: 900px) 90vw, 35vw"
          loading="lazy"
        />
      </div>
    </div>
  );
}

export function NexoMedia({ video, videoPoster, videoAlt, screenshots }: NexoMediaProps = {}) {
  // ── Mode 1: Single video device — leads with the AI in motion ──
  if (video && video.length > 0) {
    return (
      <div className={`${styles.media} ${styles.nexoStack} ${styles.nexoVideoMode}`}>
        <div className={styles.nexoStackBackdrop} aria-hidden />
        <div className={styles.nexoStackGrid} aria-hidden />
        <div className={styles.nexoStackGlow} aria-hidden />
        <NexoVideoDevice sources={video} poster={videoPoster} ariaLabel={videoAlt} />
      </div>
    );
  }

  // ── Mode 2: Device stack ──
  if (screenshots && screenshots.length >= 3) {
    const [main, backLeft, backRight] = screenshots;
    return (
      <div className={`${styles.media} ${styles.nexoStack}`}>
        <div className={styles.nexoStackBackdrop} aria-hidden />
        <div className={styles.nexoStackGrid} aria-hidden />
        <div className={styles.nexoStackGlow} aria-hidden />

        <NexoDevice src={backLeft.src}  alt={backLeft.alt}  variant="backLeft" />
        <NexoDevice src={backRight.src} alt={backRight.alt} variant="backRight" />
        <NexoDevice src={main.src}      alt={main.alt}      variant="main" />
      </div>
    );
  }

  // ── Mode 3: Synthetic workspace frame (fallback) ──
  return (
    <div className={`${styles.media} ${styles.nexo}`}>
      <div className={styles.nexoBackdrop} aria-hidden />
      <div className={styles.nexoGrid} aria-hidden />
      <div className={styles.nexoGlow} aria-hidden />

      {/* Top toolbar */}
      <div className={styles.nexoTop}>
        <span>Nexo · Workspace</span>
        <span>◇ AI assist · live</span>
      </div>

      {/* Centerpiece — connection kanji */}
      <div className={styles.nexoCenter} aria-hidden>
        <span className={styles.nexoKanji}>繋</span>
      </div>

      {/* Kanban column hint */}
      <div className={styles.nexoColumn}>
        <span className={styles.nexoColumnLabel}>In progress · 04</span>
        <div className={styles.nexoCard}>
          <span>Draft sprint goals</span>
          <span className={styles.nexoCardMeta}>AI · 5 cards</span>
        </div>
        <div className={styles.nexoCard}>
          <span>Refine onboarding copy</span>
          <span className={styles.nexoCardMeta}>Gemini</span>
        </div>
      </div>

      {/* Analytics sparkline */}
      <div className={styles.nexoAnalytics}>
        <span className={styles.nexoAnalyticsLabel}>Throughput · 7d</span>
        <svg className={styles.nexoSpark} viewBox="0 0 100 30" preserveAspectRatio="none">
          <polyline
            fill="none"
            stroke="currentColor"
            strokeWidth="1.2"
            points="0,22 14,18 28,20 42,12 56,15 70,8 84,11 100,4"
          />
        </svg>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────
// MA FINANCE OS — minimalist finance OS (dark stage, reuses Nexo device chrome)
// Modes (in priority order):
//   · `video`        → single device frame autoloops a muted screencast
//   · `screenshots`  → cinematic device stack (3+ items)
//   · neither        → synthetic finance frame with 間 kanji
// ─────────────────────────────────────────
type MaFinanceMediaProps = {
  video?: VideoSource[];
  videoPoster?: string;
  videoAlt?: string;
  screenshots?: Screenshot[];
};

export function MaFinanceMedia({ video, videoPoster, videoAlt, screenshots }: MaFinanceMediaProps = {}) {
  if (video && video.length > 0) {
    return (
      <div className={`${styles.media} ${styles.nexoStack} ${styles.nexoVideoMode}`}>
        <div className={styles.nexoStackBackdrop} aria-hidden />
        <div className={styles.nexoStackGrid} aria-hidden />
        <div className={styles.nexoStackGlow} aria-hidden />
        <NexoVideoDevice sources={video} poster={videoPoster} ariaLabel={videoAlt} />
      </div>
    );
  }

  if (screenshots && screenshots.length >= 3) {
    const [main, backLeft, backRight] = screenshots;
    return (
      <div className={`${styles.media} ${styles.nexoStack}`}>
        <div className={styles.nexoStackBackdrop} aria-hidden />
        <div className={styles.nexoStackGrid} aria-hidden />
        <div className={styles.nexoStackGlow} aria-hidden />
        <NexoDevice src={backLeft.src}  alt={backLeft.alt}  variant="backLeft"  />
        <NexoDevice src={backRight.src} alt={backRight.alt} variant="backRight" />
        <NexoDevice src={main.src}      alt={main.alt}      variant="main"      />
      </div>
    );
  }

  return (
    <div className={`${styles.media} ${styles.nexo}`}>
      <div className={styles.nexoBackdrop} aria-hidden />
      <div className={styles.nexoGrid} aria-hidden />
      <div className={styles.nexoGlow} aria-hidden />
      <div className={styles.nexoCenter} aria-hidden>
        <span className={styles.nexoKanji}>間</span>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────
// LJ — boutique wellness studio (light stage, warm accent)
// Modes (in order of priority — first defined wins):
//   · `video`        → single device frame autoloops a muted screencast
//   · `screenshots`  → dual device stack on neutral stage (2 items)
//   · neither        → synthetic schedule + plan card composition
// ─────────────────────────────────────────
type VideoSource = { src: string; type: string };
type LJMediaProps = {
  /**
   * One or more video sources for the device frame. List in order of preference;
   * the browser picks the first it can play (WebM first → MP4 fallback for Safari).
   * The video autoplays muted, loops, and pauses automatically when off-screen.
   */
  video?: VideoSource[];
  /** Optional poster image shown until the video buffers */
  videoPoster?: string;
  /** Alt-text equivalent for the video frame */
  videoAlt?: string;
  screenshots?: Screenshot[];
};

// Lazy import — keeps initial render tree clean; the video device only
// imports the IntersectionObserver helper when it actually mounts.
function LJVideoDevice({
  sources,
  poster,
  ariaLabel,
}: {
  sources: VideoSource[];
  poster?: string;
  ariaLabel?: string;
}) {
  // Pause the video while off-screen — same GPU-saver pattern as Hero.
  // Uses a callback ref so the observer attaches the moment the video mounts.
  const setVideoRef = (node: HTMLVideoElement | null) => {
    if (!node) return;
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
      // Old browsers: just autoplay, never pause. Acceptable fallback.
      node.play().catch(() => {});
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) node.play().catch(() => {});
        else node.pause();
      },
      { threshold: 0.15 }
    );
    observer.observe(node);
  };

  return (
    <div className={`${styles.ljDevice} ${styles.ljDeviceSolo}`}>
      <div className={styles.ljDeviceBar} aria-hidden>
        <span />
        <span />
        <span />
      </div>
      <div className={styles.ljDeviceImageWrap}>
        <video
          ref={setVideoRef}
          className={styles.ljDeviceVideo}
          poster={poster}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          aria-label={ariaLabel}
        >
          {sources.map((s) => (
            <source key={s.src} src={s.src} type={s.type} />
          ))}
        </video>
      </div>
    </div>
  );
}

function LJDevice({
  src,
  alt = '',
  variant,
}: {
  src: string;
  alt?: string;
  variant: 'main' | 'back';
}) {
  const variantClass =
    variant === 'main' ? styles.ljDeviceMain : styles.ljDeviceBack;

  return (
    <div className={`${styles.ljDevice} ${variantClass}`}>
      <div className={styles.ljDeviceBar} aria-hidden>
        <span />
        <span />
        <span />
      </div>
      <div className={styles.ljDeviceImageWrap}>
        <FadeImage
          src={src}
          alt={alt}
          className={styles.ljDeviceScreen}
          fill
          sizes="(max-width: 900px) 90vw, 35vw"
          loading="lazy"
        />
      </div>
    </div>
  );
}

export function LJMedia({ video, videoPoster, videoAlt, screenshots }: LJMediaProps = {}) {
  // ── Mode 1: Single video device — most cinematic, used when a screencast exists ──
  if (video && video.length > 0) {
    return (
      <div className={`${styles.media} ${styles.ljStack} ${styles.ljVideoMode}`}>
        <div className={styles.ljStackBackdrop} aria-hidden />
        <div className={styles.ljStackGlow} aria-hidden />
        <LJVideoDevice sources={video} poster={videoPoster} ariaLabel={videoAlt} />
      </div>
    );
  }

  // ── Mode 2: Dual device stack ──
  if (screenshots && screenshots.length >= 2) {
    const [main, back] = screenshots;
    return (
      <div className={`${styles.media} ${styles.ljStack}`}>
        <div className={styles.ljStackBackdrop} aria-hidden />
        <div className={styles.ljStackGlow} aria-hidden />

        <LJDevice src={back.src} alt={back.alt} variant="back" />
        <LJDevice src={main.src} alt={main.alt} variant="main" />
      </div>
    );
  }

  // ── Mode 3: Synthetic schedule + plan card (fallback) ──
  return (
    <div className={`${styles.media} ${styles.lj}`}>
      <div className={styles.ljBackdrop} aria-hidden />
      <div className={styles.ljGlow} aria-hidden />

      {/* Top brand strip */}
      <div className={styles.ljTop}>
        <span className={styles.ljBrand}>Luis Joris</span>
        <span className={styles.ljBrandSub}>Treinamento Integrado</span>
      </div>

      {/* Centerpiece — body kanji */}
      <div className={styles.ljCenter} aria-hidden>
        <span className={styles.ljKanji}>体</span>
      </div>

      {/* Schedule strip */}
      <div className={styles.ljSchedule}>
        <span className={styles.ljScheduleLabel}>Wed · 18:00 — Funcional</span>
        <span className={styles.ljScheduleSlots}>3 of 4 spots</span>
      </div>

      {/* Plan card */}
      <div className={styles.ljPlan}>
        <div className={styles.ljPlanHead}>
          <span className={styles.ljPlanName}>Personalizado</span>
          <span className={styles.ljPlanTag}>Most chosen</span>
        </div>
        <div className={styles.ljPlanPrice}>R$ 750 <span>/ month</span></div>
        <div className={styles.ljPlanCta}>Reserve via WhatsApp →</div>
      </div>
    </div>
  );
}

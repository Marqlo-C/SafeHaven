import Head from 'next/head';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import { ChevronDown, Home, Siren, Bot, Users, BookLock, MapPin } from 'lucide-react';
import { Phone } from '../../components/marketing/index-phone';
import { CalculatorScreen, CalculatorSciScreen, HomeScreen, SosScreen, ChatScreen, FriendsScreen, SafeBotScreen, JournalScreen, AidScreen, AidOverviewScreen } from '../../components/marketing/index-screens';
import styles from '../../styles/AppPreview.module.css';
import landingStyles from '../../styles/CoverPages.module.css';

const LOGO_SRC = '/resources/images/logos/safe_harbor_logo.png';

const PRIVATE_FEATURES = [
  { Icon: Home,     name: 'Your Personal Dashboard',        desc: 'A centralized, discreet space for your SOS protocols, trusted contacts, and daily grounding, all accessible the moment you need it.' },
  { Icon: Siren,    name: 'One-Tap Emergency Alert',        desc: "Instantly share your live location with trusted contacts. Coming soon: Passive, silent AI integration that reads your situation and briefs 911 dispatchers so you don't have to." },
  { Icon: Bot,      name: 'Always-Available Support',       desc: 'Need a safe ear at 3:00 AM? SafeBot is here 24/7 to listen, help you navigate your options, and provide resources, all while keeping your identity fully anonymous.' },
  { Icon: Users,    name: 'A Community That Understands',   desc: 'Connect in a private, friend-gated, and completely anonymous network. No real names, no photos, and no digital trace left behind.' },
  { Icon: BookLock, name: 'Safe Evidence Documentation',    desc: "Record photos, audio, or text notes without them ever appearing in your device's primary gallery or storage. Your experiences are yours to keep, securely encrypted." },
  { Icon: MapPin,   name: 'Context-Aware Resources',        desc: 'Find local support including shelters, legal aid, and counseling with precision and privacy. Our AI provides clear summaries of exactly what services they offer, so you know what to expect before you go.' },
];

const APPS = {
  calculator: {
    name: 'Calculator Pro',
    tagline: 'This interface is a fully encrypted vault designed for the moments you need it most. Masked as a tool for math so your safety is never compromised.',
    description:
      "You shouldn't have to compromise your safety for the sake of privacy. SafeHaven provides a secure, hidden sanctuary that blends perfectly into your device, disguised as a standard scientific calculator. To everyone else, it's just a tool for math. To you, it's a lifeline.",
    icon: '/resources/images/logos/calculator_icon.png',
    appleTouchIcon: '/resources/images/logos/calculator_icon_192x192.png',
    manifestUrl: '/manifests/calculator.json',
    themeColor: '#1a1a2e',
  },
  news: {
    name: 'Daily News Reader',
    tagline: 'This interface is a fully encrypted vault designed for the moments you need it most. Masked as a news reader so your safety is never compromised.',
    description:
      "You shouldn't have to choose between your safety and your privacy. SafeHaven gives you both — hidden inside a news reader. Anyone who opens it sees a legitimate app with real live headlines. There is nothing here to find — unless you want there to be.",
    icon: '/resources/images/logos/news_icon.png',
    appleTouchIcon: '/resources/images/logos/news_icon_192x192.png',
    manifestUrl: '/manifests/news.json',
    themeColor: '#0d1b2a',
  },
  weather: {
    name: 'Weather Now',
    tagline: 'This interface is a fully encrypted vault designed for the moments you need it most. Masked as a weather app so your safety is never compromised.',
    description:
      "You shouldn't have to choose between your safety and your privacy. SafeHaven gives you both — hidden inside a weather app. Simple. Everyday. The kind of app no one looks twice at. There is nothing here to find — unless you want there to be.",
    icon: '/resources/images/logos/weather_icon.png',
    appleTouchIcon: '/resources/images/logos/weather_icon_192x192.png',
    manifestUrl: '/manifests/weather.json',
    themeColor: '#0c2340',
  },
};

const SCREEN_SETS = {
  calculator: [
    { Component: CalculatorScreen,    label: 'Cover App' },
    { Component: CalculatorSciScreen, label: 'Scientific Mode' },
    { Component: HomeScreen,          label: 'Private Home' },
    { Component: SosScreen,           label: 'SOS Alert' },
    { Component: ChatScreen,          label: 'Messages' },
    { Component: SafeBotScreen,       label: 'SafeBot' },
    { Component: FriendsScreen,       label: 'Friends' },
    { Component: JournalScreen,       label: 'Journal' },
    { Component: AidScreen,           label: 'Find Resources' },
    { Component: AidOverviewScreen,   label: 'Resource Detail' },
  ],
  news: [
    { Component: HomeScreen,        label: 'Private Home' },
    { Component: SosScreen,         label: 'SOS Alert' },
    { Component: ChatScreen,        label: 'Messages' },
    { Component: SafeBotScreen,     label: 'SafeBot' },
    { Component: FriendsScreen,     label: 'Friends' },
    { Component: JournalScreen,     label: 'Journal' },
    { Component: AidScreen,         label: 'Find Resources' },
    { Component: AidOverviewScreen, label: 'Resource Detail' },
  ],
  weather: [
    { Component: HomeScreen,        label: 'Private Home' },
    { Component: SosScreen,         label: 'SOS Alert' },
    { Component: ChatScreen,        label: 'Messages' },
    { Component: SafeBotScreen,     label: 'SafeBot' },
    { Component: FriendsScreen,     label: 'Friends' },
    { Component: JournalScreen,     label: 'Journal' },
    { Component: AidScreen,         label: 'Find Resources' },
    { Component: AidOverviewScreen, label: 'Resource Detail' },
  ],
};

function MotionScreenCard({ Component, label, pointer, layoutTick }) {
  const itemRef = useRef(null);
  const y = useMotionValue(0);
  const scale = useMotionValue(0.96);
  const smoothY = useSpring(y, { stiffness: 360, damping: 28, mass: 0.8 });
  const smoothScale = useSpring(scale, { stiffness: 360, damping: 28, mass: 0.8 });
  const [zIndex, setZIndex] = useState(1);

  useEffect(() => {
    const item = itemRef.current;
    if (!item || !pointer.inside || pointer.x == null || pointer.y == null) {
      y.set(0);
      scale.set(0.96);
      setZIndex(3);
      return;
    }

    const rect = item.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const distanceX = Math.abs(pointer.x - centerX);
    const distanceY = Math.abs(pointer.y - centerY);
    const proximity = Math.max(0, 1 - Math.hypot(distanceX / 170, distanceY / 220));

    y.set(-proximity * 30);
    scale.set(0.96 + proximity * 0.1);
    setZIndex(Math.round(10 + proximity * 40));
  }, [pointer.x, pointer.y, pointer.inside, layoutTick, y, scale]);

  return (
    <motion.div
      className={styles.screenItem}
      ref={itemRef}
      style={{ y: smoothY, scale: smoothScale, zIndex }}
    >
      <div className={styles.phoneScaleWrap}>
        <div className={styles.phoneScale}>
          <Phone><Component /></Phone>
        </div>
      </div>
      <p className={styles.screenLabel}>{label}</p>
    </motion.div>
  );
}

function InstallModal({ isOpen, onClose, onInstall, canInstall, platform, appName }) {
  if (!isOpen) return null;
  const isIOS = platform === 'ios';

  return (
    <div className={landingStyles.modalOverlay} onClick={onClose}>
      <div className={landingStyles.modalContent} onClick={(e) => e.stopPropagation()}>
        <button className={landingStyles.closeBtn} onClick={onClose}>✕</button>
        <div className={landingStyles.modalHeader}>
          <h3 className={landingStyles.modalTitle}>Add to Home Screen</h3>
        </div>
        <div className={landingStyles.modalBody}>
          {isIOS ? (
            <>
              <p>To install on your iPhone:</p>
              <ol className={landingStyles.steps}>
                <li>Tap the <strong>Share</strong> button in Safari.</li>
                <li>Select <strong>Add to Home Screen</strong>.</li>
                <li>Tap <strong>Add</strong>.</li>
              </ol>
              <p className={landingStyles.modalNote}>It will appear as a normal {appName.split(' ')[0]} icon.</p>
            </>
          ) : canInstall ? (
            <>
              <p>Install to your home screen so it appears as a standard {appName.split(' ')[0]} app icon.</p>
            </>
          ) : (
            <>
              <p>To install this app:</p>
              <ol className={landingStyles.steps}>
                <li>Tap the <strong>menu icon</strong> in your browser.</li>
                <li>Select <strong>Install App</strong> or <strong>Add to Home Screen</strong>.</li>
                <li>Confirm to add it.</li>
              </ol>
            </>
          )}
        </div>
        {canInstall && !isIOS ? (
          <button className={landingStyles.modalAction} onClick={onInstall}>Install Now</button>
        ) : (
          <button className={landingStyles.modalAction} onClick={onClose}>Got it</button>
        )}
      </div>
    </div>
  );
}

export default function AppPreview({ themeKey }) {
  const app = APPS[themeKey];
  const screens = SCREEN_SETS[themeKey] || [];
  const screensTrackRef = useRef(null);
  const detailsRef = useRef(null);

  const [installPrompt, setInstallPrompt] = useState(null);
  const [installed, setInstalled] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [platform, setPlatform] = useState('other');
  const [pointer, setPointer] = useState({ x: null, y: null, inside: false });
  const [layoutTick, setLayoutTick] = useState(0);

  useEffect(() => {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    if (isIOS) setPlatform('ios');

    const onPrompt = (e) => { e.preventDefault(); setInstallPrompt(e); };
    const onInstalled = () => { setInstalled(true); setInstallPrompt(null); setShowModal(false); };

    window.addEventListener('beforeinstallprompt', onPrompt);
    window.addEventListener('appinstalled', onInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  useEffect(() => {
    const onScroll = () => {
      setLayoutTick((tick) => tick + 1);
    };

    const track = screensTrackRef.current;
    if (!track) return undefined;

    track.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);

    return () => {
      track.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [screens.length]);

  const triggerInstall = async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === 'accepted') { setInstallPrompt(null); setShowModal(false); }
  };

  const handleInstallClick = () => {
    if (installPrompt) { triggerInstall(); } else { setShowModal(true); }
  };

  const showInstallOption = !installed && (installPrompt || platform === 'ios');

  return (
    <>
      <Head>
        <title>{app.name}</title>
        <meta name="robots" content="noindex, nofollow" />
        <meta name="referrer" content="no-referrer" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <meta name="theme-color" content={app.themeColor} />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-title" content={app.name} />
        <link rel="manifest" href={app.manifestUrl} />
        <link rel="icon" href={app.icon} />
        <link rel="apple-touch-icon" href={app.appleTouchIcon} />
      </Head>

      <InstallModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onInstall={triggerInstall}
        canInstall={!!installPrompt}
        platform={platform}
        appName={app.name}
      />

      <div className={styles.page}>
        <div className={`${styles.heroBand} ${styles.heroBandBg}`}>
          <header className={styles.header}>
            <Link href="/" className={styles.brand}>
              <img src={LOGO_SRC} alt="" className={styles.logo} />
              SafeHaven
            </Link>
            <Link href="/downloads" className={styles.backLink}>Choose Different Cover</Link>
          </header>

          {/* Phone mockup gallery */}
          {screens.length > 0 && (
            <div className={styles.screensSection}>
              <div
                className={styles.screensTrack}
                ref={screensTrackRef}
                onMouseMove={(event) => {
                  setPointer({ x: event.clientX, y: event.clientY, inside: true });
                }}
                onMouseLeave={() => {
                  setPointer({ x: null, y: null, inside: false });
                }}
              >
                <div className={styles.screensScroll}>
                  {screens.map(({ Component, label }, index) => {
                    return (
                      <MotionScreenCard
                        key={label}
                        Component={Component}
                        label={label}
                        pointer={pointer}
                        layoutTick={layoutTick}
                      />
                    );
                  })}
                </div>
              </div>
            </div>
          )}
          <button
            type="button"
            className={styles.scrollCue}
            aria-label="View app details"
            onClick={() => detailsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
          >
            <ChevronDown size={22} strokeWidth={2.4} />
          </button>
        </div>

        <main className={styles.main} ref={detailsRef}>
          {/* Cover app pitch */}
          <section className={styles.section}>
            <h2 className={styles.pitchTitle}>SafeHaven: A Private Sanctuary, Built into Your Daily Tools</h2>
            <p className={styles.pitch}>{app.description}</p>
          </section>

          <div className={styles.sectionDivider} />

          {/* Private features */}
          <section className={styles.section}>
            <p className={styles.privateLabel}>Built for the moments that matter</p>
            <ul className={styles.privateList}>
              {PRIVATE_FEATURES.map(({ Icon, name, desc }) => (
                <li key={name} className={styles.privateItem}>
                  <span className={styles.privateIcon}><Icon size={16} /></span>
                  <div>
                    <strong className={styles.privateName}>{name}</strong>
                    <span className={styles.privateDesc}>{desc}</span>
                  </div>
                </li>
              ))}
            </ul>
            <div className={styles.panicBlock}>
              <p className={styles.panicLabel}>Need an exit strategy?</p>
              <p className={styles.panicText}>If you ever need to leave in a hurry, simply swipe left or right, tap the red lock icon, or press Escape. These are your Panic Exits&mdash;they instantly wipe your current session and clear the cache, leaving absolutely no trace of your activity.</p>
            </div>
            <div className={styles.panicBlock}>
              <p className={styles.panicLabel}>Designed for high-pressure moments:</p>
              <p className={styles.panicText}>You can also set up a Duress Password at signup (or add one later in your settings). If you are ever forced to open the app, entering this specific code bypasses your real data and triggers a completely safe, decoy interface. Your sensitive information stays hidden, invisible, and secure&mdash;every single time.</p>
            </div>
          </section>

          {/* CTAs */}
          <div className={styles.ctaSection}>
            {showInstallOption && (
              <button type="button" className={styles.installBtn} onClick={handleInstallClick}>
                Add to Home Screen
              </button>
            )}
            <Link href={`/app/${themeKey}`} className={styles.openBtn}>
              Open Private Safety Tools
            </Link>
          </div>
        </main>
      </div>
    </>
  );
}

export async function getServerSideProps({ params }) {
  if (!APPS[params.theme]) return { notFound: true };
  return { props: { themeKey: params.theme } };
}

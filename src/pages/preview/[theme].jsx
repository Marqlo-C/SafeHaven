import Head from 'next/head';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import styles from '../../styles/AppPreview.module.css';
import landingStyles from '../../styles/Landing.module.css';

const APPS = {
  calculator: {
    name: 'Calculator Pro',
    developer: 'DevTools Inc.',
    category: 'Utilities',
    rating: '4.8',
    reviews: '12.4K',
    size: '8.2 MB',
    description:
      'The most powerful calculator on your device. Supports basic arithmetic, scientific functions, calculation history, and unit conversions. Clean interface with no ads or tracking.',
    features: [
      'Scientific & basic modes',
      'Calculation history',
      'Unit conversions',
      'Customizable display',
      'Dark mode support',
    ],
    icon: '/resources/images/logos/calculator_icon.png',
    appleTouchIcon: '/resources/images/logos/calculator_icon_192x192.png',
    manifestUrl: '/manifests/calculator.json',
    themeColor: '#1a1a2e',
  },
  news: {
    name: 'Daily News Reader',
    developer: 'Newsroom Labs',
    category: 'News',
    rating: '4.6',
    reviews: '8.1K',
    size: '6.4 MB',
    description:
      'Your personalized daily briefing. Get top headlines from trusted sources curated by topic and location. Distraction-free reading with no algorithm manipulation.',
    features: [
      'Top stories by category',
      'Offline reading mode',
      'No ad tracking',
      'Clean reader view',
      'Customizable topics',
    ],
    icon: '/resources/images/logos/news_icon.png',
    appleTouchIcon: '/resources/images/logos/news_icon_192x192.png',
    manifestUrl: '/manifests/news.json',
    themeColor: '#0d1b2a',
  },
  weather: {
    name: 'Weather Now',
    developer: 'SkyData Apps',
    category: 'Weather',
    rating: '4.7',
    reviews: '21.2K',
    size: '11.1 MB',
    description:
      'Accurate, real-time forecasts for your location. Get hourly and 7-day outlooks, precipitation radar, UV index, and severe weather alerts — all in one clean app.',
    features: [
      'Hourly & 7-day forecast',
      'Precipitation radar',
      'Severe weather alerts',
      'Multiple saved locations',
      'Widgets for home screen',
    ],
    icon: '/resources/images/logos/weather_icon.png',
    appleTouchIcon: '/resources/images/logos/weather_icon_192x192.png',
    manifestUrl: '/manifests/weather.json',
    themeColor: '#0c2340',
  },
};

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

  const [installPrompt, setInstallPrompt] = useState(null);
  const [installed, setInstalled] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [platform, setPlatform] = useState('other');

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
        <header className={styles.header}>
          <Link href="/downloads" className={styles.backLink}>← Back</Link>
        </header>

        <main className={styles.main}>
          {/* App identity row */}
          <div className={styles.appHero}>
            <img src={app.icon} alt="" className={styles.appIcon} />
            <div className={styles.appMeta}>
              <h1 className={styles.appName}>{app.name}</h1>
              <p className={styles.appDev}>{app.developer}</p>
              <span className={styles.categoryBadge}>{app.category}</span>
            </div>
          </div>

          {/* Stats row */}
          <div className={styles.statsRow}>
            <div className={styles.statItem}>
              <strong>{app.rating}</strong>
              <span>★★★★★</span>
              <small>{app.reviews} ratings</small>
            </div>
            <div className={styles.statDivider} />
            <div className={styles.statItem}>
              <strong>{app.size}</strong>
              <span>Size</span>
            </div>
            <div className={styles.statDivider} />
            <div className={styles.statItem}>
              <strong>4+</strong>
              <span>Age</span>
            </div>
          </div>

          {/* Description */}
          <section className={styles.section}>
            <p className={styles.description}>{app.description}</p>
          </section>

          {/* Features */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>What&apos;s included</h2>
            <ul className={styles.featureList}>
              {app.features.map((f) => (
                <li key={f} className={styles.featureItem}>
                  <span className={styles.featureCheck}>✓</span>
                  {f}
                </li>
              ))}
            </ul>
          </section>

          {/* CTAs */}
          <div className={styles.ctaSection}>
            {showInstallOption && (
              <button type="button" className={styles.installBtn} onClick={handleInstallClick}>
                Add to Home Screen
              </button>
            )}
            <Link href={`/login?returnTo=${encodeURIComponent(`/app/${themeKey}?enter=1`)}`} className={styles.openBtn}>
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

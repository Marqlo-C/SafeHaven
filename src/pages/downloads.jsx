import Head from 'next/head';
import Link from 'next/link';
import { Calculator, Newspaper, CloudSun, House } from 'lucide-react';
import styles from '../styles/downloads.module.css';

const LOGO_SRC = '/resources/images/logos/safe_harbor_logo.png';

const APPS = [
  {
    theme: 'calculator',
    name: 'Calculator Pro',
    tag: 'Most Popular',
    description: 'Fully functional calculator. Hides your journal and chat behind your username and password.',
    icon: '/resources/images/logos/calculator_icon.png',
    qr: '/resources/images/calculator-qr.png',
    BtnIcon: Calculator,
  },
  {
    theme: 'news',
    name: 'Daily News Reader',
    tag: 'Low-Key Cover',
    description: 'Live daily headlines. Safety tools hidden behind a small orange button in the lower left corner.',
    icon: '/resources/images/logos/news_icon.png',
    qr: '/resources/images/news-qr.png',
    BtnIcon: Newspaper,
  },
  {
    theme: 'weather',
    name: 'Weather Now',
    tag: 'Simple & Clean',
    description: 'Real-time local forecasts. A disguised safe space.',
    icon: '/resources/images/logos/weather_icon.png',
    qr: '/resources/images/weather-qr.png',
    BtnIcon: CloudSun,
  },
];

export default function Downloads() {
  return (
    <>
      <Head>
        <title>Select Your Disguise — SafeHaven</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content="Choose how SafeHaven appears on your device. Hidden in plain sight." />
        <link rel="icon" href={LOGO_SRC} />
      </Head>

      <div className={styles.page}>
        <header className={styles.header}>
          <Link href="/" className={styles.brand}>
            <img src={LOGO_SRC} alt="" className={styles.logo} />
            SafeHaven
          </Link>
          <nav>
            <Link href="/" className={styles.navButton}><House size={14} /> Home</Link>
          </nav>
        </header>

        <main className={styles.main}>
          <section className={styles.hero}>
            <div className={styles.heroContent}>
              <span className={styles.sectionLabel}>Choose your cover</span>
              <h1 className={styles.heroTitle}>
                Select your <br />
                <span className={styles.textGradient}>disguise.</span>
              </h1>
              <p className={styles.heroSubtitle}>
                Once installed, the app works exactly like the utility you choose.
                Your safety tools stay hidden until you unlock them with your credentials.
                On desktop? Hover the button on any cover below to scan its QR code and install directly on your phone.
              </p>
            </div>
          </section>

          <section className={styles.appGrid}>
            {APPS.map((app) => (
              <Link key={app.theme} href={`/preview/${app.theme}`} className={styles.appCard}>
                <div className={styles.cardTop}>
                  <span className={styles.cardTag}>{app.tag}</span>
                  <img src={app.icon} alt="" className={styles.cardIcon} />
                </div>
                <div className={styles.cardBody}>
                  <h2 className={styles.cardName}>{app.name}</h2>
                  <p className={styles.cardDesc}>{app.description}</p>
                </div>
                <div className={styles.cardCta}>
                  <span className={styles.ctaBtn}>
                    <app.BtnIcon size={16} />
                    Select Cover
                  </span>
                  {app.qr && (
                    <span className={styles.qrPopover}>
                      <img src={app.qr} alt="Scan to install on mobile" className={styles.qrPopoverImg} />
                      <span className={styles.qrPopoverLabel}>Scan to open on your phone</span>
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </section>
        </main>

      </div>
    </>
  );
}

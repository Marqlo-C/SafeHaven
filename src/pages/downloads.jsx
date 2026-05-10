import Head from 'next/head';
import Link from 'next/link';
import styles from '../styles/Landing.module.css';

const ShieldIcon = ({ className }) => (
  <svg 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" />
  </svg>
);

const APPS = [
  {
    theme: 'calculator',
    name: 'Calculator Pro',
    description: 'Fully functional calculator. Hides your journal and chat behind your PIN.',
    icon: '/resources/images/logos/calculator_icon.png',
  },
  {
    theme: 'news',
    name: 'Daily News Reader',
    description: 'Live daily headlines. Safety tools hidden in the settings menu.',
    icon: '/resources/images/logos/news_icon.png',
  },
  {
    theme: 'weather',
    name: 'Weather Now',
    description: 'Real-time local forecasts. A disguised safe space.',
    icon: '/resources/images/logos/weather_icon.png',
  },
];

export default function Downloads() {
  return (
    <>
      <Head>
        <title>Select Your Disguise</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <link rel="icon" href="/resources/images/logos/safe_harbor_logo.png" />
      </Head>

      <div className={styles.page}>
        <header className={styles.header}>
          <Link href="/" className={styles.backLink}>← Back to Home</Link>
          <span className={styles.headerTitle}>Downloads</span>
        </header>

        <main className={styles.main}>
          <section className={styles.hero}>
            <h1 className={styles.heroTitle}>
              Choose your shield 
              <ShieldIcon className={styles.titleIcon} />
            </h1>
            <p className={styles.heroSubtitle}>
              Select how Safe Harbor will appear on your device. Once installed, the app functions exactly like the utility you choose. Your safety tools are hidden until you unlock them.
            </p>
          </section>

          <section className={styles.appList}>
            {APPS.map((app) => (
              <Link 
                key={app.theme} 
                href={`/app/${app.theme}?install=true`} 
                className={styles.pillCard}
              >
                <img src={app.icon} alt="" className={styles.pillIcon} />
                <div className={styles.pillInfo}>
                  <h2 className={styles.pillName}>{app.name}</h2>
                  <p className={styles.pillDesc}>{app.description}</p>
                </div>
                <div className={styles.pillAction}>
                  <span className={styles.installBtn}>Select</span>
                </div>
              </Link>
            ))}
          </section>
        </main>
      </div>
    </>
  );
}

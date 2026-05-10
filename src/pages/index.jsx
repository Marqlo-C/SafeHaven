import Head from 'next/head';
import Link from 'next/link';
import styles from '../styles/Marketing.module.css';

export default function LandingPage() {
  return (
    <>
      <Head>
        <title>Safe Harbor — A Safe Space When You Need It Most</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content="A privacy-first platform connecting and protecting survivors of gender-based violence." />
      </Head>

      <div className={styles.page}>
        <header className={styles.header}>
          <div className={styles.brand}>Safe Harbor</div>
          <nav className={styles.nav}>
            <Link href="/downloads" className={styles.navButton}>Get Protected Now</Link>
          </nav>
        </header>

        <main className={styles.main}>
          {/* Soft Gradient Hero */}
          <section className={styles.heroSection}>
            <div className={styles.heroContent}>
              <div className={styles.badge}>Trusted Support Network</div>
              <h1 className={styles.heroTitle}>
                Safety, disguised in <br />
                <span className={styles.textGradient}>plain sight.</span>
              </h1>
              <p className={styles.heroSubtitle}>
                A private, zero-trace platform for women to connect, find resources, and document abuse securely. Hidden behind everyday apps like a calculator or weather forecast to keep you safe on shared devices.
              </p>
              <div className={styles.heroActions}>
                <Link href="/downloads" className={styles.primaryCta}>Download Disguised App</Link>
                <span className={styles.secondaryText}>100% Free & Anonymous</span>
              </div>
            </div>
          </section>

          {/* Marquee/Ticker effect for emphasis */}
          <div className={styles.tickerContainer}>
            <div className={styles.tickerTrack}>
              <span>Zero-Trace Browsing</span>
              <span className={styles.dot}>•</span>
              <span>Encrypted Evidence Journal</span>
              <span className={styles.dot}>•</span>
              <span>Anonymous Peer Support</span>
              <span className={styles.dot}>•</span>
              <span>Panic Redirect</span>
              <span className={styles.dot}>•</span>
              <span>Zero-Trace Browsing</span>
              <span className={styles.dot}>•</span>
              <span>Encrypted Evidence Journal</span>
              <span className={styles.dot}>•</span>
              <span>Anonymous Peer Support</span>
            </div>
          </div>

          {/* Bento Grid Features */}
          <section className={styles.bentoSection}>
            <div className={styles.sectionHeader}>
              <span className={styles.sectionLabel}>+ OUR IMPACT</span>
              <h2 className={styles.sectionTitle}>Comprehensive Protection</h2>
            </div>
            
            <div className={styles.bentoGrid}>
              <div className={`${styles.bentoCard} ${styles.cardLarge}`}>
                <h3>Camouflaged Icons</h3>
                <p>Choose how the app appears on your phone. Disguise Safe Harbor as a fully functional Calculator, News Reader, or Weather app. The real tools are locked behind your secure login.</p>
              </div>
              
              <div className={styles.bentoCard}>
                <h3>Anonymous IM</h3>
                <p>Connect with other survivors privately. No phone numbers required. All connections are anonymous and untraceable.</p>
              </div>

              <div className={styles.bentoCard}>
                <h3>Incognito Core</h3>
                <p>No browser history, no persistent cookies, no autocomplete. Your sessions vanish the moment you close the app.</p>
              </div>

              <div className={styles.bentoCard}>
                <h3>Evidence Vault</h3>
                <p>Securely log incidents, photos, and audio recordings. Cloud-backed so you never lose your records even if your device is seized.</p>
              </div>

              <div className={`${styles.bentoCard} ${styles.cardAccent}`}>
                <h3>Panic Exit</h3>
                <p>Instantly wipe the screen and redirect to a safe website with a single tap, shake, or by pressing the Escape key.</p>
              </div>
            </div>
          </section>
        </main>

        <footer className={styles.footer}>
          <div className={styles.footerContent}>
            <div className={styles.brand}>Safe Harbor</div>
            <p className={styles.footerDisclaimer}>
              If you are in immediate danger, please call 911 or your local emergency services.
              <br/>National Domestic Violence Hotline: 1-800-799-7233
            </p>
          </div>
        </footer>
      </div>
    </>
  );
}

import Head from 'next/head';
import Link from 'next/link';
import styles from '../styles/Marketing.module.css';

export default function LandingPage() {
  return (
    <>
      <Head>
        <title>Safe Harbor — Safety, Beautifully Disguised</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content="A quiet, zero-trace sanctuary for your private journey toward safety. Hidden in plain sight." />
      </Head>

      <div className={styles.page}>
        <header className={styles.header}>
          <div className={styles.brand}>
            <img src="/resources/images/logos/safe_harbor_logo.png" alt="" className={styles.logo} />
            Safe Harbor
          </div>
          <nav className={styles.nav}>
            <Link href="/downloads" className={styles.navButton}>Get Protected</Link>
          </nav>
        </header>

        <main className={styles.main}>
          {/* Hero Section - Ultra Minimalist & Empowering */}
          <section className={styles.heroSection}>
            <div className={styles.heroContent}>
              <div className={styles.badge}>Your private journey starts here</div>
              <h1 className={styles.heroTitle}>
                Safety, <br />
                <span className={styles.textGradient}>beautifully disguised.</span>
              </h1>
              <p className={styles.heroSubtitle}>
                A quiet digital sanctuary for survivors and those seeking a way out. 
                Disguised as everyday tools, we provide the invisible space you need 
                to find support, document your story, and reclaim your peace.
              </p>
              <div className={styles.heroActions}>
                <Link href="/downloads" className={styles.primaryCta}>Get Started Privately</Link>
                <span className={styles.secondaryText}>Encrypted • Invisible • Free Forever</span>
              </div>
            </div>
          </section>

          {/* Value Proposition Ticker - Thinner, more elegant */}
          <div className={styles.tickerContainer}>
            <div className={styles.tickerTrack}>
              <span>Invisible App Icons</span>
              <span className={styles.dot}>•</span>
              <span>Zero Search History</span>
              <span className={styles.dot}>•</span>
              <span>Secure Evidence Vault</span>
              <span className={styles.dot}>•</span>
              <span>Anonymous Peer Support</span>
              <span className={styles.dot}>•</span>
              <span>Instant Panic Redirect</span>
              <span className={styles.dot}>•</span>
              {/* Duplicate set for seamless loop */}
              <span>Invisible App Icons</span>
              <span className={styles.dot}>•</span>
              <span>Zero Search History</span>
              <span className={styles.dot}>•</span>
              <span>Secure Evidence Vault</span>
              <span className={styles.dot}>•</span>
              <span>Anonymous Peer Support</span>
              <span className={styles.dot}>•</span>
              <span>Instant Panic Redirect</span>
              <span className={styles.dot}>•</span>
            </div>
          </div>

          {/* Feature Grid - Smaller, more refined "App-like" tiles */}
          <section className={styles.bentoSection}>
            <div className={styles.sectionHeader}>
              <span className={styles.sectionLabel}>THE SANCTUARY CORE</span>
              <h2 className={styles.sectionTitle}>Hidden protection.</h2>
            </div>
            
            <div className={styles.bentoGrid}>
              <div className={styles.bentoCard}>
                <div className={styles.cardTag}>Disguise</div>
                <h3>The Shield</h3>
                <p>Hidden behind a working Calculator, News, or Weather app.</p>
              </div>
              
              <div className={styles.bentoCard}>
                <div className={styles.cardTag}>Privacy</div>
                <h3>Zero Trace</h3>
                <p>No history. No cookies. No footprints left behind.</p>
              </div>

              <div className={styles.bentoCard}>
                <div className={styles.cardTag}>Vault</div>
                <h3>Evidence</h3>
                <p>Securely log incidents with military-grade encryption.</p>
              </div>

              <div className={styles.bentoCard}>
                <div className={styles.cardTag}>Chat</div>
                <h3>Connect</h3>
                <p>Anonymous peer support circles that vanish on exit.</p>
              </div>

              <div className={styles.bentoCard}>
                <div className={styles.cardTag}>Safety</div>
                <h3>Panic Exit</h3>
                <p>One tap to instantly hide everything and redirect to safety.</p>
              </div>

              <div className={styles.bentoCard}>
                <div className={styles.cardTag}>Sync</div>
                <h3>Cloud</h3>
                <p>Your data stays safe even if your device is seized.</p>
              </div>
            </div>
          </section>

          {/* Mission Section - More intimate */}
          <section className={styles.missionSection}>
            <div className={styles.missionContent}>
              <h2 className={styles.missionTitle}>Built with empathy</h2>
              <p className={styles.missionText}>
                We believe everyone deserves a space where they can be heard without fear. 
                Safe Harbor isn't just an app; it's a bridge to your independence. 
                We keep your secrets so you can find your strength.
              </p>
            </div>
          </section>
        </main>

        <footer className={styles.footer}>
          <div className={styles.footerContent}>
            <div className={styles.brand}>Safe Harbor</div>
            <p className={styles.footerDisclaimer}>
              <strong>Note:</strong> If you are in immediate danger, please use a safe device 
              to call local emergency services or the National Hotline at 1-800-799-7233.
            </p>
            <div className={styles.footerLinks}>
              <Link href="/downloads">Install Now</Link>
              <span>•</span>
              <a href="#">Security Guide</a>
              <span>•</span>
              <a href="#">Privacy Policy</a>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}

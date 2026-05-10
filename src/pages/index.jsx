import Head from 'next/head';
import Link from 'next/link';
import { 
  Calculator, 
  Newspaper, 
  CloudSun, 
  Shield 
} from 'lucide-react';
import styles from '../styles/Marketing.module.css';

const ShieldIcon = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} xmlns="http://www.w3.org/2000/svg">
    <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" />
  </svg>
);

const GhostIcon = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2a9 9 0 0 0-9 9v7.5a3.5 3.5 0 0 0 6.39 2.04 4.5 4.5 0 0 0 5.22 0 3.5 3.5 0 0 0 6.39-2.04V11a9 9 0 0 0-9-9zm-3 9a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm6 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z" />
  </svg>
);

const LockIcon = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} xmlns="http://www.w3.org/2000/svg">
    <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM9 6c0-1.66 1.34-3 3-3s3 1.34 3 3v2H9V6zm9 14H6V10h12v10zm-6-3c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2z" />
  </svg>
);

const ChatIcon = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} xmlns="http://www.w3.org/2000/svg">
    <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H5.17L4 17.17V4h16v12z" />
  </svg>
);

const ExitIcon = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} xmlns="http://www.w3.org/2000/svg">
    <path d="M10.09 15.59L11.5 17l5-5-5-5-1.41 1.41L12.67 11H3v2h9.67l-2.58 2.59zM19 3H5c-1.11 0-2 .9-2 2v4h2V5h14v14H5v-4H3v4c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z" />
  </svg>
);

const CloudIcon = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} xmlns="http://www.w3.org/2000/svg">
    <path d="M19.35 10.04A7.49 7.49 0 0 0 12 4C9.11 4 6.6 5.64 5.35 8.04A5.994 5.994 0 0 0 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96z" />
  </svg>
);

const MorphingIcon = () => (
  <div className={styles.morphingIconContainer}>
    <div className={styles.morphingGlow} />
    <Calculator className={styles.morphingIcon} />
    <Newspaper className={styles.morphingIcon} />
    <CloudSun className={styles.morphingIcon} />
    <Shield className={styles.morphingIcon} />
  </div>
);

export default function LandingPage() {
  return (
    <>
      <Head>
        <title>Safe Harbor — Safety, Beautifully Disguised</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content="A quiet, zero-trace sanctuary for your private journey toward safety. Hidden in plain sight." />
        <link rel="icon" href="/resources/images/logos/safe_harbor_logo.png" />
      </Head>

      <div className={styles.page}>
        <header className={styles.header}>
          <div className={styles.brand}>
            <img src="/resources/images/logos/safe_harbor_logo.png" alt="" className={styles.logo} />
            Safe Harbor
          </div>
          <nav className={styles.nav}>
            <Link href="/downloads" className={styles.navButton}>
              <ShieldIcon className={styles.buttonIcon} />
              Get Protected
            </Link>
          </nav>
        </header>

        <main className={styles.main}>
          {/* Hero Section - Ultra Minimalist & Empowering */}
          <section className={styles.heroSection}>
            <div className={styles.heroContent}>
              <MorphingIcon />
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
                <Link href="/downloads" className={styles.primaryCta}>
                  <ShieldIcon className={styles.buttonIconCta} />
                  Get Started Privately
                </Link>
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
                <ShieldIcon className={styles.cardIcon} />
                <div className={styles.cardTag}>Disguise</div>
                <h3>The Shield</h3>
                <p>Hidden behind a working Calculator, News, or Weather app.</p>
              </div>
              
              <div className={styles.bentoCard}>
                <GhostIcon className={styles.cardIcon} />
                <div className={styles.cardTag}>Privacy</div>
                <h3>Zero Trace</h3>
                <p>No history. No cookies. No footprints left behind.</p>
              </div>

              <div className={styles.bentoCard}>
                <LockIcon className={styles.cardIcon} />
                <div className={styles.cardTag}>Vault</div>
                <h3>Evidence</h3>
                <p>Securely log incidents with military-grade encryption.</p>
              </div>

              <div className={styles.bentoCard}>
                <ChatIcon className={styles.cardIcon} />
                <div className={styles.cardTag}>Chat</div>
                <h3>Connect</h3>
                <p>Anonymous peer support circles that vanish on exit.</p>
              </div>

              <div className={styles.bentoCard}>
                <ExitIcon className={styles.cardIcon} />
                <div className={styles.cardTag}>Safety</div>
                <h3>Panic Exit</h3>
                <p>One tap to instantly hide everything and redirect to safety.</p>
              </div>

              <div className={styles.bentoCard}>
                <CloudIcon className={styles.cardIcon} />
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
            <div className={`${styles.brand} ${styles.footerBrand}`}>
              <img src="/resources/images/logos/safe_harbor_logo.png" alt="" className={styles.logo} />
              Safe Harbor
            </div>
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

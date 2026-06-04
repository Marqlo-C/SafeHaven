import Head from 'next/head';
import Link from 'next/link';
import { useEffect, useRef } from 'react';
import { Cloud } from 'lucide-react';
import { ShieldIcon, GhostIcon, ChatIcon, ExitIcon, FilledLockIcon, CloudIcon, MorphingIcon } from '../components/marketing/index-icons';
import { Phone, MobileSlideshow } from '../components/marketing/index-phone';
import { HomeScreen, CalculatorScreen } from '../components/marketing/index-screens';
import { HowItWorks, Capabilities } from '../components/marketing/index-sections';
import styles from '../styles/marketing/marketing.module.css';

function usePivotPhoneAnimation() {
  const tiltedPhoneRef = useRef(null);
  useEffect(() => {
    const phone = tiltedPhoneRef.current;
    if (!phone) return;
    phone.style.transition = 'transform 1.4s cubic-bezier(0.22, 1, 0.36, 1)';
    phone.style.transformOrigin = 'left bottom';
    setTimeout(() => {
      phone.style.transform = 'rotate(-18deg) scale(0.96)';
    }, 1000);
    return () => {
      phone.style.transform = '';
      phone.style.transition = '';
      phone.style.transformOrigin = '';
    };
  }, []);
  return tiltedPhoneRef;
}

function useScrollReveal() {
  useEffect(() => {
    const elements = document.querySelectorAll('[data-reveal]');
    if (!('IntersectionObserver' in window)) {
      elements.forEach((element) => element.classList.add(styles.revealIn));
      return undefined;
    }
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add(styles.revealIn);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.16 });
    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, []);
}

const LOGO_SRC = '/resources/images/logos/safe_harbor_logo.png';

const TICKER_ITEMS = [
  'Invisible App Icons',
  'Zero Search History',
  'Secure Evidence Vault',
  'Anonymous Peer Support',
  'Instant Panic Redirect',
];

const FEATURES = [
  { Icon: ShieldIcon,    tag: 'Disguise', title: 'The Shield',  body: 'Hidden behind working Calculator, News, or Weather covers.' },
  { Icon: GhostIcon,     tag: 'Privacy',  title: 'Zero Trace',  body: 'No history. No cookies. No footprints left behind.' },
  { Icon: FilledLockIcon,tag: 'Vault',    title: 'Evidence',    body: 'Securely log incidents with encrypted storage.' },
  { Icon: ChatIcon,      tag: 'Chat',     title: 'Connect',     body: 'Anonymous peer support circles that vanish on exit.' },
  { Icon: ExitIcon,      tag: 'Safety',   title: 'Panic Exit',  body: 'One tap to instantly hide everything and redirect to safety.' },
  { Icon: CloudIcon,     tag: 'Sync',     title: 'Cloud',       body: 'Your data stays safe even if your device is seized.' },
];

export default function LandingPage() {
  useScrollReveal();
  const tiltedPhoneRef = usePivotPhoneAnimation();

  return (
    <>
      <Head>
        <title>SafeHaven - Safety, Beautifully Disguised</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content="A quiet, zero-trace sanctuary for your private journey toward safety. Hidden in plain sight." />
        <link rel="icon" href={LOGO_SRC} />
      </Head>

      <div className={styles.page}>
        <header className={styles.header}>
          <div className={styles.brand}>
            <MorphingIcon small />
            SafeHaven
          </div>
          <nav className={styles.nav}>
            <Link href="/downloads" className={styles.navButton}>
              <Cloud className={styles.buttonIcon} />
              Get Protected
            </Link>
          </nav>
        </header>

        <main className={styles.main}>
          <section className={styles.heroSection}>
            <div className={styles.orbOne} />
            <div className={styles.orbTwo} />
            <div className={styles.orbThree} />
            <div className={styles.heroSplit}>
              <div className={styles.heroTextCol}>
                <div className={styles.badge}>You are not alone.</div>
                <h1 className={styles.heroTitle}>
                  Safety, <br />
                  <span className={styles.textGradient}>beautifully disguised.</span>
                </h1>
                <p className={styles.heroSubtitle}>
                  A quiet digital sanctuary for survivors and those seeking a way out.
                  Disguised as calculator, news, or weather tools, SafeHaven gives you
                  space to find support, document your story, and reclaim your peace.
                </p>
                <div className={styles.heroActions}>
                  <Link href="/downloads" className={styles.primaryCta}>
                    <span className={styles.ctaIconCircle}>
                      <ShieldIcon className={styles.buttonIconCta} />
                    </span>
                    Get Started Privately
                  </Link>
                  <span className={styles.secondaryText}>
                    Encrypted <span className={styles.bullet}>•</span> Invisible <span className={styles.bullet}>•</span> Free Forever
                  </span>
                </div>
              </div>
              <div className={styles.heroPhonesCol}>
                <div className={styles.heroPhonesWrap}>
                  <div className={styles.heroPhone}>
                    <div className="side-btn" />
                    <div className="side-btn side-btn-lower" />
                    <div className="side-btn-power" />
                    <Phone float><HomeScreen /></Phone>
                  </div>
                  <div
                    className={`${styles.heroPhone} ${styles.heroPhoneTilted}`}
                    ref={tiltedPhoneRef}
                  >
                    <div className="side-btn" />
                    <div className="side-btn side-btn-lower" />
                    <div className="side-btn-power" />
                    <Phone float><CalculatorScreen /></Phone>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Mobile-only: phones below the banner */}
          <div className={styles.mobileHeroPhones}>
            <div className={styles.heroPhonesWrap}>
              <div className={styles.heroPhone}>
                <Phone float><HomeScreen /></Phone>
              </div>
              <div className={`${styles.heroPhone} ${styles.heroPhoneTilted}`}>
                <Phone float><CalculatorScreen /></Phone>
              </div>
            </div>
          </div>

          <div className={styles.tickerContainer}>
            <div className={styles.tickerTrack}>
              {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, index) => (
                <span key={`${item}-${index}`}>{item}<span className={styles.dot}>•</span></span>
              ))}
            </div>
          </div>

          <HowItWorks />
          <Capabilities />

          <section className={styles.bentoSection}>
            <div className={`${styles.sectionHeader} ${styles.reveal}`} data-reveal>
              <span className={styles.sectionLabel}>THE SANCTUARY CORE</span>
              <h2 className={styles.sectionTitle}>Hidden protection.</h2>
              <p className={styles.sectionSubtitle}>Six tools, quietly working together — so you can stay safe, stay private, and stay in control.</p>
            </div>
            <div className={`${styles.bentoGrid} ${styles.desktopBento}`}>
              {FEATURES.map(({ Icon, tag, title, body }) => (
                <div className={`${styles.bentoCard} ${styles.reveal}`} data-reveal key={title}>
                  <span className={styles.cardIconCircle}><Icon className={styles.cardIcon} /></span>
                  <div className={styles.cardTag}>{tag}</div>
                  <h3>{title}</h3>
                  <p>{body}</p>
                </div>
              ))}
            </div>
            <MobileSlideshow
              items={FEATURES}
              renderItem={({ Icon, tag, title, body }) => (
                <div className={styles.mobileBentoSlide}>
                  <span className={styles.cardIconCircle}><Icon className={styles.cardIcon} /></span>
                  <div className={styles.cardTag}>{tag}</div>
                  <h3>{title}</h3>
                  <p>{body}</p>
                </div>
              )}
            />
          </section>

          <section className={styles.missionSection}>
            <div className={`${styles.missionRow} ${styles.reveal}`} data-reveal>
              <div className={styles.missionContent}>
                <h2 className={styles.missionTitle}>Built with empathy</h2>
                <p className={styles.missionText}>
                  SafeHaven was born from a simple belief — that everyone deserves a place to feel safe, heard, and free.
                  We built this for the moments when you need help but can&apos;t ask out loud. For the times you need to document,
                  reach out, or simply breathe — without leaving a trace. Every feature was designed with care, every detail
                  considered with the people who need it most in mind. This is not just an app. It&apos;s a commitment.
                  If you share that commitment or want to contribute, connect with the developers on the right.
                </p>
              </div>
              <div className={styles.contributors}>
                {[
                  { login: 'Marqlo-C',           avatar: 'https://avatars.githubusercontent.com/u/124465402?v=4' },
                  { login: 'alfredts999',         avatar: 'https://avatars.githubusercontent.com/u/260856211?v=4' },
                  { login: 'Cheemasukh962',       avatar: 'https://avatars.githubusercontent.com/u/188267351?v=4' },
                  { login: 'amritbrar1250-alt',   avatar: 'https://avatars.githubusercontent.com/u/235034893?v=4' },
                ].map(({ login, avatar }) => (
                  <a key={login} href={`https://github.com/${login}`} target="_blank" rel="noopener noreferrer" className={styles.contributor}>
                    <img src={avatar} alt={login} className={styles.contributorAvatar} />
                    <span className={styles.contributorName}>@{login}</span>
                  </a>
                ))}
              </div>
            </div>
          </section>
        </main>

        <footer className={styles.footer}>
          <div className={styles.footerContent}>
            <div className={`${styles.brand} ${styles.footerBrand}`}>
              <MorphingIcon small />
              SafeHaven
            </div>
            <p className={styles.footerDisclaimer}>
              <strong>If you are in immediate danger</strong>, please use a safe device
              to call local emergency services or the National Hotline at <strong>1-800-799-7233</strong>.
            </p>
            <div className={styles.footerLinks}>
              <Link href="/downloads">Install PWA</Link>
              <span>•</span>
              <Link href="/security-guide">Security Guide</Link>
              <span>•</span>
              <Link href="/privacy-policy">Privacy Policy</Link>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}

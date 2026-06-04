import Head from 'next/head';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import { MorphingIcon } from '../components/marketing/index-icons';
import styles from '../styles/downloads.module.css';

const LOGO_SRC = '/resources/images/logos/safe_harbor_logo.png';

const APPS = [
  {
    theme: 'calculator',
    name: 'Calculator Pro',
    icon: '/resources/images/logos/calculator_icon.png',
    preview: 'calculator',
    installAs: 'Calculator Pro',
  },
  {
    theme: 'news',
    name: 'Daily News Reader',
    icon: '/resources/images/logos/news_icon.png',
    preview: 'news',
    installAs: 'Daily News Reader',
  },
  {
    theme: 'weather',
    name: 'Weather Now',
    icon: '/resources/images/logos/weather_icon.png',
    preview: 'weather',
    installAs: 'Weather Now',
  },
];

function CardPreview({ type }) {
  if (type === 'calculator') {
    return (
      <div className={`${styles.coverPreview} ${styles.calcPreview}`}>
        <span className={styles.calcPreviewDisplay}>1,240</span>
        <div className={styles.calcPreviewKeys}>
          {['AC', '%', '÷', '7', '8', '9', '4', '5', '6'].map((key) => <span key={key}>{key}</span>)}
        </div>
      </div>
    );
  }

  if (type === 'news') {
    return (
      <div className={`${styles.coverPreview} ${styles.newsPreview}`}>
        <span className={styles.newsPreviewBrand}>News+</span>
        <strong>Global markets rise as technology shares lead</strong>
        <div>
          <span>World</span>
          <span>Sports</span>
          <span>Search</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`${styles.coverPreview} ${styles.weatherPreview}`}>
      <span className={styles.weatherPreviewSun} />
      <span className={styles.weatherPreviewTemp}>72&deg;</span>
      <small>Sunny now</small>
    </div>
  );
}

function MotionAppCard({ app, pointer, layoutTick }) {
  const itemRef = useRef(null);
  const y = useMotionValue(0);
  const scale = useMotionValue(1);
  const smoothY = useSpring(y, { stiffness: 360, damping: 28, mass: 0.8 });
  const smoothScale = useSpring(scale, { stiffness: 360, damping: 28, mass: 0.8 });
  const [zIndex, setZIndex] = useState(1);

  useEffect(() => {
    const item = itemRef.current;
    if (!item || !pointer.inside || pointer.x == null || pointer.y == null) {
      y.set(0);
      scale.set(1);
      setZIndex(1);
      return;
    }

    const rect = item.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const distanceX = Math.abs(pointer.x - centerX);
    const distanceY = Math.abs(pointer.y - centerY);
    const proximity = Math.max(0, 1 - Math.hypot(distanceX / 220, distanceY / 160));

    y.set(-proximity * 18);
    scale.set(1 + proximity * 0.045);
    setZIndex(Math.round(1 + proximity * 20));
  }, [pointer.x, pointer.y, pointer.inside, layoutTick, y, scale]);

  return (
    <motion.div
      ref={itemRef}
      className={styles.appCardMotion}
      style={{ y: smoothY, scale: smoothScale, zIndex }}
    >
      <Link href={`/preview/${app.theme}`} className={styles.appCard}>
        <CardPreview type={app.preview} />
        <div className={styles.cardTop}>
          <img src={app.icon} alt="" className={styles.cardIcon} />
        </div>
        <div className={styles.cardFooter}>
          <span>Installs as {app.installAs}</span>
          <strong>Preview cover</strong>
        </div>
      </Link>
    </motion.div>
  );
}

export default function Downloads() {
  const gridRef = useRef(null);
  const [pointer, setPointer] = useState({ x: null, y: null, inside: false });
  const [layoutTick, setLayoutTick] = useState(0);

  useEffect(() => {
    const onLayout = () => setLayoutTick((tick) => tick + 1);
    const grid = gridRef.current;
    if (!grid) return undefined;

    window.addEventListener('resize', onLayout);
    window.addEventListener('scroll', onLayout, { passive: true });
    return () => {
      window.removeEventListener('resize', onLayout);
      window.removeEventListener('scroll', onLayout);
    };
  }, []);

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
            <MorphingIcon small />
            SafeHaven
          </Link>
          <nav>
            <Link href="/" className={styles.navButton}>
              <span className={styles.labelFull}>Back to Home</span>
              <span className={styles.labelShort}>Go Home</span>
            </Link>
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
              </p>
            </div>
          </section>

          <section
            className={styles.appGrid}
            ref={gridRef}
            onMouseMove={(event) => {
              setPointer({ x: event.clientX, y: event.clientY, inside: true });
            }}
            onMouseLeave={() => {
              setPointer({ x: null, y: null, inside: false });
            }}
          >
            {APPS.map((app) => (
              <MotionAppCard key={app.theme} app={app} pointer={pointer} layoutTick={layoutTick} />
            ))}
          </section>
        </main>

      </div>
    </>
  );
}

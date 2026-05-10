import Head from 'next/head';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import PanicExit from '../../components/PanicExit';
import Button from '../../components/Button';
import CalculatorCover from '../../components/CalculatorCover';
import NewsCover from '../../components/NewsCover';
import PrivateModeShell from '../../components/PrivateModeShell';
import WeatherCover from '../../components/WeatherCover';
import LocationCapture from '../../components/LocationCapture';
import { usePrivacyMode } from '../../hooks/usePrivacyMode';
import landingStyles from '../../styles/Landing.module.css';

const { withAuth } = require('../../lib/withAuth');

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

const THEMES = {
  calculator: {
    themeKey: 'calculator',
    appName: 'Calculator Pro',
    manifestUrl: '/manifests/calculator.json',
    themeColor: '#1a1a2e',
    appleTouchIcon: '/resources/images/logos/calculator_icon_192x192.png',
  },
  news: {
    themeKey: 'news',
    appName: 'Daily News Reader',
    manifestUrl: '/manifests/news.json',
    themeColor: '#0d1b2a',
    appleTouchIcon: '/resources/images/logos/news_icon_192x192.png',
  },
  weather: {
    themeKey: 'weather',
    appName: 'Weather Now',
    manifestUrl: '/manifests/weather.json',
    themeColor: '#0c2340',
    appleTouchIcon: '/resources/images/logos/weather_icon_192x192.png',
  },
};

/* ── Install Modal Component ────────────────────────────────────────────── */

const InstallModal = ({ isOpen, onClose, onInstall, canInstall, platform, appName }) => {
  if (!isOpen) return null;
  const isIOS = platform === 'ios';

  return (
    <div className={landingStyles.modalOverlay} onClick={onClose}>
      <div className={landingStyles.modalContent} onClick={(e) => e.stopPropagation()}>
        <button className={landingStyles.closeBtn} onClick={onClose}>✕</button>
        <div className={landingStyles.modalHeader}>
          <ShieldIcon className={landingStyles.modalShield} />
          <h3 className={landingStyles.modalTitle}>Secure {appName}</h3>
        </div>
        
        <div className={landingStyles.modalBody}>
          {isIOS ? (
            <>
              <p>To hide this app on your iPhone:</p>
              <ol className={landingStyles.steps}>
                <li>Tap the <strong>Share</strong> button in Safari.</li>
                <li>Select <strong>Add to Home Screen</strong>.</li>
                <li>Tap <strong>Add</strong>.</li>
              </ol>
              <p className={landingStyles.modalNote}>It will appear as a normal utility icon.</p>
            </>
          ) : canInstall ? (
            <>
              <p>To secure this app on your device and hide its identity, click the button below to install it to your home screen.</p>
              <p className={landingStyles.modalNote}>Once installed, it will appear as a standard {appName.split(' ')[0]} icon.</p>
            </>
          ) : (
            <>
              <p>To secure this app on your device:</p>
              <ol className={landingStyles.steps}>
                <li>Tap the <strong>menu icon</strong> in your browser.</li>
                <li>Select <strong>Install App</strong>.</li>
                <li>Confirm to add it to your home screen.</li>
              </ol>
            </>
          )}
        </div>
        
        {canInstall && !isIOS ? (
          <button className={landingStyles.modalAction} onClick={onInstall}>Install Now</button>
        ) : (
          <button className={landingStyles.modalAction} onClick={onClose}>Finish Setup</button>
        )}
      </div>
    </div>
  );
};

/* ── Main App Shell Component ────────────────────────────────────────────── */

export default function AppShell({
  themeKey,
  appName,
  manifestUrl,
  themeColor,
  appleTouchIcon,
  session,
  geolocationEnabled,
}) {
  usePrivacyMode();
  const router = useRouter();

  const [installPrompt, setInstallPrompt] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [platform, setPlatform] = useState('other');
  const [showChat, setShowChat] = useState(false);
  const [installed, setInstalled] = useState(false);
  const [showPrivateMode, setShowPrivateMode] = useState(false);

  // Platform detection effect
  useEffect(() => {
    // Check platform
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    if (isIOS) setPlatform('ios');

    // Auto-show modal if install flag is present
    if (router.query.install === 'true') {
      setShowModal(true);
    }
  }, [router.query.install]);

  // Install prompt event listeners effect
  useEffect(() => {
    const onPrompt = (event) => {
      event.preventDefault();
      setInstallPrompt(event);
    };

    const onInstalled = () => {
      setInstalled(true);
      setInstallPrompt(null);
      setShowModal(false);
    };

    window.addEventListener('beforeinstallprompt', onPrompt);
    window.addEventListener('appinstalled', onInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  const triggerNativeInstall = async () => {
    if (!installPrompt) return;

    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === 'accepted') {
      setInstallPrompt(null);
      setShowModal(false);
    }
  };

  const handleInstall = triggerNativeInstall;

  const renderCover = () => {
    if (themeKey === 'calculator') return <CalculatorCover />;
    if (themeKey === 'news') return <NewsCover />;
    if (themeKey === 'weather') return <WeatherCover />;
    return <PrivateModeShell displayName={session.displayName} />;
  };

  return (
    <>
      <Head>
        <title>{appName}</title>
        <meta name="application-name" content={appName} />
        <meta name="theme-color" content={themeColor} />
        <link rel="manifest" href={manifestUrl} />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content={appName} />
        <link rel="apple-touch-icon" href={appleTouchIcon} />
        <meta name="robots" content="noindex, nofollow" />
        <meta name="referrer" content="no-referrer" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0" />
      </Head>

      <main>
        {/* ── Installation Modal (Differentiated by Route) ── */}
        <InstallModal 
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          platform={platform}
          appName={appName}
        />

        {/* ── Installation Banner ── */}
        {installPrompt && !installed && !showPrivateMode && (
          <div style={bannerStyle}>
            <span>Add {appName} to your home screen.</span>
            <button type="button" onClick={handleInstall} style={installBtnStyle}>
              Install
            </button>
          </div>
        )}

        {/* ── Main Content ── */}
        {showPrivateMode ? (
          <PrivateModeShell displayName={session.displayName} />
        ) : showChat ? (
          <ChatRoom roomId="sos" displayName={session.displayName} />
        ) : (
          <>
            {geolocationEnabled && <LocationCapture />}
            {renderCover()}
          </>
        )}
      </main>

      <PanicExit showButton={!showPrivateMode} />
      {!showPrivateMode && !showChat && <Button onClick={() => setShowChat(true)} />}
      {!showPrivateMode && showChat && <Button onClick={() => setShowPrivateMode(true)} />}

      {/* Persistent Install Trigger for non-PWA mode */}
      {installPrompt && !showModal && (
        <div style={bannerStyle} onClick={() => setShowModal(true)}>
          <span>Secure {appName} to Home Screen</span>
          <button onClick={(e) => { e.stopPropagation(); triggerNativeInstall(); }} style={installBtnStyle}>Install</button>
        </div>
      )}
    </>
  );
}

export const getServerSideProps = withAuth(async (context) => {
  const config = require('../../config/config');
  const { params } = context;
  const theme = THEMES[params.theme];
  if (!theme) return { notFound: true };
  return {
    props: {
      ...theme,
      geolocationEnabled: Boolean(config.features.enable_geolocation),
    },
  };
});

// ── Inline styles (discreet banner) ──────────────────────────────────────────

const bannerStyle = {
  position: 'fixed',
  bottom: '80px',
  left: '16px',
  right: '16px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '12px',
  padding: '14px 20px',
  background: 'rgba(252, 250, 247, 0.8)',
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  border: '1px solid rgba(232, 223, 212, 0.5)',
  borderRadius: '20px',
  color: '#362e28',
  fontSize: '14px',
  fontWeight: '600',
  boxShadow: '0 10px 30px rgba(54, 46, 40, 0.1)',
  zIndex: 100,
  cursor: 'pointer',
};

const installBtnStyle = {
  padding: '8px 16px',
  borderRadius: '999px',
  border: 'none',
  background: '#362e28',
  color: '#fff',
  cursor: 'pointer',
  fontSize: '13px',
  fontWeight: '700',
};

import Head from 'next/head';
import { useEffect, useState } from 'react';
import PanicExit from '../../components/PanicExit';
import Button from '../../components/Button';
import CalculatorCover from '../../components/CalculatorCover';
import NewsCover from '../../components/NewsCover';
import PrivateModeShell from '../../components/PrivateModeShell';
import WeatherCover from '../../components/WeatherCover';
import { usePrivacyMode } from '../../hooks/usePrivacyMode';

const { withAuth } = require('../../lib/withAuth');

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

export default function AppShell({
  themeKey,
  appName,
  manifestUrl,
  themeColor,
  appleTouchIcon,
  session,
}) {
  usePrivacyMode();

  const [installPrompt, setInstallPrompt] = useState(null);
  const [installed, setInstalled] = useState(false);
  const [showPrivateMode, setShowPrivateMode] = useState(false);

  useEffect(() => {
    const onPrompt = (event) => {
      event.preventDefault();
      setInstallPrompt(event);
    };

    const onInstalled = () => {
      setInstalled(true);
      setInstallPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', onPrompt);
    window.addEventListener('appinstalled', onInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  const handleInstall = async () => {
    if (!installPrompt) return;

    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === 'accepted') setInstalled(true);
    setInstallPrompt(null);
  };

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
        <meta name="format-detection" content="telephone=no, date=no, email=no, address=no" />
        <meta httpEquiv="autocomplete" content="off" />
      </Head>

      <main>
        {installPrompt && !installed && !showPrivateMode && (
          <div style={bannerStyle}>
            <span>Add {appName} to your home screen.</span>
            <button type="button" onClick={handleInstall} style={installBtnStyle}>
              Install
            </button>
          </div>
        )}

        {showPrivateMode ? (
          <PrivateModeShell displayName={session.displayName} />
        ) : (
          renderCover()
        )}
      </main>

      <PanicExit showButton={!showPrivateMode} />
      {!showPrivateMode && (
        <Button onClick={() => setShowPrivateMode(true)} />
      )}
    </>
  );
}

export const getServerSideProps = withAuth(async (context) => {
  const { params } = context;
  const theme = THEMES[params.theme];
  if (!theme) return { notFound: true };
  return { props: theme };
});

const bannerStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '12px',
  padding: '12px 16px',
  background: 'rgba(255,255,255,0.08)',
  color: '#fff',
  fontSize: '14px',
};

const installBtnStyle = {
  padding: '6px 14px',
  borderRadius: '6px',
  border: '1px solid rgba(255,255,255,0.3)',
  background: 'transparent',
  color: '#fff',
  cursor: 'pointer',
  fontSize: '13px',
};

import Head from 'next/head';
import { useEffect, useState } from 'react';
import PanicExit from '../../components/PanicExit';
import Button from '../../components/Button';
import ChatRoom from '../../components/ChatRoom';
import CalculatorCover from '../../components/CalculatorCover';
import NewsCover from '../../components/NewsCover';
import WeatherCover from '../../components/WeatherCover';
import LocationCapture from '../../components/LocationCapture';
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
  geolocationEnabled,
}) {
  usePrivacyMode();

  const [installPrompt, setInstallPrompt] = useState(null);
  const [installed, setInstalled] = useState(false);
  const [showChat, setShowChat] = useState(false);

  useEffect(() => {
    const onPrompt = (e) => { e.preventDefault(); setInstallPrompt(e); };
    window.addEventListener('beforeinstallprompt', onPrompt);
    window.addEventListener('appinstalled', () => { setInstalled(true); setInstallPrompt(null); });
    return () => window.removeEventListener('beforeinstallprompt', onPrompt);
  }, []);

  const handleInstall = async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === 'accepted') setInstalled(true);
    setInstallPrompt(null);
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
        {installPrompt && !installed && (
          <div style={bannerStyle}>
            <span>Add {appName} to your home screen.</span>
            <button onClick={handleInstall} style={installBtnStyle}>Install</button>
          </div>
        )}

        {/* ── Real app content ── */}
        {/* Cover UI (calculator/news/weather disguise) goes here at Figma handoff. */}
        {/* ChatRoom is the functional core until cover UIs are designed.           */}
        {geolocationEnabled && <LocationCapture />}
        {showChat ? (
          <ChatRoom roomId="sos" displayName={session.displayName} />
        ) : themeKey === 'calculator' ? (
          <CalculatorCover />
        ) : themeKey === 'news' ? (
          <NewsCover />
        ) : themeKey === 'weather' ? (
          <WeatherCover />
        ) : (
          <ChatRoom roomId="general" displayName={session.displayName} />
        )}
      </main>

      <PanicExit />
      {!showChat && <Button onClick={() => setShowChat(true)} />}
    </>
  );
}

// ── Auth-gated data fetching ──────────────────────────────────────────────────

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

// ── Inline styles (non-design, structural only) ───────────────────────────────

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

import Head from 'next/head';
import Link from 'next/link';
import { useEffect } from 'react';
import {
  AlertTriangle,
  BriefcaseMedical,
  Calculator,
  Check,
  CloudSun,
  Cloud,
  Home,
  LifeBuoy,
  Lock,
  MapPin,
  MessageCircle,
  Newspaper,
  PenLine,
  Search,
  Shield,
  Siren,
  Users,
} from 'lucide-react';
import styles from '../styles/Marketing.module.css';

const LOGO_SRC = '/resources/images/logos/safe_harbor_logo.png';

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

const FilledLockIcon = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} xmlns="http://www.w3.org/2000/svg">
    <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM9 6c0-1.66 1.34-3 3-3s3 1.34 3 3v2H9V6zm3 11c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2z" />
  </svg>
);

const CloudIcon = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} xmlns="http://www.w3.org/2000/svg">
    <path d="M19.35 10.04A7.49 7.49 0 0 0 12 4C9.11 4 6.6 5.64 5.35 8.04A5.994 5.994 0 0 0 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96z" />
  </svg>
);

const RedLockIcon = ({ className }) => (
  <svg viewBox="0 0 24 28" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
    <path d="M7 11V8a5 5 0 0 1 10 0" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" fill="none" />
    <rect x="4" y="11" width="16" height="13" rx="3" fill="currentColor" />
    <circle cx="12" cy="17" r="2" fill="white" />
    <rect x="11" y="18" width="2" height="3" rx="1" fill="white" />
  </svg>
);

const HistoryIcon = () => (
  <svg viewBox="0 0 22 22" fill="white" width="20" height="20" aria-hidden="true">
    <rect x="2" y="3" width="3" height="3" rx="0.75" />
    <rect x="7" y="3.75" width="13" height="1.5" rx="0.75" />
    <rect x="2" y="9.5" width="3" height="3" rx="0.75" />
    <rect x="7" y="10.25" width="13" height="1.5" rx="0.75" />
    <rect x="2" y="16" width="3" height="3" rx="0.75" />
    <rect x="7" y="16.75" width="13" height="1.5" rx="0.75" />
  </svg>
);

const SciToggleIcon = () => (
  <svg viewBox="0 0 26 32" width="15" height="18" aria-hidden="true">
    <rect x="1" y="1" width="24" height="30" rx="4" fill="none" stroke="white" strokeWidth="1.5" />
    <rect x="4.25" y="4.25" width="17.5" height="5.5" rx="1" fill="white" />
    <rect x="4.25" y="12.25" width="4.17" height="3.5" rx="0.7" fill="white" />
    <rect x="10.92" y="12.25" width="4.17" height="3.5" rx="0.7" fill="white" />
    <rect x="17.59" y="12.25" width="4.17" height="3.5" rx="0.7" fill="white" />
    <rect x="4.25" y="18.25" width="4.17" height="3.5" rx="0.7" fill="white" />
    <rect x="10.92" y="18.25" width="4.17" height="3.5" rx="0.7" fill="white" />
    <rect x="17.59" y="18.25" width="4.17" height="3.5" rx="0.7" fill="white" />
    <rect x="4.25" y="24.25" width="4.17" height="3.5" rx="0.7" fill="white" />
    <rect x="10.92" y="24.25" width="4.17" height="3.5" rx="0.7" fill="white" />
    <rect x="17.59" y="24.25" width="4.17" height="3.5" rx="0.7" fill="white" />
  </svg>
);

const BackspaceIcon = () => (
  <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M20 5H8c-.53 0-1.04.26-1.37.68L2 12l4.63 6.32c.33.43.84.68 1.37.68H20a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2z" />
    <line x1="11.5" y1="9.5" x2="16.5" y2="14.5" />
    <line x1="16.5" y1="9.5" x2="11.5" y2="14.5" />
  </svg>
);

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

const MorphingIcon = () => (
  <div className={styles.morphingIconContainer}>
    <div className={styles.morphingGlow} />
    <Calculator className={styles.morphingIcon} />
    <Newspaper className={styles.morphingIcon} />
    <CloudSun className={styles.morphingIcon} />
    <Shield className={styles.morphingIcon} />
  </div>
);

const TICKER_ITEMS = [
  'Invisible App Icons',
  'Zero Search History',
  'Secure Evidence Vault',
  'Anonymous Peer Support',
  'Instant Panic Redirect',
];

const FEATURES = [
  { Icon: ShieldIcon, tag: 'Disguise', title: 'The Shield', body: 'Hidden behind working Calculator, News, or Weather covers.' },
  { Icon: GhostIcon, tag: 'Privacy', title: 'Zero Trace', body: 'No history. No cookies. No footprints left behind.' },
  { Icon: FilledLockIcon, tag: 'Vault', title: 'Evidence', body: 'Securely log incidents with encrypted storage.' },
  { Icon: ChatIcon, tag: 'Chat', title: 'Connect', body: 'Anonymous peer support circles that vanish on exit.' },
  { Icon: ExitIcon, tag: 'Safety', title: 'Panic Exit', body: 'One tap to instantly hide everything and redirect to safety.' },
  { Icon: CloudIcon, tag: 'Sync', title: 'Cloud', body: 'Your data stays safe even if your device is seized.' },
];

function StatusBar() {
  return (
    <div className={styles.screenStatus}>
      <span>9:41</span>
      <span>••• 5G ▮</span>
    </div>
  );
}

function AppHeader({ title }) {
  return (
    <>
      <StatusBar />
      <div className={styles.appHeader}>
        <div className={styles.headerSpacer} aria-hidden="true" />
        <span>{title}</span>
        <RedLockIcon className={styles.redLock} />
      </div>
    </>
  );
}

function BottomTabs({ active }) {
  const tabs = [
    ['Home', Home],
    ['SOS', Siren],
    ['Chat', MessageCircle],
    ['Journal', PenLine],
    ['Aid', LifeBuoy],
  ];
  return (
    <div className={styles.bottomTabs}>
      {tabs.map(([label, Icon]) => (
        <div className={`${styles.tabItem} ${active === label ? styles.activeTab : ''}`} key={label}>
          <Icon size={18} />
          <span>{label}</span>
        </div>
      ))}
    </div>
  );
}

function Phone({ children, float = false, callout }) {
  return (
    <div className={`${styles.phoneWrap} ${float ? styles.phoneWrapFloat : ''}`}>
      <div className={styles.phone}>
        <div className={styles.phoneNotch} />
        <div className={styles.phoneScreen}>{children}</div>
      </div>
      {callout}
    </div>
  );
}

function CalculatorScreen() {
  const keys = ['⌫', 'AC', '%', '÷', '7', '8', '9', '×', '4', '5', '6', '−', '1', '2', '3', '+', '+/-', '0', '.', '='];
  return (
    <div className={`${styles.mockScreen} ${styles.calcScreen}`}>
      <StatusBar />
      <div className={styles.calcTopBar}>
        <span><HistoryIcon /></span>
        <span><SciToggleIcon /></span>
      </div>
      <div className={styles.calcDisplay}>1,240</div>
      <div className={styles.calcKeys}>
        {keys.map((key) => <span className={styles.calcKey} key={key}>{key === '⌫' ? <BackspaceIcon /> : key}</span>)}
      </div>
      <span className={styles.privateDot} />
    </div>
  );
}

function HomeScreen() {
  return (
    <div className={styles.mockScreen}>
      <AppHeader title="Home" />
      <div className={styles.screenBody}>
        <p className={styles.eyebrow}>Good evening</p>
        <h3>You&apos;re safe here.</h3>
        <p className={styles.screenLead}>Take a breath. Everything in this space is private.</p>
        <div className={styles.sosCard}>
          <span><Siren size={20} /></span>
          <div><strong>Send an SOS</strong><small>Alert your trusted contacts in one tap</small></div>
        </div>
        <div className={styles.setupCard}>
          <div className={styles.setupTitle}><Shield size={14} /> Your safety setup</div>
          <div className={styles.setupGrid}>
            <span><small>Contacts</small><strong>6</strong></span>
            <span className={`${styles.locationMini} ${styles.locationMiniOn}`}><small>Location</small><b><em>On</em><i /></b></span>
            <span><small>Backup</small><strong>12</strong></span>
          </div>
        </div>
        <div className={styles.journalTeaser}>
          <div className={styles.journalTop}><span>Others&apos; Journals</span><small>1 / 6</small></div>
          <div className={styles.journalCard}>
            <span className={styles.journalAvatar}>PK</span>
            <strong>PaperKite</strong>
            <small>Anonymous - May 5</small>
            <p>&quot;Started a new journal. The old one I had to leave behind. This one is mine.&quot;</p>
          </div>
        </div>
        <div className={styles.quickGrid}>
          <div><MessageCircle size={18} /><strong>Talk to an advocate</strong><small>Available now</small></div>
          <div><PenLine size={18} /><strong>Add to journal</strong><small>Save evidence</small></div>
          <div><LifeBuoy size={18} /><strong>Find help nearby</strong><small>Shelters and aid</small></div>
          <div><HeartIcon /><strong>A moment for you</strong><small>Grounding card</small></div>
        </div>
      </div>
      <BottomTabs active="Home" />
    </div>
  );
}

function SosScreen() {
  return (
    <div className={styles.mockScreen}>
      <AppHeader title="SOS" />
      <div className={styles.screenBody}>
        <div className={styles.emergencyCard}>
          <span><Shield size={14} /> Emergency Alert</span>
          <strong>Ready to alert your contacts</strong>
          <small>One tap alerts your trusted contacts and shares your current location with them.</small>
        </div>
        <button className={styles.sendSosButton}>Send SOS</button>
        <div className={styles.statGrid}>
          <div><Users size={16} /><small>Trusted Contacts</small><strong>3 contacts</strong></div>
          <div className={styles.statActive}><MapPin size={16} /><small>Share Location</small><strong>On</strong><em /></div>
          <div><Cloud size={16} /><small>Evidence Backup</small><strong>Not started</strong></div>
          <div><ClockIcon /><small>Last Safety Check</small><strong>Never</strong></div>
        </div>
        <div className={styles.mapMock}>
          <span className={styles.mapDot} />
          <small>Current Location</small>
        </div>
        <div className={styles.notice}><AlertTriangle size={15} /> Alerts are sent without the app name.</div>
      </div>
      <BottomTabs active="SOS" />
    </div>
  );
}

const HeartIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
  </svg>
);

const ClockIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="10" />
    <path d="M12 6v6l4 2" />
  </svg>
);

function ChatScreen() {
  const chats = ['SafeBot', 'CalmMeadow4681', 'CedarBrook', 'EmberMoth'];
  return (
    <div className={styles.mockScreen}>
      <AppHeader title="Chat" />
      <div className={styles.screenBody}>
        <div className={styles.segmented}><strong>Messages</strong><span>Friends</span></div>
        <div className={styles.infoPill}><BriefcaseMedical size={14} /> You can only message accepted friends.</div>
        <div className={styles.searchMock}><Search size={15} /> Search chats</div>
        <p className={styles.listLabel}>Always available</p>
        {chats.map((chat, index) => (
          <div className={styles.chatRow} key={chat}>
            <span>{chat.slice(0, 2).toUpperCase()}</span>
            <div><strong>{chat}</strong><small>{index === 0 ? 'I am here anytime. Try "I feel anxious".' : 'SOS: shared current location...'}</small></div>
          </div>
        ))}
      </div>
      <BottomTabs active="Chat" />
    </div>
  );
}

function AidScreen() {
  return (
    <div className={styles.mockScreen}>
      <AppHeader title="Resources" />
      <div className={styles.screenBody}>
        <div className={styles.infoPill}><Lock size={14} /> Search results are context-aware and not stored.</div>
        <div className={styles.mapMock}>
          <span className={styles.mapDot} />
          <span className={styles.mapPin} />
          <small>Showing resources near you</small>
        </div>
        <div className={styles.resourceTabs}><strong>Shelters</strong><span>Legal Aid</span><span>Financial</span><span>Counseling</span></div>
        <div className={styles.resourceCard}>
          <strong>Opportunity House Homeless Shelter</strong>
          <small>16 mi away</small>
          <p>267 Bennett Hill Ct, Vacaville, California</p>
          <div><button>Call</button><button>Directions</button></div>
        </div>
      </div>
      <BottomTabs active="Aid" />
    </div>
  );
}

function HowItWorks() {
  const steps = [
    {
      title: 'Choose a cover',
      copy: 'Open through a working calculator, news, or weather screen. Each cover keeps SafeHaven hidden in plain sight.',
      screen: <CalculatorScreen />,
      callout: (
        <div className={`${styles.callout} ${styles.calloutAccent} ${styles.calloutCoverDot}`}>
          <span className={styles.calloutLine} />
          <strong>Discreet entry point</strong>
          <small>Small orange dot opens private mode</small>
        </div>
      ),
    },
    {
      title: 'Your private space opens',
      copy: 'A quiet home base brings SOS, chat, journaling, and resources together with the same warm app interface.',
      screen: <HomeScreen />,
      callout: (
        <div className={`${styles.callout} ${styles.calloutLocationToggle}`}>
          <span className={styles.calloutLine} />
          <strong>Live location control</strong>
          <small>Toggle sharing from safety setup</small>
        </div>
      ),
    },
    {
      title: 'Help is one tap away',
      copy: 'Send an SOS with your location, talk with an advocate, or find nearby resources without leaving context behind.',
      screen: <SosScreen />,
      callout: (
        <div className={`${styles.callout} ${styles.calloutAccent} ${styles.calloutShareToggle}`}>
          <span className={styles.calloutLine} />
          <strong>Share location with SOS</strong>
          <small>Contacts receive it only when sent</small>
        </div>
      ),
    },
  ];

  return (
    <section className={styles.section} id="how">
      <div className={`${styles.sectionHead} ${styles.reveal}`} data-reveal>
        <span className={styles.sectionLabel}>HOW IT WORKS</span>
        <h2>Hidden in plain sight.</h2>
        <p>SafeHaven lives behind everyday utility apps, then opens into a private safety space only you know how to reach.</p>
      </div>
      <div className={styles.steps}>
        {steps.map((step, index) => (
          <div className={`${styles.step} ${styles.reveal}`} data-reveal key={step.title}>
            <div className={styles.stepPhoneWrap}>
              <Phone callout={step.callout}>
                {step.screen}
              </Phone>
            </div>
            <span className={styles.stepNum}>{index + 1}</span>
            <h3>{step.title}</h3>
            <p>{step.copy}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function Capability({ flip = false, label, title, lead, screen, items, callout }) {
  return (
    <div className={`${styles.capability} ${flip ? styles.capabilityFlip : ''} ${styles.reveal}`} data-reveal>
      <div className={styles.capPhone}><Phone float callout={callout}>{screen}</Phone></div>
      <div className={styles.capText}>
        <span>{label}</span>
        <h3>{title}</h3>
        <p>{lead}</p>
        <div className={styles.capList}>
          {items.map(([itemTitle, copy]) => (
            <div className={styles.capItem} key={itemTitle}>
              <span><Check size={14} /></span>
              <div><strong>{itemTitle}</strong><small>{copy}</small></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Capabilities() {
  return (
    <section className={styles.section} id="capabilities">
      <div className={`${styles.sectionHead} ${styles.reveal}`} data-reveal>
        <span className={styles.sectionLabel}>WHAT&apos;S INSIDE</span>
        <h2>Everything you need, quietly.</h2>
        <p>Each tool mirrors the actual private app experience: fast, warm, and designed for stressful moments.</p>
      </div>
      <div className={styles.capabilities}>
        <Capability
          label="Emergency SOS"
          title="Reach safety in one tap"
          lead="When seconds count, a single press alerts everyone you trust with your location and a timestamp."
          screen={<SosScreen />}
          callout={<div className={`${styles.callout} ${styles.calloutAccent} ${styles.calloutSosButton}`}><span className={styles.calloutLine} /><strong>Send SOS button</strong><small>Alerts trusted contacts in chat</small></div>}
          items={[['Trusted contacts', 'Notified in real time.'], ['Location control', 'Shared only when you choose.'], ['Panic exit', 'Hide the private app instantly.']]}
        />
        <Capability
          flip
          label="Support & Community"
          title="You are never alone"
          lead="Talk to a trauma-informed advocate, then connect anonymously only with accepted friends."
          screen={<ChatScreen />}
          callout={<div className={`${styles.callout} ${styles.calloutChatList}`}><span className={styles.calloutLine} /><strong>SafeBot + friend chats</strong><small>Message accepted friends only</small></div>}
          items={[['AI advocate', 'Safety planning at any hour.'], ['Accepted friends', 'Messages stay controlled.'], ['Quiet interface', 'Built for repeated use.']]}
        />
        <Capability
          label="Resources Nearby"
          title="Find help close to home"
          lead="Discover shelters, legal aid, financial help, and counseling near you with clear next actions."
          screen={<AidScreen />}
          callout={<div className={`${styles.callout} ${styles.calloutAidFilters}`}><span className={styles.calloutLine} /><strong>Filter nearby resources</strong><small>Shelter, legal, financial, counseling</small></div>}
          items={[['Local results', 'Sorted around your location.'], ['Real organizations', 'Shelters, legal aid, and counseling.'], ['Context-aware', 'Searches are not stored on-device.']]}
        />
      </div>
    </section>
  );
}

export default function LandingPage() {
  useScrollReveal();

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
            <img src={LOGO_SRC} alt="" className={styles.logo} />
            SafeHaven
          </div>
          <nav className={styles.nav}>
            <Link href="/downloads" className={styles.navButton}>
              <ShieldIcon className={styles.buttonIcon} />
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
                  <MorphingIcon />
                  <div className={styles.badge}>Your private journey starts here</div>
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
                      <ShieldIcon className={styles.buttonIconCta} />
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
                    <Phone>{<HomeScreen />}</Phone>
                  </div>
                  <div className={`${styles.heroPhone} ${styles.heroPhoneTilted}`}>
                    <div className="side-btn" />
                    <div className="side-btn side-btn-lower" />
                    <div className="side-btn-power" />
                    <Phone>{<CalculatorScreen />}</Phone>
                  </div>
                </div>
              </div>
            </div>
          </section>

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
            </div>
            <div className={styles.bentoGrid}>
              {FEATURES.map(({ Icon, tag, title, body }) => (
                <div className={`${styles.bentoCard} ${styles.reveal}`} data-reveal key={title}>
                  <Icon className={styles.cardIcon} />
                  <div className={styles.cardTag}>{tag}</div>
                  <h3>{title}</h3>
                  <p>{body}</p>
                </div>
              ))}
            </div>
          </section>

          <section className={styles.missionSection}>
            <div className={`${styles.missionContent} ${styles.reveal}`} data-reveal>
              <h2 className={styles.missionTitle}>Built with empathy</h2>
              <p className={styles.missionText}>
                We believe everyone deserves a space where they can be heard without fear.
                SafeHaven is a bridge to independence. We keep your secrets so you can find your strength.
              </p>
            </div>
          </section>
        </main>

        <footer className={styles.footer}>
          <div className={styles.footerContent}>
            <div className={`${styles.brand} ${styles.footerBrand}`}>
              <img src={LOGO_SRC} alt="" className={styles.logo} />
              SafeHaven
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

import { useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertTriangle,
  BookLock,
  Bot,
  Camera,
  Check,
  ChevronLeft,
  ChevronRight,
  Circle,
  Clock,
  Cloud,
  FileImage,
  Heart,
  Home,
  LifeBuoy,
  Lock,
  Map,
  MapPin,
  MessageCircle,
  Mic,
  Phone,
  Search,
  Send,
  Shield,
  Siren,
  Users,
  Video,
  X,
} from 'lucide-react';
import { triggerPanicExit } from '../hooks/usePrivacyMode';
import styles from '../styles/PrivateModeShell.module.css';

const TABS = [
  { id: 'home', title: 'Home', label: 'Home', Icon: Home },
  { id: 'sos', title: 'SOS', label: 'SOS', Icon: Siren },
  { id: 'chat', title: 'Chat', label: 'Chat', Icon: MessageCircle },
  { id: 'journal', title: 'Journal', label: 'Journal', Icon: BookLock },
  { id: 'aid', title: 'Resources', label: 'Aid', Icon: LifeBuoy },
];

export default function PrivateModeShell({ displayName }) {
  const [activeTab, setActiveTab] = useState('home');

  const activeTitle = useMemo(
    () => TABS.find((tab) => tab.id === activeTab)?.title || 'Home',
    [activeTab]
  );

  return (
    <section className={styles.page} aria-label="Private safety tools">
      <div className={styles.shell}>
        <header className={styles.header}>
          <div className={styles.headerSpacer} aria-hidden="true" />
          <div className={styles.headerTitle}>{activeTitle}</div>
          <button
            type="button"
            className={styles.exitButton}
            aria-label="Quick exit"
            title="Quick exit"
            onClick={triggerPanicExit}
          >
            <X className={styles.exitIcon} aria-hidden="true" />
          </button>
        </header>

        <main className={styles.content}>
          <Panel active={activeTab === 'home'}>
            <HomePanel onNavigate={setActiveTab} />
          </Panel>
          <Panel active={activeTab === 'sos'}>
            <SosPanel />
          </Panel>
          <Panel active={activeTab === 'chat'}>
            <ChatPanel displayName={displayName} />
          </Panel>
          <Panel active={activeTab === 'journal'}>
            <JournalPanel />
          </Panel>
          <Panel active={activeTab === 'aid'}>
            <AidPanel />
          </Panel>
        </main>

        <nav className={styles.tabBar} aria-label="Private mode sections">
          {TABS.map(({ id, label, Icon }) => {
            const active = activeTab === id;

            return (
              <button
                key={id}
                type="button"
                className={`${styles.tabButton} ${active ? styles.tabButtonActive : ''}`}
                aria-pressed={active}
                onClick={() => setActiveTab(id)}
              >
                <Icon className={styles.tabIcon} aria-hidden="true" />
                <span>{label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </section>
  );
}

function Panel({ active, children }) {
  return (
    <div
      className={`${styles.panel} ${active ? styles.panelActive : styles.panelHidden}`}
      aria-hidden={!active}
    >
      {children}
    </div>
  );
}

function HomePanel({ onNavigate }) {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <div className={styles.homePanel}>
      <div className={styles.homeIntro}>
        <div className={styles.homeGreeting}>{greeting}</div>
        <h1>You&apos;re safe here.</h1>
        <p>Take a breath. Everything in this space is private.</p>
      </div>

      <button type="button" className={styles.homeSosCard} onClick={() => onNavigate('sos')}>
        <span className={styles.homeSosIcon} aria-hidden="true">
          <Siren />
        </span>
        <span className={styles.homeSosCopy}>
          <strong>Send an SOS</strong>
          <span>Alert your trusted contacts in one tap</span>
        </span>
        <ChevronRight className={styles.homeChevron} aria-hidden="true" />
      </button>

      <div className={styles.setupCard}>
        <div className={styles.setupHeader}>
          <Shield className={styles.smallIcon} aria-hidden="true" />
          <span>Your safety setup</span>
        </div>
        <div className={styles.miniGrid}>
          <Mini label="Contacts" value="2" />
          <Mini label="Location" value="Off" />
          <Mini label="Backup" value="0" />
        </div>
      </div>

      <div>
        <div className={styles.actionHeading}>Quick actions</div>
        <div className={styles.actionGrid}>
          <ActionCard
            icon={<MessageCircle />}
            title="Talk to an advocate"
            subtitle="Available now"
            onClick={() => onNavigate('chat')}
          />
          <ActionCard
            icon={<BookLock />}
            title="Add to journal"
            subtitle="Save evidence"
            onClick={() => onNavigate('journal')}
          />
          <ActionCard
            icon={<LifeBuoy />}
            title="Find help nearby"
            subtitle="Shelters and aid"
            onClick={() => onNavigate('aid')}
          />
          <ActionCard
            icon={<Heart />}
            title="A moment for you"
            subtitle="Quotes and breathing"
          />
        </div>
      </div>

      <p className={styles.homeFooter}>You are not alone. Help is one tap away.</p>
    </div>
  );
}

function Mini({ label, value }) {
  return (
    <div className={styles.miniCard}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function ActionCard({ icon, title, subtitle, onClick }) {
  return (
    <button type="button" className={styles.actionCard} onClick={onClick}>
      <span className={styles.actionIcon} aria-hidden="true">{icon}</span>
      <strong>{title}</strong>
      <span>{subtitle}</span>
    </button>
  );
}

function SosPanel() {
  const [status, setStatus] = useState('ready');
  const [locationOn, setLocationOn] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => () => window.clearTimeout(timerRef.current), []);

  const handleSend = () => {
    if (status !== 'ready') return;

    setStatus('sending');
    window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => setStatus('sent'), 1200);
  };

  const heroLabel = status === 'sent'
    ? 'Alert Sent'
    : status === 'sending'
      ? 'Sending alert...'
      : status === 'error'
        ? 'Unable to send. Try again.'
        : 'Ready to alert your contacts';

  return (
    <div className={styles.sosPanel}>
      <div className={styles.heroCard}>
        <div className={styles.heroKicker}>
          <Shield className={styles.smallIcon} aria-hidden="true" />
          <span>Emergency Alert</span>
        </div>
        <h1 className={styles.heroTitle}>{heroLabel}</h1>
        <p className={styles.heroText}>
          {locationOn
            ? 'One tap alerts your trusted contacts and shares your live location.'
            : 'One tap alerts your trusted contacts. Location is not shared.'}
        </p>
      </div>

      <button
        type="button"
        className={`${styles.sosButton} ${status === 'sent' ? styles.sosButtonSent : ''}`}
        disabled={status !== 'ready'}
        onClick={handleSend}
      >
        {status === 'sent' && <Check className={styles.buttonIcon} aria-hidden="true" />}
        <span>
          {status === 'sent'
            ? 'SOS Sent'
            : status === 'sending'
              ? 'Sending...'
              : 'Send SOS'}
        </span>
      </button>

      <div className={styles.statusGrid}>
        <StatusCard
          icon={<Users className={styles.smallIcon} aria-hidden="true" />}
          label="Trusted Contacts"
          value="2 contacts"
        />
        <LocationCard on={locationOn} onToggle={setLocationOn} />
        <StatusCard
          icon={<Cloud className={styles.smallIcon} aria-hidden="true" />}
          label="Evidence Backup"
          value="Not started"
        />
        <StatusCard
          icon={<Clock className={styles.smallIcon} aria-hidden="true" />}
          label="Last Safety Check"
          value={status === 'sent' ? 'Just now' : 'Never'}
        />
      </div>

      {locationOn && <LocationPreview sent={status === 'sent'} />}

      <div className={styles.notice}>
        <AlertTriangle className={styles.noticeIcon} aria-hidden="true" />
        <span>Alerts are sent without the app name. Your contacts will not see SafeHaven anywhere in the message.</span>
      </div>
    </div>
  );
}

function StatusCard({ icon, label, value }) {
  return (
    <div className={styles.statusCard}>
      <div className={styles.statusLabel}>
        {icon}
        <span>{label}</span>
      </div>
      <div className={styles.statusValue}>{value}</div>
    </div>
  );
}

function LocationCard({ on, onToggle }) {
  return (
    <div className={`${styles.statusCard} ${on ? styles.statusCardActive : ''}`}>
      <div className={styles.locationHeader}>
        <div className={styles.statusLabel}>
          <MapPin className={styles.smallIcon} aria-hidden="true" />
          <span>Location Sharing</span>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={on}
          aria-label="Toggle location sharing"
          className={`${styles.switch} ${on ? styles.switchOn : ''}`}
          onClick={() => onToggle(!on)}
        >
          <span aria-hidden="true" />
        </button>
      </div>
      <div className={styles.statusValue}>{on ? 'On' : 'Off'}</div>
      <div className={styles.statusHint}>
        {on ? 'Contacts can see you' : 'Contacts cannot see you'}
      </div>
    </div>
  );
}

function LocationPreview({ sent }) {
  const contacts = [
    { name: 'Mom', initials: 'MR' },
    { name: 'Sarah', initials: 'SK' },
  ];

  return (
    <div className={styles.locationPreview}>
      <div className={styles.mapPreview}>
        <div className={styles.mapPattern} aria-hidden="true" />
        <div className={styles.mapRoadHorizontal} aria-hidden="true" />
        <div className={styles.mapRoadOne} aria-hidden="true" />
        <div className={styles.mapRoadTwo} aria-hidden="true" />
        <div className={styles.userPin}>
          <span className={styles.pinPulse} aria-hidden="true" />
          <span className={styles.pinDot} aria-hidden="true" />
          <span className={styles.pinLabel}>You</span>
        </div>
      </div>

      <div className={styles.locationBody}>
        <div className={styles.locationMeta}>
          <MapPin className={styles.tinyIcon} aria-hidden="true" />
          <span>Current location</span>
          <span className={styles.liveBadge}>
            <span aria-hidden="true" />
            Live
          </span>
        </div>
        <div className={styles.locationAddress}>412 Elm Street, Apt 3B</div>
        <div className={styles.locationDetail}>Riverside, CA - accurate to about 12 m</div>

        <div className={styles.contactRow}>
          <div className={styles.avatarStack} aria-hidden="true">
            {contacts.map((contact) => (
              <span key={contact.name}>{contact.initials}</span>
            ))}
          </div>
          <div className={styles.contactCopy}>
            {sent
              ? 'Mom and Sarah are tracking you now.'
              : 'Mom and Sarah will see this if you tap SOS.'}
          </div>
        </div>
      </div>
    </div>
  );
}

const PEERS = [
  {
    id: 'bot',
    handle: 'SafeBot',
    emoji: 'SB',
    status: 'online',
    lastMsg: 'I am here anytime. Try "I feel anxious".',
    time: 'now',
    isBot: true,
  },
  {
    id: 'p1',
    handle: 'QuietRiver',
    emoji: 'QR',
    status: 'online',
    lastMsg: 'I hear you. Take your time.',
    time: '2m',
    unread: 2,
  },
  {
    id: 'p2',
    handle: 'MorningLark',
    emoji: 'ML',
    status: 'online',
    lastMsg: 'You are not alone in this.',
    time: '14m',
  },
  {
    id: 'p3',
    handle: 'PaperKite',
    emoji: 'PK',
    status: 'away',
    lastMsg: 'I went through something similar last year.',
    time: '1h',
  },
  {
    id: 'p4',
    handle: 'SilverPine',
    emoji: 'SP',
    status: 'away',
    lastMsg: 'Sending strength your way.',
    time: '3h',
  },
];

const SEED_THREADS = {
  bot: [
    {
      id: 'b1',
      from: 'them',
      text: 'Hi, I am SafeBot. I can help with grounding exercises, safety planning, or just listen. What is on your mind?',
      time: 'now',
    },
  ],
  p1: [
    {
      id: '1',
      from: 'them',
      text: 'Hey, glad you reached out. You are safe here. We are both anonymous.',
      time: '9:40 PM',
    },
    {
      id: '2',
      from: 'me',
      text: 'Thanks. I am not sure where to start.',
      time: '9:41 PM',
    },
    {
      id: '3',
      from: 'them',
      text: 'I hear you. Take your time.',
      time: '9:41 PM',
    },
  ],
  p2: [{ id: '1', from: 'them', text: 'You are not alone in this.', time: '8:12 PM' }],
  p3: [{ id: '1', from: 'them', text: 'I went through something similar last year. Happy to share if it helps.', time: 'Yesterday' }],
  p4: [{ id: '1', from: 'them', text: 'Sending strength your way.', time: 'Yesterday' }],
};

const BOT_REPLIES = [
  'That sounds really hard. I am glad you are telling me.',
  'Let us try a quick grounding exercise. Name 5 things you can see right now.',
  'You are doing the right thing by reaching out. Want me to suggest a peer to talk to?',
  'Take a slow breath in for 4, hold for 4, and out for 6. I am right here.',
];

function ChatPanel({ displayName }) {
  const [openId, setOpenId] = useState(null);
  const [threads, setThreads] = useState(SEED_THREADS);
  const [draft, setDraft] = useState('');
  const replyTimer = useRef(null);

  useEffect(() => () => window.clearTimeout(replyTimer.current), []);

  const openPeer = openId ? PEERS.find((peer) => peer.id === openId) : null;
  const messages = openId ? threads[openId] || [] : [];

  const send = () => {
    if (!openId || !draft.trim()) return;

    const text = draft.trim();
    setThreads((current) => ({
      ...current,
      [openId]: [
        ...(current[openId] || []),
        { id: String(Date.now()), from: 'me', text, time: 'now' },
      ],
    }));
    setDraft('');

    window.clearTimeout(replyTimer.current);
    replyTimer.current = window.setTimeout(() => {
      const replyText = openPeer?.isBot
        ? BOT_REPLIES[Math.floor(Math.random() * BOT_REPLIES.length)]
        : 'Thanks for sharing that with me. I am listening.';

      setThreads((current) => ({
        ...current,
        [openId]: [
          ...(current[openId] || []),
          { id: String(Date.now() + 1), from: 'them', text: replyText, time: 'now' },
        ],
      }));
    }, 900);
  };

  if (!openPeer) {
    return <ChatList peers={PEERS} onOpen={setOpenId} displayName={displayName} />;
  }

  return (
    <div className={styles.chatPanel}>
      <div className={styles.threadHeader}>
        <button type="button" className={styles.backButton} onClick={() => setOpenId(null)} aria-label="Back to chats">
          <ChevronLeft className={styles.threadBackIcon} aria-hidden="true" />
        </button>
        <Avatar peer={openPeer} />
        <div className={styles.threadTitle}>
          <div>
            <strong>{openPeer.handle}</strong>
            {openPeer.isBot && <Bot className={styles.botIcon} aria-hidden="true" />}
          </div>
          <span>
            <Circle className={openPeer.status === 'online' ? styles.onlineDot : styles.awayDot} aria-hidden="true" />
            {openPeer.status === 'online' ? 'Online' : 'Away'} - Anonymous
          </span>
        </div>
      </div>

      <div className={styles.chatNotice}>
        <Lock className={styles.noticeIcon} aria-hidden="true" />
        <span>Both of you are anonymous. Nothing is stored on your device.</span>
      </div>

      <div className={styles.messages} aria-live="polite">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`${styles.messageRow} ${message.from === 'me' ? styles.messageMine : ''}`}
          >
            <div
              className={`${styles.messageBubble} ${
                message.from === 'me' ? styles.messageBubbleMine : styles.messageBubbleThem
              }`}
            >
              {message.text}
            </div>
            <span className={styles.messageTime}>{message.time}</span>
          </div>
        ))}
      </div>

      <div className={styles.composerWrap}>
        <div className={styles.composer}>
          <input
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') send();
            }}
            placeholder={openPeer.isBot ? 'Ask SafeBot anything...' : `Message ${openPeer.handle}...`}
            className={styles.messageInput}
            aria-label="Type a message"
          />
          <button
            type="button"
            className={styles.sendButton}
            onClick={send}
            disabled={!draft.trim()}
            aria-label="Send message"
          >
            <Send className={styles.sendIcon} aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
}

function ChatList({ peers, onOpen, displayName }) {
  const [query, setQuery] = useState('');
  const filtered = peers.filter((peer) => peer.handle.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className={styles.chatListPanel}>
      <div className={styles.chatNotice}>
        <Lock className={styles.noticeIcon} aria-hidden="true" />
        <span>
          Everyone here is anonymous. Your handle is randomized each session.
          {displayName ? ` Signed in as ${displayName}.` : ''}
        </span>
      </div>

      <label className={styles.searchField}>
        <Search className={styles.smallIcon} aria-hidden="true" />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search people"
          aria-label="Search people"
        />
      </label>

      <div className={styles.peerSectionLabel}>Always available</div>
      {filtered.filter((peer) => peer.isBot).map((peer) => (
        <PeerRow key={peer.id} peer={peer} onOpen={onOpen} />
      ))}

      <div className={styles.peerSectionLabel}>People online</div>
      {filtered.filter((peer) => !peer.isBot).map((peer) => (
        <PeerRow key={peer.id} peer={peer} onOpen={onOpen} />
      ))}
    </div>
  );
}

function PeerRow({ peer, onOpen }) {
  return (
    <button type="button" className={styles.peerRow} onClick={() => onOpen(peer.id)}>
      <Avatar peer={peer} />
      <span className={styles.peerCopy}>
        <span className={styles.peerNameLine}>
          <strong>{peer.handle}</strong>
          {peer.isBot && <Bot className={styles.botIcon} aria-hidden="true" />}
          <span>{peer.time}</span>
        </span>
        <span>{peer.lastMsg}</span>
      </span>
      {peer.unread ? <span className={styles.unreadBadge}>{peer.unread}</span> : null}
    </button>
  );
}

function Avatar({ peer }) {
  return (
    <span className={styles.avatar}>
      <span className={peer.isBot ? styles.botAvatar : ''}>{peer.emoji}</span>
      <span className={peer.status === 'online' ? styles.avatarOnline : styles.avatarAway} />
    </span>
  );
}

const JOURNAL_ENTRIES = [
  {
    id: '1',
    type: 'Photo',
    Icon: Camera,
    when: 'May 9, 2026 - 3:42 PM',
    note: 'Bruise on left arm. After argument in kitchen.',
  },
  {
    id: '2',
    type: 'Audio',
    Icon: Mic,
    when: 'May 7, 2026 - 11:08 PM',
    note: 'Recorded shouting. About 4 minutes.',
  },
  {
    id: '3',
    type: 'Photo',
    Icon: Camera,
    when: 'May 4, 2026 - 8:15 AM',
    note: 'Broken picture frame in hallway.',
  },
];

function JournalPanel() {
  return (
    <div className={styles.journalPanel}>
      <div className={styles.chatNotice}>
        <Lock className={styles.noticeIcon} aria-hidden="true" />
        <span>Entries are uploaded to encrypted backup. Nothing is saved on this device.</span>
      </div>

      <div className={styles.uploadGrid}>
        <UploadButton icon={<Camera className={styles.uploadIcon} aria-hidden="true" />} label="Photo" />
        <UploadButton icon={<Mic className={styles.uploadIcon} aria-hidden="true" />} label="Audio" />
        <UploadButton icon={<Video className={styles.uploadIcon} aria-hidden="true" />} label="Video" />
      </div>

      <div className={styles.sectionHeader}>
        <span>Recent entries</span>
        <span>{JOURNAL_ENTRIES.length} saved</span>
      </div>

      <div className={styles.entryList}>
        {JOURNAL_ENTRIES.map(({ id, type, Icon, when, note }) => (
          <article key={id} className={styles.entryCard}>
            <div className={styles.entryThumb} aria-hidden="true">
              <FileImage className={styles.entryThumbIcon} />
            </div>
            <div className={styles.entryContent}>
              <div className={styles.entryMeta}>
                <Icon className={styles.tinyIcon} aria-hidden="true" />
                <span>{type}</span>
                <span>-</span>
                <span>{when}</span>
              </div>
              <p>{note}</p>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

function UploadButton({ icon, label }) {
  return (
    <button type="button" className={styles.uploadButton} aria-label={`Add ${label.toLowerCase()} evidence`}>
      <span className={styles.uploadIconCircle}>{icon}</span>
      <span>{label}</span>
    </button>
  );
}

const FILTERS = [
  { key: 'shelter', label: 'Shelters' },
  { key: 'legal', label: 'Legal Aid' },
  { key: 'financial', label: 'Financial' },
  { key: 'counseling', label: 'Counseling' },
];

const RESOURCES = {
  shelter: [
    { name: "Safe Harbor Women's Shelter", meta: '0.8 mi - Open 24 hours' },
    { name: 'Hope House Emergency Refuge', meta: '1.4 mi - Open until 9 PM' },
    { name: 'Riverside Family Center', meta: '2.6 mi - Open 24 hours' },
  ],
  legal: [
    { name: 'Community Legal Aid Society', meta: '1.1 mi - Open until 5 PM' },
    { name: 'Domestic Violence Legal Clinic', meta: '3.0 mi - By appointment' },
  ],
  financial: [
    { name: 'Emergency Assistance Fund', meta: '0.5 mi - Open until 6 PM' },
  ],
  counseling: [
    { name: 'Trauma Recovery Counseling', meta: '1.8 mi - Open until 8 PM' },
    { name: 'Peer Support Group - North', meta: '2.2 mi - Wed 7 PM' },
  ],
};

function AidPanel() {
  const [activeFilter, setActiveFilter] = useState('shelter');

  return (
    <div className={styles.aidPanel}>
      <div className={styles.chatNotice}>
        <Lock className={styles.noticeIcon} aria-hidden="true" />
        <span>Search results are not stored or shared.</span>
      </div>

      <div className={styles.resourceMap}>
        <div className={styles.mapPattern} aria-hidden="true" />
        <MapPin className={`${styles.resourcePin} ${styles.resourcePinOne}`} aria-hidden="true" />
        <MapPin className={`${styles.resourcePin} ${styles.resourcePinTwo}`} aria-hidden="true" />
        <MapPin className={`${styles.resourcePin} ${styles.resourcePinThree}`} aria-hidden="true" />
        <div className={styles.mapCaption}>Illustrative map - tap a resource for directions</div>
      </div>

      <div className={styles.filterScroller} aria-label="Resource filters">
        {FILTERS.map((filter) => {
          const active = activeFilter === filter.key;

          return (
            <button
              key={filter.key}
              type="button"
              className={`${styles.filterButton} ${active ? styles.filterButtonActive : ''}`}
              aria-pressed={active}
              onClick={() => setActiveFilter(filter.key)}
            >
              {filter.label}
            </button>
          );
        })}
      </div>

      <div className={styles.resourceList}>
        {RESOURCES[activeFilter].map((resource) => (
          <article key={resource.name} className={styles.resourceCard}>
            <h2>{resource.name}</h2>
            <p>{resource.meta}</p>
            <div className={styles.resourceActions}>
              <button type="button">
                <Phone className={styles.tinyIcon} aria-hidden="true" />
                Call
              </button>
              <button type="button">
                <Map className={styles.tinyIcon} aria-hidden="true" />
                Directions
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

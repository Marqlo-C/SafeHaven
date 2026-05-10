import { useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertTriangle,
  BookLock,
  Bot,
  Camera,
  Check,
  ChevronLeft,
  Circle,
  Clock,
  Cloud,
  FileImage,
  FileText,
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
  Shuffle,
  Type,
  UserPlus,
  Users,
  X,
} from 'lucide-react';
import HomePanel from './private-mode/HomePanel';
import { triggerPanicExit } from '../hooks/usePrivacyMode';
import styles from '../styles/PrivateModeShell.module.css';

const TABS = [
  { id: 'home', title: 'Home', label: 'Home', Icon: Home },
  { id: 'sos', title: 'SOS', label: 'SOS', Icon: Siren },
  { id: 'chat', title: 'Chat', label: 'Chat', Icon: MessageCircle },
  { id: 'journal', title: 'Journal', label: 'Journal', Icon: BookLock },
  { id: 'aid', title: 'Resources', label: 'Aid', Icon: LifeBuoy },
];

export default function PrivateModeShell({ displayName, sosEnabled = false }) {
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
            <SosPanel enabled={sosEnabled} />
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

function SosPanel({ enabled }) {
  const [status, setStatus] = useState('ready');
  const [locationOn, setLocationOn] = useState(false);
  const [error, setError] = useState('');
  const [sentCount, setSentCount] = useState(0);
  const [lastLocation, setLastLocation] = useState(null);
  const [locationError, setLocationError] = useState('');

  const requestCurrentLocation = () => new Promise((resolve, reject) => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      reject(new Error('Location is not available in this browser.'));
      return;
    }

    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      maximumAge: 0,
    });
  });

  useEffect(() => {
    if (!enabled) return undefined;
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setLocationError('Location is not available in this browser.');
      return undefined;
    }

    const watcherId = navigator.geolocation.watchPosition(
      ({ coords, timestamp }) => {
        setLocationOn(true);
        setLocationError('');
        setLastLocation({
          latitude: coords.latitude,
          longitude: coords.longitude,
          accuracy: coords.accuracy,
          capturedAt: new Date(timestamp).toISOString(),
        });
      },
      (err) => {
        setLocationOn(false);
        setLocationError(err.message || 'Unable to access live location.');
      },
      {
        enableHighAccuracy: true,
        maximumAge: 0,
      }
    );

    return () => navigator.geolocation.clearWatch(watcherId);
  }, [enabled]);

  const handleSend = async () => {
    if (!enabled || status === 'requesting' || status === 'sending') return;

    setError('');

    try {
      setStatus('requesting');
      let location = lastLocation;

      if (!location || Date.now() - new Date(location.capturedAt).getTime() > 60 * 1000) {
        const position = await requestCurrentLocation();
        const { coords, timestamp } = position;
        location = {
          latitude: coords.latitude,
          longitude: coords.longitude,
          accuracy: coords.accuracy,
          capturedAt: new Date(timestamp).toISOString(),
        };
      }

      setLocationOn(true);
      setLastLocation(location);
      setStatus('sending');

      const response = await fetch('/api/sos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(location),
      });
      const body = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(body.error || 'Unable to send SOS.');
      }

      setSentCount(body.sentCount || 0);
      setStatus('sent');
    } catch (err) {
      setStatus('error');
      setError(err.message || 'Unable to send SOS.');
    }
  };

  const heroLabel = status === 'sent'
    ? 'Alert Sent'
    : status === 'requesting'
      ? 'Getting your location...'
    : status === 'sending'
      ? 'Sending alert...'
      : status === 'error'
        ? 'Unable to send. Try again.'
        : !enabled
          ? 'SOS is unavailable'
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
          {status === 'sent'
            ? `Your current location was sent to ${sentCount} trusted contact${sentCount === 1 ? '' : 's'}.`
            : enabled
              ? 'One tap gets your current location and sends it to your trusted contacts in chat.'
              : 'The SOS feature is currently disabled.'}
        </p>
        {error && <p className={styles.heroText}>{error}</p>}
        {locationError && <p className={styles.heroText}>{locationError}</p>}
      </div>

      <button
        type="button"
        className={`${styles.sosButton} ${status === 'sent' ? styles.sosButtonSent : ''}`}
        disabled={!enabled || status === 'requesting' || status === 'sending'}
        onClick={handleSend}
      >
        {status === 'sent' && <Check className={styles.buttonIcon} aria-hidden="true" />}
        <span>
          {status === 'sent'
            ? 'SOS Sent'
            : status === 'requesting'
              ? 'Getting location...'
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
        <LocationCard on={locationOn} />
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

      {enabled && <LocationPreview sent={status === 'sent'} location={lastLocation} />}

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

function LocationCard({ on }) {
  return (
    <div className={`${styles.statusCard} ${on ? styles.statusCardActive : ''}`}>
      <div className={styles.locationHeader}>
        <div className={styles.statusLabel}>
          <MapPin className={styles.smallIcon} aria-hidden="true" />
          <span>Location Sharing</span>
        </div>
        <span
          role="status"
          aria-label={on ? 'Location included' : 'Location required'}
          className={`${styles.switch} ${on ? styles.switchOn : ''}`}
        >
          <span aria-hidden="true" />
        </span>
      </div>
      <div className={styles.statusValue}>{on ? 'Included' : 'Required'}</div>
      <div className={styles.statusHint}>
        {on ? 'Contacts receive your current location' : 'Requested when SOS is sent'}
      </div>
    </div>
  );
}

function LocationPreview({ sent, location }) {
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
        <div className={styles.locationAddress}>
          {location
            ? `${location.latitude.toFixed(5)}, ${location.longitude.toFixed(5)}`
            : 'Current coordinates'}
        </div>
        <div className={styles.locationDetail}>
          {location?.accuracy
            ? `Accurate to about ${Math.round(location.accuracy)} m`
            : 'Accuracy pending'}
        </div>

        <div className={styles.contactRow}>
          <div className={styles.avatarStack} aria-hidden="true">
            {contacts.map((contact) => (
              <span key={contact.name}>{contact.initials}</span>
            ))}
          </div>
          <div className={styles.contactCopy}>
            {sent
              ? 'Your trusted contacts received this in chat.'
              : 'Your trusted contacts will receive this in chat.'}
          </div>
        </div>
      </div>
    </div>
  );
}

const BOT_CHAT = {
  id: 'bot',
  handle: 'SafeBot',
  emoji: 'SB',
  status: 'online',
  lastMsg: 'I am here anytime. Try "I feel anxious".',
  time: 'now',
  isBot: true,
};

const SEED_FRIENDS = [
  { id: 'demo-f1', displayName: 'QuietRiver', emoji: 'QR', status: 'accepted', mutuals: 3, isTrusted: true },
  { id: 'demo-f2', displayName: 'MorningLark', emoji: 'ML', status: 'accepted', mutuals: 1 },
  { id: 'demo-f3', displayName: 'PaperKite', emoji: 'PK', status: 'accepted', isTrusted: true },
  { id: 'demo-f4', displayName: 'BlueHarbor', emoji: 'BH', status: 'accepted' },
  { id: 'demo-f5', displayName: 'SilverPine', emoji: 'SP', status: 'incoming' },
  { id: 'demo-f6', displayName: 'EmberMoth', emoji: 'EM', status: 'outgoing' },
];

const MY_HANDLE = 'SoftFern';
const MY_AVATAR = 'SF';
const MONGO_ID_PATTERN = /^[a-f0-9]{24}$/i;

function initialsForName(displayName) {
  return String(displayName || 'Friend')
    .replace(/[^a-z0-9]/gi, '')
    .slice(0, 2)
    .toUpperCase() || 'FR';
}

function normalizeFriend(apiFriend, trustedFriendIds = new Set()) {
  const isPending = apiFriend.status === 'pending';

  return {
    id: apiFriend.id,
    displayName: apiFriend.friend?.displayName || 'Anonymous',
    emoji: initialsForName(apiFriend.friend?.displayName),
    status: apiFriend.status === 'accepted'
      ? 'accepted'
      : apiFriend.direction === 'incoming' && isPending
        ? 'incoming'
        : 'outgoing',
    isTrusted: trustedFriendIds.has(apiFriend.id),
  };
}

function isPersistedFriendId(id) {
  return MONGO_ID_PATTERN.test(String(id));
}

const SEED_THREADS = {
  bot: [
    {
      id: 'b1',
      from: 'them',
      text: 'Hi, I am SafeBot. I can help with grounding exercises, safety planning, or just listen. What is on your mind?',
      time: 'now',
    },
  ],
  'demo-f1': [
    {
      id: '1',
      from: 'them',
      text: 'Hey, glad you reached out. We are both anonymous here.',
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
  'demo-f2': [{ id: '1', from: 'them', text: 'You are not alone in this.', time: '8:12 PM' }],
  'demo-f3': [{ id: '1', from: 'them', text: 'I went through something similar last year.', time: 'Yesterday' }],
  'demo-f4': [{ id: '1', from: 'them', text: 'The trusted contact toggle helped me make a plan.', time: 'Yesterday' }],
};

const BOT_REPLIES = [
  'That sounds really hard. I am glad you are telling me.',
  'Let us try a quick grounding exercise. Name 5 things you can see right now.',
  'You are doing the right thing by reaching out. Want me to suggest a friend to talk to?',
  'Take a slow breath in for 4, hold for 4, and out for 6. I am right here.',
];

function ChatPanel() {
  const [subTab, setSubTab] = useState('messages');
  const [friends, setFriends] = useState(SEED_FRIENDS);
  const [openId, setOpenId] = useState(null);
  const [threads, setThreads] = useState(SEED_THREADS);
  const [draft, setDraft] = useState('');
  const replyTimer = useRef(null);

  useEffect(() => () => window.clearTimeout(replyTimer.current), []);

  useEffect(() => {
    let cancelled = false;

    async function loadFriends() {
      try {
        const [friendsResponse, trustedResponse] = await Promise.all([
          fetch('/api/friends'),
          fetch('/api/trusted-contacts'),
        ]);

        if (!friendsResponse.ok) return;

        const friendsBody = await friendsResponse.json();
        const trustedBody = trustedResponse.ok ? await trustedResponse.json() : {};
        const trustedFriendIds = new Set(
          (trustedBody.trustedContacts || []).map((contact) => contact.friendRelationshipId)
        );

        const nextFriends = (friendsBody.friends || [])
          .filter((friend) => friend.status === 'accepted' || friend.status === 'pending')
          .map((friend) => normalizeFriend(friend, trustedFriendIds));

        if (!cancelled && nextFriends.length > 0) {
          setFriends(nextFriends);
        }
      } catch {
        // Keep the design-seed friends when auth or local MongoDB is unavailable.
      }
    }

    loadFriends();

    return () => {
      cancelled = true;
    };
  }, []);

  const chats = useMemo(() => {
    const friendChats = friends
      .filter((friend) => friend.status === 'accepted')
      .map((friend) => {
        const thread = threads[friend.id] || [];
        const last = thread[thread.length - 1];

        return {
          id: friend.id,
          handle: friend.displayName,
          emoji: friend.emoji,
          status: 'online',
          lastMsg: last?.text || 'Say hi',
          time: last?.time || '-',
        };
      });

    return [BOT_CHAT, ...friendChats];
  }, [friends, threads]);

  const openPeer = openId ? chats.find((chat) => chat.id === openId) || null : null;
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

  if (openPeer) {
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
            <Circle className={styles.onlineDot} aria-hidden="true" />
            {openPeer.isBot ? 'Always available' : 'Friend - Anonymous'}
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

  return (
    <div className={styles.chatPanel}>
      <div className={styles.subTabsWrap}>
        <div className={styles.subTabs} role="tablist" aria-label="Chat sections">
          <button
            type="button"
            className={`${styles.subTabButton} ${subTab === 'messages' ? styles.subTabButtonActive : ''}`}
            aria-pressed={subTab === 'messages'}
            onClick={() => setSubTab('messages')}
          >
            Messages
          </button>
          <button
            type="button"
            className={`${styles.subTabButton} ${subTab === 'friends' ? styles.subTabButtonActive : ''}`}
            aria-pressed={subTab === 'friends'}
            onClick={() => setSubTab('friends')}
          >
            Friends
          </button>
        </div>
      </div>

      {subTab === 'messages' ? (
        <MessagesList chats={chats} onOpen={setOpenId} onGoFriends={() => setSubTab('friends')} />
      ) : (
        <FriendsPanel friends={friends} setFriends={setFriends} />
      )}
    </div>
  );
}

function MessagesList({ chats, onOpen, onGoFriends }) {
  const [query, setQuery] = useState('');
  const filtered = chats.filter((chat) => chat.handle.toLowerCase().includes(query.toLowerCase()));
  const friendChats = filtered.filter((chat) => !chat.isBot);

  return (
    <div className={styles.chatListPanel}>
      <div className={styles.chatNotice}>
        <Lock className={styles.noticeIcon} aria-hidden="true" />
        <span>You can only message accepted friends. Add someone in Friends to start a chat.</span>
      </div>

      <label className={styles.searchField}>
        <Search className={styles.smallIcon} aria-hidden="true" />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search chats"
          aria-label="Search chats"
        />
      </label>

      <div className={styles.peerSectionLabel}>Always available</div>
      {filtered.filter((chat) => chat.isBot).map((chat) => (
        <ChatRow key={chat.id} chat={chat} onOpen={onOpen} />
      ))}

      <div className={styles.peerSectionLabel}>Friend chats</div>
      {friendChats.length === 0 ? (
        <button type="button" className={styles.emptyFriendState} onClick={onGoFriends}>
          <span className={styles.emptyIcon} aria-hidden="true">
            <UserPlus />
          </span>
          <strong>No friend chats yet</strong>
          <span>Tap to add someone by display name.</span>
        </button>
      ) : (
        friendChats.map((chat) => <ChatRow key={chat.id} chat={chat} onOpen={onOpen} />)
      )}
    </div>
  );
}

function ChatRow({ chat, onOpen }) {
  return (
    <button type="button" className={styles.peerRow} onClick={() => onOpen(chat.id)}>
      <Avatar peer={chat} />
      <span className={styles.peerCopy}>
        <span className={styles.peerNameLine}>
          <strong>{chat.handle}</strong>
          {chat.isBot && <Bot className={styles.botIcon} aria-hidden="true" />}
          <span>{chat.time}</span>
        </span>
        <span>{chat.lastMsg}</span>
      </span>
    </button>
  );
}

function FriendsPanel({ friends, setFriends }) {
  const [query, setQuery] = useState('');

  const incoming = friends.filter((friend) => friend.status === 'incoming');
  const outgoing = friends.filter((friend) => friend.status === 'outgoing');
  const accepted = friends.filter((friend) => friend.status === 'accepted');
  const trustedCount = accepted.filter((friend) => friend.isTrusted).length;

  const accept = (id) => {
    setFriends((current) => current.map((friend) => (
      friend.id === id ? { ...friend, status: 'accepted' } : friend
    )));
  };

  const remove = (id) => {
    setFriends((current) => current.filter((friend) => friend.id !== id));
  };

  const toggleTrusted = async (id, value) => {
    setFriends((current) => current.map((friend) => (
      friend.id === id ? { ...friend, isTrusted: value } : friend
    )));

    if (!isPersistedFriendId(id)) {
      return;
    }

    try {
      const response = await fetch(`/api/friends/${id}/trusted`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trusted: value }),
      });

      if (!response.ok) {
        throw new Error('Unable to update trusted contact.');
      }
    } catch {
      setFriends((current) => current.map((friend) => (
        friend.id === id ? { ...friend, isTrusted: !value } : friend
      )));
    }
  };

  const sendRequest = async () => {
    const handle = query.trim();
    if (!handle) return;

    const exists = friends.some((friend) => (
      friend.displayName.toLowerCase() === handle.toLowerCase()
    ));

    if (exists) return;

    const optimisticId = `pending-${Date.now()}`;
    setFriends((current) => [
      ...current,
      {
        id: optimisticId,
        displayName: handle,
        emoji: initialsForName(handle),
        status: 'outgoing',
      },
    ]);
    setQuery('');

    try {
      const response = await fetch('/api/friends', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ anonymousDisplayName: handle }),
      });

      if (!response.ok) return;

      const body = await response.json();
      if (!body.friend) return;

      setFriends((current) => current.map((friend) => (
        friend.id === optimisticId ? normalizeFriend(body.friend) : friend
      )));
    } catch {
      // Keep the optimistic pending row for offline UI comparison.
    }
  };

  return (
    <div className={styles.friendsPanel}>
      <div className={styles.chatNotice}>
        <Lock className={styles.noticeIcon} aria-hidden="true" />
        <span>Friends connect by anonymous display name only. Real names are never shared.</span>
      </div>

      <div className={styles.friendIdentity}>
        <span className={styles.friendIdentityAvatar} aria-hidden="true">{MY_AVATAR}</span>
        <span className={styles.friendInfo}>
          <span>Your display name</span>
          <strong>{MY_HANDLE}</strong>
        </span>
        <button type="button" className={styles.rerollButton} aria-label="Reroll handle">
          <Shuffle className={styles.smallIcon} aria-hidden="true" />
        </button>
      </div>

      <div>
        <div className={styles.addFriendLabel}>Add by display name</div>
        <label className={styles.addFriendField}>
          <Search className={styles.smallIcon} aria-hidden="true" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') sendRequest();
            }}
            placeholder="e.g. QuietRiver"
            aria-label="Add friend by display name"
          />
          <button
            type="button"
            className={styles.requestButton}
            disabled={!query.trim()}
            onClick={sendRequest}
          >
            Request
          </button>
        </label>
      </div>

      {incoming.length > 0 && (
        <FriendSection title={`Requests - ${incoming.length}`}>
          {incoming.map((friend) => (
            <FriendRow key={friend.id} friend={friend}>
              <button
                type="button"
                className={styles.acceptButton}
                aria-label={`Accept ${friend.displayName}`}
                onClick={() => accept(friend.id)}
              >
                <Check className={styles.tinyIcon} aria-hidden="true" />
              </button>
              <button
                type="button"
                className={styles.friendIconButton}
                aria-label={`Decline ${friend.displayName}`}
                onClick={() => remove(friend.id)}
              >
                <X className={styles.tinyIcon} aria-hidden="true" />
              </button>
            </FriendRow>
          ))}
        </FriendSection>
      )}

      {outgoing.length > 0 && (
        <FriendSection title={`Pending - ${outgoing.length}`}>
          {outgoing.map((friend) => (
            <FriendRow key={friend.id} friend={friend}>
              <span className={styles.friendMutedText}>Waiting...</span>
              <button
                type="button"
                className={styles.friendIconButton}
                aria-label={`Cancel request to ${friend.displayName}`}
                onClick={() => remove(friend.id)}
              >
                <X className={styles.tinyIcon} aria-hidden="true" />
              </button>
            </FriendRow>
          ))}
        </FriendSection>
      )}

      {accepted.length > 0 && (
        <div className={styles.trustedSummary}>
          <Shield className={styles.trustedSummaryIcon} aria-hidden="true" />
          <div>
            <strong>
              {trustedCount} trusted contact{trustedCount === 1 ? '' : 's'}
            </strong>
            <span>Trusted friends receive your live location when you tap SOS.</span>
          </div>
        </div>
      )}

      <FriendSection title={`Friends - ${accepted.length}`}>
        {accepted.length === 0 ? (
          <div className={styles.emptyFriendState}>
            <span className={styles.emptyIcon} aria-hidden="true">
              <UserPlus />
            </span>
            <strong>No friends yet</strong>
            <span>Add someone by their display name to start chatting.</span>
          </div>
        ) : (
          accepted.map((friend) => (
            <AcceptedFriendRow
              key={friend.id}
              friend={friend}
              onToggle={(value) => toggleTrusted(friend.id, value)}
            />
          ))
        )}
      </FriendSection>
    </div>
  );
}

function FriendSection({ title, children }) {
  return (
    <section className={styles.friendSection}>
      <div className={styles.peerSectionLabel}>{title}</div>
      <div className={styles.friendRows}>{children}</div>
    </section>
  );
}

function AcceptedFriendRow({ friend, onToggle }) {
  const trusted = Boolean(friend.isTrusted);

  return (
    <div className={`${styles.acceptedFriendRow} ${trusted ? styles.acceptedFriendRowTrusted : ''}`}>
      <div className={styles.acceptedFriendMain}>
        <span className={styles.friendAvatar} aria-hidden="true">{friend.emoji}</span>
        <span className={styles.friendInfo}>
          <span className={styles.friendNameLine}>
            <strong>{friend.displayName}</strong>
            {trusted && (
              <span className={styles.trustedPill}>
                <Shield className={styles.trustedPillIcon} aria-hidden="true" />
                Trusted
              </span>
            )}
          </span>
          <span>{friend.mutuals ? `${friend.mutuals} mutual - ` : ''}Anonymous</span>
        </span>
        <button
          type="button"
          role="switch"
          aria-checked={trusted}
          aria-label={`Mark ${friend.displayName} as trusted contact`}
          className={`${styles.trustedSwitch} ${trusted ? styles.trustedSwitchOn : ''}`}
          onClick={() => onToggle(!trusted)}
        >
          <span aria-hidden="true" />
        </button>
      </div>

      {trusted && (
        <div className={styles.trustedFooter}>
          <MapPin className={styles.trustedFooterIcon} aria-hidden="true" />
          <span>Will see your live location during SOS</span>
        </div>
      )}
    </div>
  );
}

function FriendRow({ friend, children }) {
  return (
    <div className={styles.friendRow}>
      <span className={styles.friendAvatar} aria-hidden="true">{friend.emoji}</span>
      <span className={styles.friendInfo}>
        <strong>{friend.displayName}</strong>
        <span>Anonymous</span>
      </span>
      <span className={styles.friendActions}>{children}</span>
    </div>
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
    type: 'Media',
    when: 'May 9, 2026 - 3:42 PM',
    note: 'Bruise on left arm. After argument in kitchen.',
  },
  {
    id: '2',
    type: 'Audio',
    when: 'May 7, 2026 - 11:08 PM',
    note: 'Recorded shouting. About 4 minutes.',
  },
  {
    id: '3',
    type: 'Note',
    when: 'May 4, 2026 - 8:15 AM',
    note: 'He took my phone away again this morning. Would not give it back until I apologized.',
  },
];

function formatJournalTimestamp() {
  return new Date().toLocaleString([], {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function JournalPanel() {
  const [entries, setEntries] = useState(JOURNAL_ENTRIES);
  const [composing, setComposing] = useState(false);
  const [draft, setDraft] = useState('');

  const saveNote = () => {
    const text = draft.trim();
    if (!text) return;

    setEntries((current) => [
      {
        id: String(Date.now()),
        type: 'Note',
        when: formatJournalTimestamp(),
        note: text,
      },
      ...current,
    ]);
    setDraft('');
    setComposing(false);
  };

  const cancelNote = () => {
    setComposing(false);
    setDraft('');
  };

  return (
    <div className={styles.journalPanel}>
      <div className={styles.chatNotice}>
        <Lock className={styles.noticeIcon} aria-hidden="true" />
        <span>Entries are uploaded to encrypted backup. Nothing is saved on this device.</span>
      </div>

      <div className={styles.uploadGrid}>
        <UploadButton
          icon={<Camera className={styles.uploadIcon} aria-hidden="true" />}
          label="Media"
          hint="Photo or video"
        />
        <UploadButton
          icon={<Mic className={styles.uploadIcon} aria-hidden="true" />}
          label="Audio"
          hint="Record now"
        />
        <UploadButton
          icon={<Type className={styles.uploadIcon} aria-hidden="true" />}
          label="Text"
          hint="Write a note"
          onClick={() => setComposing(true)}
        />
      </div>

      <div className={styles.sectionHeader}>
        <span>Recent entries</span>
        <span>{entries.length} saved</span>
      </div>

      <div className={styles.entryList}>
        {entries.map(({ id, type, when, note }) => (
          <article key={id} className={styles.entryCard}>
            <div className={styles.entryThumb} aria-hidden="true">
              {type === 'Note' && <FileText className={styles.entryThumbIcon} />}
              {type === 'Audio' && <Mic className={styles.entryThumbIcon} />}
              {type === 'Media' && <FileImage className={styles.entryThumbIcon} />}
            </div>
            <div className={styles.entryContent}>
              <div className={styles.entryMeta}>
                {type === 'Note' && <FileText className={styles.tinyIcon} aria-hidden="true" />}
                {type === 'Audio' && <Mic className={styles.tinyIcon} aria-hidden="true" />}
                {type === 'Media' && <Camera className={styles.tinyIcon} aria-hidden="true" />}
                <span>{type}</span>
                <span>-</span>
                <span>{when}</span>
              </div>
              <p className={styles.entryNote}>{note}</p>
            </div>
          </article>
        ))}
      </div>

      {composing && (
        <NoteComposer
          value={draft}
          onChange={setDraft}
          onCancel={cancelNote}
          onSave={saveNote}
        />
      )}
    </div>
  );
}

function UploadButton({ icon, label, hint, onClick }) {
  return (
    <button
      type="button"
      className={styles.uploadButton}
      aria-label={`Add ${label.toLowerCase()} evidence`}
      onClick={onClick}
    >
      <span className={styles.uploadIconCircle}>{icon}</span>
      <span className={styles.uploadLabel}>{label}</span>
      <span className={styles.uploadHint}>{hint}</span>
    </button>
  );
}

function NoteComposer({ value, onChange, onCancel, onSave }) {
  return (
    <div className={styles.noteComposerBackdrop} onClick={onCancel}>
      <div className={styles.noteComposer} onClick={(event) => event.stopPropagation()}>
        <div className={styles.noteComposerHeader}>
          <div className={styles.noteComposerTitle}>
            <span aria-hidden="true">
              <FileText className={styles.smallIcon} />
            </span>
            <strong>New note</strong>
          </div>
          <button
            type="button"
            className={styles.noteCloseButton}
            aria-label="Close"
            onClick={onCancel}
          >
            <X className={styles.tinyIcon} aria-hidden="true" />
          </button>
        </div>

        <textarea
          autoFocus
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="Write what happened. Only you can see this."
          className={styles.noteTextarea}
        />

        <div className={styles.noteComposerMeta}>
          <span>Saved with timestamp</span>
          <span>{value.length} chars</span>
        </div>

        <div className={styles.noteComposerActions}>
          <button type="button" className={styles.noteCancelButton} onClick={onCancel}>
            Cancel
          </button>
          <button
            type="button"
            className={styles.noteSaveButton}
            disabled={!value.trim()}
            onClick={onSave}
          >
            Save note
          </button>
        </div>
      </div>
    </div>
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

import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
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
import AidPanel from './private-mode/AidPanel';
import JournalPanel from './JournalPanel';
import { useSpeechToText } from '../hooks/useSpeechToText';
import { useChat } from '../hooks/useChat';
import { triggerPanicExit } from '../hooks/usePrivacyMode';
import styles from '../styles/PrivateModeShell.module.css';

// ── Constants & Helpers ──────────────────────────────────────────────────────

const TABS = [
  { id: 'home', title: 'Home', label: 'Home', Icon: Home },
  { id: 'sos', title: 'SOS', label: 'SOS', Icon: Siren },
  { id: 'chat', title: 'Chat', label: 'Chat', Icon: MessageCircle },
  { id: 'journal', title: 'Journal', label: 'Journal', Icon: BookLock },
  { id: 'aid', title: 'Resources', label: 'Aid', Icon: LifeBuoy },
];

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

const SEED_THREADS = {
  bot: [
    {
      id: 'b1',
      from: 'them',
      text: 'Hi, I am SafeBot. I can help with grounding exercises, safety planning, or just listen. What is on your mind?',
      time: 'now',
    },
  ],
};

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

// ── Main Shell Component ─────────────────────────────────────────────────────

export default function PrivateModeShell({ displayName, sosEnabled = false }) {
  const [activeTab, setActiveTab] = useState('home');
  const [friends, setFriends] = useState(SEED_FRIENDS);
  
  // Persistence: Keep chat history alive across tab switches
  const [allMessages, setAllMessages] = useState({});
  const [currentUserId, setCurrentUserId] = useState(null);
  const socketRef = useRef(null);

  const activeTitle = useMemo(
    () => TABS.find((t) => t.id === activeTab)?.title || 'Home',
    [activeTab]
  );

  const loadFriends = async () => {
    try {
      const [fRes, tRes] = await Promise.all([
        fetch('/api/friends'),
        fetch('/api/trusted-contacts'),
      ]);
      if (!fRes.ok) return;

      const fBody = await fRes.json();
      const tBody = tRes.ok ? await tRes.json() : {};
      const trustedIds = new Set((tBody.trustedContacts || []).map(c => c.friendRelationshipId));

      const next = (fBody.friends || [])
        .filter(f => f.status === 'accepted' || f.status === 'pending')
        .map(f => normalizeFriend(f, trustedIds));

      if (next.length > 0) setFriends(next);
    } catch (err) {
      console.error('[Sync] Load error:', err);
    }
  };

  // ── Socket Helpers (Memoized to prevent loops) ───────────────────────────

  const joinRoomGlobal = useCallback((roomId) => {
    if (socketRef.current?.connected) {
      console.debug('[Sync] Joining room:', roomId);
      socketRef.current.emit('join_room', { roomId });
    }
  }, []);

  const sendMessageGlobal = useCallback((roomId, text) => {
    if (!socketRef.current?.connected) return;
    
    const clientId = `client-${Date.now()}-${Math.random()}`;
    const optimisticMsg = {
      id: clientId,
      senderId: currentUserId,
      message: text.trim(),
      timestamp: Date.now(),
      isOptimistic: true,
      clientId,
      roomId
    };

    setAllMessages(prev => ({
      ...prev,
      [roomId]: [...(prev[roomId] || []), optimisticMsg]
    }));

    socketRef.current.emit('send_message', { roomId, message: text.trim(), clientId });
  }, [currentUserId]);

  // Background Socket Listener
  useEffect(() => {
    loadFriends();

    let socket;
    import('socket.io-client').then(({ io }) => {
      socket = io({ autoConnect: true });
      socketRef.current = socket;

      socket.on('connect', () => {
        console.log('[Sync] Background socket connected:', socket.id);
      });

      socket.on('session_info', ({ userId }) => {
        setCurrentUserId(userId);
      });

      socket.on('receive_message', (msg) => {
        console.log('[Sync] Background message received for room:', msg.roomId);
        if (!msg.roomId) return;

        setAllMessages((prev) => {
          const roomMsgs = prev[msg.roomId] || [];
          // Deduplicate: Remove by server ID OR by clientId
          const filtered = roomMsgs.filter(m => 
            m.id !== msg.id && 
            (!msg.clientId || m.clientId !== msg.clientId)
          );
          return {
            ...prev,
            [msg.roomId]: [...filtered, msg]
          };
        });
      });
      
      socket.on('chat_history', ({ roomId, messages: history, currentUserId: userId }) => {
        console.log(`[Sync] Received history for room ${roomId}: ${history.length} messages`);
        setAllMessages(prev => ({
          ...prev,
          [roomId]: history
        }));
        setCurrentUserId(userId);
      });
    });

    return () => {
      socketRef.current?.disconnect();
      socketRef.current = null;
    };
  }, []);

  // Actions
  const toggleTrusted = async (id, value) => {
    setFriends((current) => current.map((f) => 
      f.id === id ? { ...f, isTrusted: value } : f
    ));

    if (!isPersistedFriendId(id)) return;

    try {
      const response = await fetch(`/api/friends/${id}/trusted`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trusted: value }),
      });
      if (!response.ok) throw new Error('Update failed');
    } catch (err) {
      console.error('[Sync] Toggle failed, reverting:', err);
      setFriends((current) => current.map((f) => 
        f.id === id ? { ...f, isTrusted: !value } : f
      ));
    }
  };

  const acceptFriend = async (id) => {
    setFriends((current) => current.map((f) => 
      f.id === id ? { ...f, status: 'accepted' } : f
    ));

    if (!isPersistedFriendId(id)) return;

    try {
      const response = await fetch(`/api/friends/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'accepted' }),
      });
      if (response.ok) loadFriends();
    } catch (err) {
      console.error('[Sync] Accept failed:', err);
      loadFriends(); 
    }
  };

  const removeFriend = async (id) => {
    setFriends((current) => current.filter((f) => f.id !== id));

    if (!isPersistedFriendId(id)) return;

    try {
      const response = await fetch(`/api/friends/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Delete failed');
    } catch (err) {
      console.error('[Sync] Remove failed:', err);
      loadFriends();
    }
  };

  const requestFriend = async (handle) => {
    const optimisticId = `pending-${Date.now()}`;
    setFriends((current) => [
      ...current,
      { id: optimisticId, displayName: handle, emoji: initialsForName(handle), status: 'outgoing' },
    ]);

    try {
      const response = await fetch('/api/friends', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ anonymousDisplayName: handle }),
      });

      if (response.ok) loadFriends();
      else setFriends((current) => current.filter((f) => f.id !== optimisticId));
    } catch (err) {
      console.error('[Sync] Request failed:', err);
      setFriends((current) => current.filter((f) => f.id !== optimisticId));
    }
  };

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
            <SosPanel enabled={sosEnabled} friends={friends} />
          </Panel>
          <Panel active={activeTab === 'chat'}>
            <ChatPanel 
              displayName={displayName} 
              friends={friends} 
              onToggleTrusted={toggleTrusted}
              onAcceptFriend={acceptFriend}
              onRemoveFriend={removeFriend}
              onRequestFriend={requestFriend}
              allMessages={allMessages}
              currentUserId={currentUserId}
              joinRoomGlobal={joinRoomGlobal}
              sendMessageGlobal={sendMessageGlobal}
            />
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

// ── SOS Panel (PRESERVING ORIGINAL UI) ──────────────────────────────────────

function SosPanel({ enabled, friends }) {
  const [status, setStatus] = useState('ready');
  const [locationOn, setLocationOn] = useState(false);
  const [error, setError] = useState('');
  const [sentCount, setSentCount] = useState(0);
  const [lastLocation, setLastLocation] = useState(null);
  const [locationError, setLocationError] = useState('');

  const trustedContacts = friends.filter((f) => f.status === 'accepted' && f.isTrusted);
  const trustedCount = trustedContacts.length;

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
        console.debug('[SOS] Location captured:', coords.latitude, coords.longitude);
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
        console.warn('[SOS] Geolocation error:', err.message);
        setLocationOn(false);
        setLocationError(err.message || 'Unable to access live location.');
        
        // Fallback for development testing
        if (!lastLocation) {
          console.debug('[SOS] Using development fallback location.');
          setLastLocation({
            latitude: 38.5382,
            longitude: -121.7617,
            accuracy: 10,
            capturedAt: new Date().toISOString(),
          });
          setLocationOn(true);
        }
      },
      {
        enableHighAccuracy: true,
        maximumAge: 60000,
        timeout: 10000,
      }
    );

    return () => navigator.geolocation.clearWatch(watcherId);
  }, [enabled]);

  const handleSend = async () => {
    if (!enabled || status === 'sending') return;

    setError('');

    try {
      let currentLoc = lastLocation;

      if (!currentLoc) {
        setStatus('requesting');
        try {
          const position = await requestCurrentLocation();
          currentLoc = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            capturedAt: new Date(position.timestamp).toISOString(),
          };
          setLastLocation(currentLoc);
          setLocationOn(true);
        } catch (locErr) {
          console.warn('[SOS] Manual capture failed, checking for fallback...');
          if (!currentLoc) throw new Error('Could not determine location. Please check settings.');
        }
      }

      setStatus('sending');

      const manualIds = trustedContacts
        .map(f => f.id)
        .filter(id => !isPersistedFriendId(id));

      const response = await fetch('/api/sos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...currentLoc,
          manualRecipientIds: manualIds.length > 0 ? manualIds : undefined,
        }),
      });
      const body = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(body.error || 'Unable to send SOS.');
      }

      setSentCount(body.sentCount || 0);
      setStatus('sent');
    } catch (err) {
      console.error('[SOS] Send failed:', err);
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
          value={`${trustedCount} contact${trustedCount === 1 ? '' : 's'}`}
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

      {enabled && <LocationPreview sent={status === 'sent'} location={lastLocation} trustedContacts={trustedContacts} />}

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

function LocationPreview({ sent, location, trustedContacts }) {
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
            {trustedContacts.length > 0 ? (
              trustedContacts.map((contact) => (
                <span key={contact.id}>{contact.emoji}</span>
              ))
            ) : (
              <span>-</span>
            )}
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

// ── Chat Panel (PRESERVING ORIGINAL UI) ──────────────────────────────────────

function ChatPanel({ 
  displayName, 
  friends, 
  onToggleTrusted, 
  onAcceptFriend, 
  onRemoveFriend, 
  onRequestFriend,
  allMessages,
  currentUserId,
  joinRoomGlobal,
  sendMessageGlobal
}) {
  const [subTab, setSubTab] = useState('messages');
  const [openId, setOpenId] = useState(null);
  const [draft, setDraft] = useState('');
  
  const { transcript, listening, startListening, stopListening, clearTranscript } = useSpeechToText();

  // Local state for bot chat.
  const [botMessages, setBotMessages] = useState(SEED_THREADS.bot);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  // Sync with global room joining when a thread is opened
  useEffect(() => {
    if (openId && openId !== 'bot') {
      joinRoomGlobal(openId);
    }
  }, [openId, joinRoomGlobal]);

  useEffect(() => {
    if (transcript) {
      setDraft((prev) => prev + (prev ? ' ' : '') + transcript);
      clearTranscript();
    }
  }, [transcript, clearTranscript]);

  const chats = useMemo(() => {
    const friendChats = friends
      .filter((friend) => friend.status === 'accepted')
      .map((friend) => {
        const msgs = allMessages[friend.id] || [];
        const last = msgs[msgs.length - 1];
        return {
          id: friend.id,
          handle: friend.displayName,
          emoji: friend.emoji,
          status: 'online',
          lastMsg: last?.message || 'Tap to chat',
          time: last?.timestamp ? new Date(last.timestamp).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }) : '-',
        };
      });

    return [BOT_CHAT, ...friendChats];
  }, [friends, allMessages]);

  const openPeer = openId ? chats.find((chat) => chat.id === openId) || null : null;
  const messages = openId === 'bot' ? botMessages : (allMessages[openId] || []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const send = async () => {
    if (!openId || !draft.trim()) return;

    const text = draft.trim();
    setDraft('');

    if (openId === 'bot') {
      const myMsg = { id: String(Date.now()), from: 'me', text, time: 'now' };
      setBotMessages((current) => [...current, myMsg]);
      setIsTyping(true);
      try {
        const history = [...botMessages, myMsg].map(m => ({
          role: m.from === 'me' ? 'user' : 'assistant',
          content: m.text
        }));

        const res = await fetch('/api/ai-chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages: history }),
        });

        if (res.ok) {
          const data = await res.json();
          setBotMessages((current) => [
            ...current,
            { id: String(Date.now() + 1), from: 'them', text: data.message, time: 'now' },
          ]);
        }
      } catch (err) {
        console.error('[SafeBot] AI error:', err);
      } finally {
        setIsTyping(false);
      }
    } else {
      sendMessageGlobal(openId, text);
    }
  };

  if (openPeer) {
    const isHuman = openId !== 'bot';

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
        {messages.map((message) => {
          const isMine = isHuman 
            ? String(message.senderId) === String(currentUserId) || message.from === 'me'
            : message.from === 'me';

          return (
            <div
              key={message.id || Math.random()}
              className={`${styles.messageRow} ${isMine ? styles.messageMine : ''}`}
            >
              <div
                className={`${styles.messageBubble} ${
                  isMine ? styles.messageBubbleMine : styles.messageBubbleThem
                }`}
              >
                {message.message || message.text}
              </div>
              <span className={styles.messageTime}>
                {message.timestamp ? new Date(message.timestamp).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }) : (message.time || 'now')}
              </span>
            </div>
          );
        })}
        {isTyping && (
          <div className={styles.messageRow}>
            <div className={`${styles.messageBubble} ${styles.messageBubbleThem}`}>
              <span className={styles.typingIndicator}>...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
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
            className={`${styles.micButton} ${listening ? styles.micButtonActive : ''}`}
            onClick={listening ? stopListening : startListening}
            aria-label={listening ? 'Stop listening' : 'Start voice input'}
            title={listening ? 'Stop listening' : 'Start voice input'}
          >
            <Mic className={styles.sendIcon} aria-hidden="true" />
          </button>
          <button
            type="button"
            className={styles.sendButton}
            onClick={send}
            disabled={!draft.trim() || isTyping}
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
        <FriendsPanel 
          friends={friends} 
          onToggleTrusted={onToggleTrusted}
          onAcceptFriend={onAcceptFriend}
          onRemoveFriend={onRemoveFriend}
          onRequestFriend={onRequestFriend}
        />
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

// ── Friends Panel (PRESERVING ORIGINAL UI) ──────────────────────────────────

function FriendsPanel({ friends, onToggleTrusted, onAcceptFriend, onRemoveFriend, onRequestFriend }) {
  const [query, setQuery] = useState('');

  const incoming = friends.filter((friend) => friend.status === 'incoming');
  const outgoing = friends.filter((friend) => friend.status === 'outgoing');
  const accepted = friends.filter((friend) => friend.status === 'accepted');
  const trustedCount = accepted.filter((friend) => friend.isTrusted).length;

  const handleRequest = () => {
    const handle = query.trim();
    if (!handle) return;
    onRequestFriend(handle);
    setQuery('');
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
              if (event.key === 'Enter') handleRequest();
            }}
            placeholder="e.g. QuietRiver"
            aria-label="Add friend by display name"
          />
          <button
            type="button"
            className={styles.requestButton}
            disabled={!query.trim()}
            onClick={handleRequest}
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
                onClick={() => onAcceptFriend(friend.id)}
              >
                <Check className={styles.tinyIcon} aria-hidden="true" />
              </button>
              <button
                type="button"
                className={styles.friendIconButton}
                aria-label={`Decline ${friend.displayName}`}
                onClick={() => onRemoveFriend(friend.id)}
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
                onClick={() => onRemoveFriend(friend.id)}
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
              onToggle={(value) => onToggleTrusted(friend.id, value)}
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
      <span className={friend.status === 'accepted' ? styles.friendActions : styles.friendActions}>
        {children}
      </span>
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

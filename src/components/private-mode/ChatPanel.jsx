import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Bot,
  Check,
  ChevronLeft,
  Circle,
  Lock,
  MapPin,
  Mic,
  Search,
  Send,
  Shield,
  Shuffle,
  UserPlus,
  X,
} from 'lucide-react';
import { useSpeechToText } from '../../hooks/useSpeechToText';
import styles from '../../styles/private-mode/chat.module.css';

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
    { id: 'b1', from: 'them', text: 'Hi, I am SafeBot. I can help with grounding exercises, safety planning, or just listen. What is on your mind?', time: 'now' },
  ],
  'demo-f1': [
    { id: '1', from: 'them', text: 'Hey, glad you reached out. We are both anonymous here.', time: '9:40 PM' },
    { id: '2', from: 'me', text: 'Thanks. I am not sure where to start.', time: '9:41 PM' },
    { id: '3', from: 'them', text: 'I hear you. Take your time.', time: '9:41 PM' },
  ],
  'demo-f2': [{ id: '1', from: 'them', text: 'You are not alone in this.', time: '8:12 PM' }],
  'demo-f3': [{ id: '1', from: 'them', text: 'I went through something similar last year.', time: 'Yesterday' }],
  'demo-f4': [{ id: '1', from: 'them', text: 'The trusted contact toggle helped me make a plan.', time: 'Yesterday' }],
};

const MONGO_ID_RE = /^[a-f0-9]{24}$/i;
const isRealId = (id) => MONGO_ID_RE.test(String(id));

function initialsForName(displayName) {
  return String(displayName || 'Friend').replace(/[^a-z0-9]/gi, '').slice(0, 2).toUpperCase() || 'FR';
}

function normalizeFriend(apiFriend, trustedFriendIds = new Set()) {
  const isPending = apiFriend.status === 'pending';
  return {
    id: apiFriend.id,
    displayName: apiFriend.friend?.displayName || 'Anonymous',
    emoji: initialsForName(apiFriend.friend?.displayName),
    status: apiFriend.status === 'accepted' ? 'accepted'
      : apiFriend.direction === 'incoming' && isPending ? 'incoming' : 'outgoing',
    isTrusted: trustedFriendIds.has(apiFriend.id),
  };
}

function normalizeApiMessages(apiMessages) {
  return apiMessages.map((m) => ({
    id: m.id,
    from: m.fromMe ? 'me' : 'them',
    text: m.text,
    time: m.time,
  }));
}

export default function ChatPanel({ displayName }) {
  const myHandle = displayName || 'You';

  const [subTab, setSubTab] = useState('messages');
  const [friends, setFriends] = useState(SEED_FRIENDS);
  const [openId, setOpenId] = useState(null);
  const [threads, setThreads] = useState(SEED_THREADS);
  const [draft, setDraft] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [loadingThread, setLoadingThread] = useState(false);
  const replyTimer = useRef(null);
  const messagesEndRef = useRef(null);
  const loadedRef = useRef(new Set()); // tracks which real friend IDs have been fetched

  const { transcript, listening, startListening, stopListening, clearTranscript } = useSpeechToText();

  useEffect(() => {
    if (transcript) {
      setDraft((prev) => prev + (prev ? ' ' : '') + transcript);
      clearTranscript();
    }
  }, [transcript, clearTranscript]);

  useEffect(() => () => window.clearTimeout(replyTimer.current), []);

  // Load real friend list
  useEffect(() => {
    let cancelled = false;

    async function loadFriends() {
      try {
        const [friendsRes, trustedRes] = await Promise.all([
          fetch('/api/friends'),
          fetch('/api/trusted-contacts'),
        ]);
        if (!friendsRes.ok) return;

        const friendsBody = await friendsRes.json();
        const trustedBody = trustedRes.ok ? await trustedRes.json() : {};
        const trustedFriendIds = new Set(
          (trustedBody.trustedContacts || []).map((c) => c.friendRelationshipId)
        );

        const nextFriends = (friendsBody.friends || [])
          .filter((f) => f.status === 'accepted' || f.status === 'pending')
          .map((f) => normalizeFriend(f, trustedFriendIds));

        if (!cancelled && nextFriends.length > 0) setFriends(nextFriends);
      } catch {
        // keep seed friends
      }
    }

    loadFriends();
    return () => { cancelled = true; };
  }, []);

  // Load messages from DB when opening a real friend chat
  useEffect(() => {
    if (!openId || !isRealId(openId) || loadedRef.current.has(openId)) return;
    loadedRef.current.add(openId);
    setLoadingThread(true);

    fetch(`/api/messages/${openId}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!data) return;
        setThreads((prev) => ({ ...prev, [openId]: normalizeApiMessages(data.messages) }));
      })
      .catch(() => {})
      .finally(() => setLoadingThread(false));
  }, [openId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [threads, openId, isTyping]);

  const chats = useMemo(() => {
    const friendChats = friends
      .filter((f) => f.status === 'accepted')
      .map((f) => {
        const thread = threads[f.id] || [];
        const last = thread[thread.length - 1];
        return {
          id: f.id,
          handle: f.displayName,
          emoji: f.emoji,
          status: 'online',
          lastMsg: last?.text || 'Say hi',
          time: last?.time || '-',
        };
      });
    return [BOT_CHAT, ...friendChats];
  }, [friends, threads]);

  const openPeer = openId ? chats.find((c) => c.id === openId) || null : null;
  const messages = openId ? threads[openId] || [] : [];

  const send = async () => {
    if (!openId || !draft.trim() || isTyping) return;

    const text = draft.trim();
    const myMsg = { id: String(Date.now()), from: 'me', text, time: 'now' };
    setThreads((prev) => ({ ...prev, [openId]: [...(prev[openId] || []), myMsg] }));
    setDraft('');

    if (openPeer?.isBot) {
      setIsTyping(true);
      try {
        const history = [...(threads[openId] || []), myMsg].map((m) => ({
          role: m.from === 'me' ? 'user' : 'assistant',
          content: m.text,
        }));
        const res = await fetch('/api/ai-chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages: history }),
        });
        if (res.ok) {
          const data = await res.json();
          setThreads((prev) => ({
            ...prev,
            [openId]: [...(prev[openId] || []), { id: String(Date.now() + 1), from: 'them', text: data.message, time: 'now' }],
          }));
        }
      } catch (err) {
        console.error('[SafeBot] AI error:', err);
      } finally {
        setIsTyping(false);
      }
    } else if (isRealId(openId)) {
      // Persist to DB — fire and forget (optimistic message already shown)
      fetch(`/api/messages/${openId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      }).catch((err) => console.error('[Chat] Send error:', err));
    } else {
      // Seed/demo friend — simulate reply
      window.clearTimeout(replyTimer.current);
      replyTimer.current = window.setTimeout(() => {
        setThreads((prev) => ({
          ...prev,
          [openId]: [...(prev[openId] || []), { id: String(Date.now() + 1), from: 'them', text: 'Thanks for sharing. I am listening.', time: 'now' }],
        }));
      }, 1000);
    }
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
          {loadingThread && (
            <div style={{ textAlign: 'center', padding: '20px', opacity: 0.5, fontSize: '13px' }}>
              Loading messages...
            </div>
          )}
          {messages.map((message) => (
            <div
              key={message.id}
              className={`${styles.messageRow} ${message.from === 'me' ? styles.messageMine : ''}`}
            >
              <div className={`${styles.messageBubble} ${message.from === 'me' ? styles.messageBubbleMine : styles.messageBubbleThem}`}>
                {message.text}
              </div>
              <span className={styles.messageTime}>{message.time}</span>
            </div>
          ))}
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
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') send(); }}
              placeholder={openPeer.isBot ? 'Ask SafeBot anything...' : `Message ${openPeer.handle}...`}
              className={styles.messageInput}
              aria-label="Type a message"
            />
            <button
              type="button"
              className={`${styles.micButton} ${listening ? styles.micButtonActive : ''}`}
              onClick={listening ? stopListening : startListening}
              aria-label={listening ? 'Stop listening' : 'Start voice input'}
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
        <MessagesList chats={chats} threads={threads} onOpen={setOpenId} onGoFriends={() => setSubTab('friends')} />
      ) : (
        <FriendsPanel myHandle={myHandle} friends={friends} setFriends={setFriends} />
      )}
    </div>
  );
}

function MessagesList({ chats, threads, onOpen, onGoFriends }) {
  const [query, setQuery] = useState('');
  const q = query.toLowerCase();

  const filtered = chats.filter((chat) => {
    if (!q) return true;
    if (chat.handle.toLowerCase().includes(q)) return true;
    const thread = threads[chat.id] || [];
    return thread.some((m) => m.text.toLowerCase().includes(q));
  });

  const friendChats = filtered.filter((c) => !c.isBot);

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
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search chats"
          aria-label="Search chats"
        />
      </label>

      <div className={styles.peerSectionLabel}>Always available</div>
      {filtered.filter((c) => c.isBot).map((chat) => (
        <ChatRow key={chat.id} chat={chat} onOpen={onOpen} />
      ))}

      <div className={styles.peerSectionLabel}>Friend chats</div>
      {friendChats.length === 0 ? (
        <button type="button" className={styles.emptyFriendState} onClick={onGoFriends}>
          <span className={styles.emptyIcon} aria-hidden="true"><UserPlus /></span>
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

function FriendsPanel({ myHandle, friends, setFriends }) {
  const [query, setQuery] = useState('');

  const incoming = friends.filter((f) => f.status === 'incoming');
  const outgoing = friends.filter((f) => f.status === 'outgoing');
  const accepted = friends.filter((f) => f.status === 'accepted');
  const trustedCount = accepted.filter((f) => f.isTrusted).length;

  const accept = (id) => setFriends((prev) => prev.map((f) => f.id === id ? { ...f, status: 'accepted' } : f));
  const remove = (id) => setFriends((prev) => prev.filter((f) => f.id !== id));

  const toggleTrusted = async (id, value) => {
    setFriends((prev) => prev.map((f) => f.id === id ? { ...f, isTrusted: value } : f));
    if (!isRealId(id)) return;
    try {
      const res = await fetch(`/api/friends/${id}/trusted`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trusted: value }),
      });
      if (!res.ok) throw new Error();
    } catch {
      setFriends((prev) => prev.map((f) => f.id === id ? { ...f, isTrusted: !value } : f));
    }
  };

  const sendRequest = async () => {
    const handle = query.trim();
    if (!handle) return;
    if (friends.some((f) => f.displayName.toLowerCase() === handle.toLowerCase())) return;

    const optimisticId = `pending-${Date.now()}`;
    setFriends((prev) => [...prev, { id: optimisticId, displayName: handle, emoji: initialsForName(handle), status: 'outgoing' }]);
    setQuery('');

    try {
      const res = await fetch('/api/friends', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ anonymousDisplayName: handle }),
      });
      if (!res.ok) return;
      const body = await res.json();
      if (!body.friend) return;
      setFriends((prev) => prev.map((f) => f.id === optimisticId ? normalizeFriend(body.friend) : f));
    } catch {
      // keep optimistic row
    }
  };

  return (
    <div className={styles.friendsPanel}>
      <div className={styles.chatNotice}>
        <Lock className={styles.noticeIcon} aria-hidden="true" />
        <span>Friends connect by anonymous display name only. Real names are never shared.</span>
      </div>

      <div className={styles.friendIdentity}>
        <span className={styles.friendIdentityAvatar} aria-hidden="true">{initialsForName(myHandle)}</span>
        <span className={styles.friendInfo}>
          <span>Your display name</span>
          <strong>{myHandle}</strong>
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
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') sendRequest(); }}
            placeholder="e.g. QuietRiver"
            aria-label="Add friend by display name"
          />
          <button type="button" className={styles.requestButton} disabled={!query.trim()} onClick={sendRequest}>
            Request
          </button>
        </label>
      </div>

      {incoming.length > 0 && (
        <FriendSection title={`Requests - ${incoming.length}`}>
          {incoming.map((f) => (
            <FriendRow key={f.id} friend={f}>
              <button type="button" className={styles.acceptButton} aria-label={`Accept ${f.displayName}`} onClick={() => accept(f.id)}>
                <Check className={styles.tinyIcon} aria-hidden="true" />
              </button>
              <button type="button" className={styles.friendIconButton} aria-label={`Decline ${f.displayName}`} onClick={() => remove(f.id)}>
                <X className={styles.tinyIcon} aria-hidden="true" />
              </button>
            </FriendRow>
          ))}
        </FriendSection>
      )}

      {outgoing.length > 0 && (
        <FriendSection title={`Pending - ${outgoing.length}`}>
          {outgoing.map((f) => (
            <FriendRow key={f.id} friend={f}>
              <span className={styles.friendMutedText}>Waiting...</span>
              <button type="button" className={styles.friendIconButton} aria-label={`Cancel request to ${f.displayName}`} onClick={() => remove(f.id)}>
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
            <strong>{trustedCount} trusted contact{trustedCount === 1 ? '' : 's'}</strong>
            <span>Trusted friends receive your live location when you tap SOS.</span>
          </div>
        </div>
      )}

      <FriendSection title={`Friends - ${accepted.length}`}>
        {accepted.length === 0 ? (
          <div className={styles.emptyFriendState}>
            <span className={styles.emptyIcon} aria-hidden="true"><UserPlus /></span>
            <strong>No friends yet</strong>
            <span>Add someone by their display name to start chatting.</span>
          </div>
        ) : (
          accepted.map((f) => (
            <AcceptedFriendRow key={f.id} friend={f} onToggle={(v) => toggleTrusted(f.id, v)} />
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
        <button type="button" role="switch" aria-checked={trusted} aria-label={`Mark ${friend.displayName} as trusted contact`}
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

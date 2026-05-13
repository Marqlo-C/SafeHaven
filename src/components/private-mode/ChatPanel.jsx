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

const MY_HANDLE = 'SoftFern';
const MY_AVATAR = 'SF';
const MONGO_ID_PATTERN = /^[a-f0-9]{24}$/i;

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

export default function ChatPanel() {
  const [subTab, setSubTab] = useState('messages');
  const [friends, setFriends] = useState(SEED_FRIENDS);
  const [openId, setOpenId] = useState(null);
  const [threads, setThreads] = useState(SEED_THREADS);
  const [draft, setDraft] = useState('');
  const replyTimer = useRef(null);

  const { transcript, listening, startListening, stopListening, clearTranscript } = useSpeechToText();

  useEffect(() => {
    if (transcript) {
      setDraft((prev) => prev + (prev ? ' ' : '') + transcript);
      clearTranscript();
    }
  }, [transcript, clearTranscript]);

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

  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [threads, openId, isTyping]);

  const send = async () => {
    if (!openId || !draft.trim() || isTyping) return;

    const text = draft.trim();
    const myMsg = { id: String(Date.now()), from: 'me', text, time: 'now' };

    setThreads((current) => ({
      ...current,
      [openId]: [...(current[openId] || []), myMsg],
    }));
    setDraft('');

    if (openPeer?.isBot) {
      setIsTyping(true);
      try {
        const history = [
          ...(threads[openId] || []),
          myMsg
        ].map(m => ({
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
          setThreads((current) => ({
            ...current,
            [openId]: [
              ...(current[openId] || []),
              { id: String(Date.now() + 1), from: 'them', text: data.message, time: 'now' },
            ],
          }));
        }
      } catch (err) {
        console.error('[SafeBot] AI error:', err);
      } finally {
        setIsTyping(false);
      }
    } else {
      window.clearTimeout(replyTimer.current);
      replyTimer.current = window.setTimeout(() => {
        setThreads((current) => ({
          ...current,
          [openId]: [
            ...(current[openId] || []),
            { id: String(Date.now() + 1), from: 'them', text: 'Thanks for sharing. I am listening.', time: 'now' },
          ],
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

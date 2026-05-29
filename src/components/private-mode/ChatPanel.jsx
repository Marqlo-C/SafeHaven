/**
 * ChatPanel — Main orchestrator for chat interface.
 *
 * Manages:
 *  - State for friends, threads, messages, draft
 *  - Fetching friend list and message history
 *  - Sending messages to friends and AI bot
 *  - Tab switching (Messages vs Friends)
 *  - Speech-to-text integration
 *
 * Renders appropriate sub-components based on state.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSpeechToText } from '../../hooks/useSpeechToText';
import styles from '../../styles/private-mode/chat.module.css';
import ChatThreadView from './ChatThreadView';
import MessagesList from './MessagesList';
import FriendsPanel from './FriendsPanel';
import { isRealId, normalizeFriend, normalizeApiMessages } from './chatUtils';

const BOT_CHAT = {
  id: 'bot',
  handle: 'SafeBot',
  emoji: 'SB',
  status: 'online',
  lastMsg: 'I am here anytime. Try "I feel anxious".',
  time: 'now',
  isBot: true,
};

const BOT_THREAD = [
  {
    id: 'b1',
    from: 'them',
    text: 'Hi, I am SafeBot. I can help with grounding exercises, safety planning, or just listen. What is on your mind?',
    time: 'now',
  },
];

export default function ChatPanel({ displayName }) {
  const myHandle = displayName || 'You';

  const [subTab, setSubTab] = useState('messages');
  const [friends, setFriends] = useState([]);
  const [openId, setOpenId] = useState(null);
  const [threads, setThreads] = useState({ bot: BOT_THREAD });
  const [draft, setDraft] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [loadingThread, setLoadingThread] = useState(false);
  const loadedRef = useRef(new Set());

  const { transcript, listening, startListening, stopListening, clearTranscript } = useSpeechToText();

  useEffect(() => {
    if (transcript) {
      setDraft((prev) => prev + (prev ? ' ' : '') + transcript);
      clearTranscript();
    }
  }, [transcript, clearTranscript]);

  // Load real friend list and prefetch threads
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

        // Prefetch accepted friend threads
        const toFetch = nextFriends.filter((f) => f.status === 'accepted' && isRealId(f.id));
        if (toFetch.length === 0) return;

        const settled = await Promise.allSettled(
          toFetch.map((f) =>
            fetch(`/api/friends/${f.id}/messages`)
              .then((r) => (r.ok ? r.json() : null))
              .then((data) => ({ id: f.id, messages: data?.messages || [] }))
          )
        );

        if (cancelled) return;
        setThreads((prev) => {
          const next = { ...prev };
          settled.forEach((r) => {
            if (r.status === 'fulfilled' && r.value.messages.length > 0) {
              next[r.value.id] = normalizeApiMessages(r.value.messages);
              loadedRef.current.add(r.value.id);
            }
          });
          return next;
        });
      } catch {
        // keep empty list on error
      }
    }

    loadFriends();
    return () => {
      cancelled = true;
    };
  }, [subTab]);

  // Load messages when opening real friend chat
  useEffect(() => {
    if (!openId || !isRealId(openId) || loadedRef.current.has(openId)) return;
    loadedRef.current.add(openId);
    setLoadingThread(true);

    fetch(`/api/friends/${openId}/messages`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!data) return;
        setThreads((prev) => ({ ...prev, [openId]: normalizeApiMessages(data.messages) }));
      })
      .catch(() => {})
      .finally(() => setLoadingThread(false));
  }, [openId]);

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

  /**
   * send — Sends message to current peer (bot or real friend).
   * Adds message optimistically, sends to API, handles AI responses.
   */
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
      // Persist to DB — fire and forget
      fetch(`/api/friends/${openId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      }).catch((err) => console.error('[Chat] Send error:', err));
    }
  };

  // Thread view when chat is open
  if (openPeer) {
    return (
      <ChatThreadView
        openPeer={openPeer}
        openId={openId}
        messages={messages}
        isTyping={isTyping}
        loadingThread={loadingThread}
        draft={draft}
        onDraftChange={setDraft}
        onBack={() => setOpenId(null)}
        onSend={send}
        listening={listening}
        startListening={startListening}
        stopListening={stopListening}
      />
    );
  }

  // Main tab view
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

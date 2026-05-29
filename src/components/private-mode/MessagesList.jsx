/**
 * MessagesList — Displays chat list for all conversations (bot + friends).
 *
 * Features:
 *  - Search across chat names and message content
 *  - Shows bot chat always available
 *  - Shows accepted friend chats with last message preview
 *  - Call-to-action to add friends if none exist
 */

import { useState } from 'react';
import { Bot, Lock, Search, UserPlus } from 'lucide-react';
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

function ChatRow({ chat, onOpen }) {
  return (
    <button type="button" className={styles.peerRow} onClick={() => onOpen(chat.id)}>
      <span className={styles.avatar}>
        <span className={chat.isBot ? styles.botAvatar : ''}>{chat.emoji}</span>
        <span className={chat.status === 'online' ? styles.avatarOnline : styles.avatarAway} />
      </span>
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

export default function MessagesList({ chats, threads, onOpen, onGoFriends }) {
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

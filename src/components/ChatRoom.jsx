import { useState, useRef, useEffect } from 'react';
import { useChat } from '../hooks/useChat';
import styles from '../styles/ChatRoom.module.css';

/**
 * ChatRoom — anonymous real-time messaging UI.
 *
 * Props:
 *   roomId      {string}  Socket.io room to join.
 *   displayName {string}  Anonymous name shown for the current user's messages.
 *
 * Message ownership is determined by comparing msg.senderId to the current
 * authenticated user ID returned by the friend-gated chat socket.
 */
export default function ChatRoom({ roomId, displayName }) {
  const { messages, connected, currentUserId, error, sendMessage } = useChat(roomId);
  const [draft, setDraft] = useState('');
  const bottomRef = useRef(null);

  // Auto-scroll to the latest message.
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!draft.trim()) return;
    sendMessage(draft);
    setDraft('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend(e);
    }
  };

  return (
    <div className={styles.room}>
      <header className={styles.header}>
        <span className={styles.displayName}>{displayName}</span>
        <span className={`${styles.dot} ${connected ? styles.online : styles.offline}`} />
      </header>

      <ul className={styles.messages} aria-live="polite" aria-label="Messages">
        {messages.length === 0 && (
          <li className={styles.empty}>
            {error || (connected ? 'No messages yet. Say hello.' : 'Connecting…')}
          </li>
        )}
        {messages.map((msg) => {
          const isOwn = msg.senderId === currentUserId;
          return (
            <li
              key={msg.id || `${msg.senderId}-${msg.timestamp}`}
              className={`${styles.row} ${isOwn ? styles.rowOwn : styles.rowOther}`}
            >
              <span className={`${styles.bubble} ${isOwn ? styles.bubbleOwn : styles.bubbleOther}`}>
                {msg.message}
              </span>
            </li>
          );
        })}
        <li ref={bottomRef} aria-hidden="true" />
      </ul>

      <form onSubmit={handleSend} className={styles.composer}>
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message… (Enter to send)"
          className={styles.input}
          rows={1}
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          disabled={!connected}
          aria-label="Message input"
        />
        <button
          type="submit"
          className={styles.send}
          disabled={!connected || !draft.trim()}
          aria-label="Send message"
        >
          Send
        </button>
      </form>
    </div>
  );
}

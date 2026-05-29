/**
 * ChatThreadView — Displays open chat thread with another peer (friend or bot).
 *
 * Handles:
 *  - Message rendering with from/to styling
 *  - Typing indicator for AI responses
 *  - Message composer (input + mic + send)
 *  - Back button to return to chat list
 *  - Loading state while fetching message history
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { Bot, ChevronLeft, Circle, Lock, Mic, Send } from 'lucide-react';
import { useSpeechToText } from '../../hooks/useSpeechToText';
import styles from '../../styles/private-mode/chat.module.css';
import MessageComposer from './MessageComposer';
import Avatar from './ChatAvatar';

const BOT_CHAT = {
  id: 'bot',
  handle: 'SafeBot',
  emoji: 'SB',
  status: 'online',
  lastMsg: 'I am here anytime. Try "I feel anxious".',
  time: 'now',
  isBot: true,
};

const MONGO_ID_RE = /^[a-f0-9]{24}$/i;
const isRealId = (id) => MONGO_ID_RE.test(String(id));

export default function ChatThreadView({
  openPeer,
  openId,
  messages,
  isTyping,
  loadingThread,
  draft,
  onDraftChange,
  onBack,
  onSend,
  listening,
  startListening,
  stopListening,
}) {
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  if (!openPeer) return null;

  return (
    <div className={styles.chatPanel}>
      <div className={styles.threadHeader}>
        <button
          type="button"
          className={styles.backButton}
          onClick={onBack}
          aria-label="Back to chats"
        >
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

      <MessageComposer
        draft={draft}
        onDraftChange={onDraftChange}
        onSend={onSend}
        isTyping={isTyping}
        listening={listening}
        startListening={startListening}
        stopListening={stopListening}
        placeholder={
          openPeer.isBot ? 'Ask SafeBot anything...' : `Message ${openPeer.handle}...`
        }
      />
    </div>
  );
}

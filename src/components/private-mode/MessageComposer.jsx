/**
 * MessageComposer — Input field with speech-to-text and send button.
 *
 * Features:
 *  - Text input with autocomplete off for privacy
 *  - Mic button for voice input (toggles listening state)
 *  - Send button (disabled when empty or typing)
 *  - Enter key sends message
 */

import { Mic, Send } from 'lucide-react';
import styles from '../../styles/private-mode/chat.module.css';

export default function MessageComposer({
  draft,
  onDraftChange,
  onSend,
  isTyping,
  listening,
  startListening,
  stopListening,
  placeholder,
}) {
  return (
    <div className={styles.composerWrap}>
      <div className={styles.composer}>
        <input
          value={draft}
          onChange={(e) => onDraftChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') onSend();
          }}
          placeholder={placeholder}
          className={styles.messageInput}
          aria-label="Type a message"
          autoComplete="off"
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
          onClick={onSend}
          disabled={!draft.trim() || isTyping}
          aria-label="Send message"
        >
          <Send className={styles.sendIcon} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { Camera, FileText, Lock, Mic, Type } from 'lucide-react';
import styles from '../styles/JournalPanel.module.css';

export default function JournalPanel() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleMediaUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    for (const file of files) {
      if (file.type.startsWith('image/') || file.type.startsWith('video/')) {
        await uploadFile(file, 'media');
      }
    }
  };

  const handleAudioUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    for (const file of files) {
      if (file.type.startsWith('audio/')) {
        await uploadFile(file, 'audio');
      }
    }
  };

  const handleTextSubmit = async (text) => {
    if (!text.trim()) return;
    setLoading(true);
    try {
      const res = await fetch('/api/journal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: text,
          title: '',
          incidentDate: new Date(),
        }),
      });

      if (res.ok) {
        const { entry } = await res.json();
        setEntries((current) => [{ ...entry, type: 'text' }, ...current]);
      }
    } finally {
      setLoading(false);
    }
  };

  const uploadFile = async (file, type) => {
    setLoading(true);
    try {
      const entryRes = await fetch('/api/journal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: `${type} attachment`,
          title: '',
          incidentDate: new Date(),
        }),
      });

      if (!entryRes.ok) throw new Error('Failed to create entry');
      const { entry } = await entryRes.json();

      const formData = new FormData();
      formData.append('file', file);

      const attachRes = await fetch(`/api/journal/attachment?entryId=${entry._id}`, {
        method: 'POST',
        body: formData,
      });

      if (attachRes.ok) {
        setEntries((current) => [{ ...entry, type }, ...current]);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container} aria-busy={loading}>
      <div className={styles.securityNotice}>
        <Lock className={styles.lockIcon} />
        <span>Entries are uploaded to encrypted backup. Nothing is saved on this device.</span>
      </div>

      <div className={styles.buttonGrid}>
        <UploadButton
          label="Media"
          hint="Photo or video"
          accept="image/*,video/*"
          onChange={handleMediaUpload}
          icon={<Camera className={styles.icon} />}
        />
        <UploadButton
          label="Audio"
          hint="Record now"
          accept="audio/*"
          onChange={handleAudioUpload}
          icon={<Mic className={styles.icon} />}
        />
        <TextButton
          label="Text"
          hint="Write a note"
          onSubmit={handleTextSubmit}
          icon={<Type className={styles.icon} />}
        />
      </div>

      <div className={styles.recentHeader}>
        <span className={styles.recentTitle}>Recent entries</span>
        <span className={styles.recentCount}>{entries.length} saved</span>
      </div>

      <div className={styles.entryList}>
        {entries.map((entry) => (
          <EntryCard key={entry._id} entry={entry} />
        ))}
        {entries.length === 0 && <p className={styles.emptyState}>No entries yet. Start documenting when ready.</p>}
      </div>
    </div>
  );
}

function UploadButton({ label, hint, accept, onChange, icon }) {
  return (
    <label className={`${styles.uploadButton} ${styles.uploadBtnBase}`}>
      <input
        type="file"
        accept={accept}
        onChange={onChange}
        className={styles.fileInput}
        multiple
      />
      <div className={styles.uploadIcon}>{icon}</div>
      <span className={styles.uploadLabel}>{label}</span>
      <span className={styles.uploadHint}>{hint}</span>
    </label>
  );
}

function TextButton({ label, hint, onSubmit, icon }) {
  const [showInput, setShowInput] = useState(false);
  const [text, setText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!text.trim()) return;
    setIsSubmitting(true);
    try {
      await onSubmit(text);
      setText('');
      setShowInput(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!showInput) {
    return (
      <button
        onClick={() => setShowInput(true)}
        className={`${styles.uploadButton} ${styles.uploadBtnBase}`}
      >
        <div className={styles.uploadIcon}>{icon}</div>
        <span className={styles.uploadLabel}>{label}</span>
        <span className={styles.uploadHint}>{hint}</span>
      </button>
    );
  }

  return (
    <div className={`${styles.uploadButton} ${styles.textInputWrapper}`}>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Write your note..."
        className={styles.textInput}
        autoFocus
      />
      <div className={styles.textActions}>
        <button
          onClick={() => {
            setText('');
            setShowInput(false);
          }}
          className={styles.cancelBtn}
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={isSubmitting || !text.trim()}
          className={styles.submitBtn}
        >
          {isSubmitting ? 'Saving...' : 'Save'}
        </button>
      </div>
    </div>
  );
}

function EntryCard({ entry }) {
  const formatTime = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getTypeLabel = () => {
    const typeMap = { media: 'Media', audio: 'Audio', text: 'Note' };
    return typeMap[entry.type] || entry.type;
  };

  const TypeIcon = entry.type === 'text' ? FileText : entry.type === 'audio' ? Mic : Camera;

  return (
    <div className={styles.entryCard}>
      <div className={styles.entryIcon}>
        <TypeIcon className={styles.entryTypeIcon} />
      </div>
      <div className={styles.entryContent}>
        <div className={styles.entryMeta}>
          <span className={styles.entryType}>{getTypeLabel()}</span>
          <span className={styles.entryDot}>-</span>
          <span className={styles.entryTime}>{formatTime(entry.createdAt)}</span>
        </div>
        <div className={styles.entryText}>{entry.content || entry.title}</div>
      </div>
    </div>
  );
}

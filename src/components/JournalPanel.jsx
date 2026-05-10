import { useEffect, useRef, useState } from 'react';
import { Camera, Download, FileText, Lock, Mic, Shuffle, Square, Trash2, Type, X } from 'lucide-react';
import styles from '../styles/JournalPanel.module.css';

export default function JournalPanel() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [error, setError] = useState(null);
  const mediaRecorder = useRef(null);
  const audioChunks = useRef([]);

  const fileToBase64 = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (err) => reject(err);
  });

  const fetchEntries = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/journal');
      if (res.ok) {
        const data = await res.json();
        console.debug('[Journal] Fetched entries:', data.entries?.length);
        setEntries(data.entries || []);
      } else {
        setError('Unable to load entries.');
      }
    } catch (err) {
      console.error('[Journal] Fetch error:', err);
      setError('Connection error.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEntries();
  }, []);

  const handleMediaUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    for (const file of files) {
      await uploadFile(file);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder.current = new MediaRecorder(stream);
      audioChunks.current = [];

      mediaRecorder.current.ondataavailable = (event) => {
        audioChunks.current.push(event.data);
      };

      mediaRecorder.current.onstop = async () => {
        const audioBlob = new Blob(audioChunks.current, { type: 'audio/webm' });
        const file = new File([audioBlob], `recording-${Date.now()}.webm`, { type: 'audio/webm' });
        await uploadFile(file);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.current.start();
      setIsRecording(true);
    } catch (err) {
      console.error('Recording failed:', err);
      alert('Could not access microphone.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorder.current && isRecording) {
      mediaRecorder.current.stop();
      setIsRecording(false);
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
        setEntries((current) => [entry, ...current]);
      }
    } finally {
      setLoading(false);
    }
  };

  const getEntryType = (entry) => {
    if (!entry.mediaType) return 'text';
    const mime = entry.mediaType;
    if (mime.startsWith('image/')) return 'image';
    if (mime.startsWith('video/')) return 'video';
    if (mime.startsWith('audio/')) return 'audio';
    return 'file';
  };

  const uploadFile = async (file) => {
    setLoading(true);
    try {
      console.log('[Journal] Converting to Base64:', file.name);
      const base64Data = await fileToBase64(file);

      console.log('[Journal] Creating entry with media...');
      const res = await fetch('/api/journal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: file.name,
          title: '',
          incidentDate: new Date(),
          mediaData: base64Data,
          mediaType: file.type,
          mediaName: file.name,
        }),
      });

      if (res.ok) {
        const { entry } = await res.json();
        console.log('[Journal] Entry created instantly:', entry._id);
        setEntries((current) => [entry, ...current]);
      } else {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Upload failed');
      }
    } catch (err) {
      console.error('[Journal] Upload error:', err);
      setError(`Upload failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this entry?')) return;
    try {
      const res = await fetch(`/api/journal/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setEntries((current) => current.filter((e) => e._id !== id));
        setSelectedEntry(null);
      }
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  return (
    <div className={styles.container} aria-busy={loading}>
      <div className={styles.securityNotice}>
        <Lock className={styles.lockIcon} />
        <span>Entries are uploaded to encrypted backup. Nothing is saved on this device.</span>
      </div>

      {error && (
        <div className={styles.errorMessage} onClick={() => setError(null)}>
          <X className={styles.tinyIcon} />
          {error}
        </div>
      )}

      <div className={styles.buttonGrid}>
        <UploadButton
          label="Media"
          hint="Photo or video"
          accept="image/*,video/*"
          onChange={handleMediaUpload}
          icon={<Camera className={styles.icon} />}
        />
        <RecordButton
          isRecording={isRecording}
          onStart={startRecording}
          onStop={stopRecording}
        />
        <TextButton
          label="Text"
          hint="Write a note"
          onSubmit={handleTextSubmit}
          icon={<Type className={styles.icon} />}
        />
      </div>

      <div className={styles.recentHeader}>
        <div className={styles.recentTitleGroup}>
          <span className={styles.recentTitle}>Recent entries</span>
          <button type="button" className={styles.refreshBtn} onClick={fetchEntries} title="Refresh entries">
            <Shuffle className={styles.tinyIcon} />
          </button>
        </div>
        <span className={styles.recentCount}>{entries.length} saved</span>
      </div>

      <div className={styles.entryList}>
        {entries.map((entry) => (
          <EntryCard 
            key={entry._id} 
            entry={entry} 
            type={getEntryType(entry)}
            onClick={() => {
              console.log('[Journal] Selecting entry:', entry._id, 'type:', getEntryType(entry));
              setSelectedEntry(entry);
            }} 
          />
        ))}
        {entries.length === 0 && !loading && (
          <p className={styles.emptyState}>No entries yet. Start documenting when ready.</p>
        )}
        {loading && entries.length === 0 && (
          <p className={styles.emptyState}>Loading your journal...</p>
        )}
      </div>

      {selectedEntry && (
        <EntryPreview
          entry={selectedEntry}
          type={getEntryType(selectedEntry)}
          onClose={() => setSelectedEntry(null)}
          onDelete={() => handleDelete(selectedEntry._id)}
        />
      )}
    </div>
  );
}

function EntryPreview({ entry, type, onClose, onDelete }) {
  console.log('[Journal] Previewing:', type);

  return (
    <div className={styles.previewBackdrop} onClick={onClose}>
      <div className={styles.previewContent} onClick={(e) => e.stopPropagation()}>
        <header className={styles.previewHeader}>
          <div className={styles.previewTitle}>
            <strong>{type.toUpperCase()}</strong>
            <span>{new Date(entry.createdAt).toLocaleString()}</span>
          </div>
          <button type="button" onClick={onClose} className={styles.closeBtn} aria-label="Close">
            <X className={styles.icon} />
          </button>
        </header>

        <div className={styles.previewBody}>
          {type === 'text' && <p className={styles.previewText}>{entry.content}</p>}
          {type === 'image' && (
            <div className={styles.mediaContainer}>
              <img 
                src={entry.mediaData} 
                alt={entry.mediaName} 
                className={styles.previewMedia} 
              />
            </div>
          )}
          {type === 'video' && (
            <div className={styles.mediaContainer}>
              <video 
                controls 
                src={entry.mediaData} 
                className={styles.previewMedia}
              />
            </div>
          )}
          {type === 'audio' && (
            <div className={styles.audioWrapper}>
              <audio 
                controls 
                src={entry.mediaData} 
                className={styles.audioPlayer} 
                autoPlay 
              />
            </div>
          )}
          {type === 'file' && (
            <div className={styles.fileDownloadBox}>
              <p>{entry.mediaName}</p>
              <a href={entry.mediaData} download={entry.mediaName} className={styles.downloadBtn}>
                <Download className={styles.tinyIcon} />
                Download File
              </a>
            </div>
          )}
        </div>

        <footer className={styles.previewFooter}>
          <button type="button" onClick={onDelete} className={styles.deleteBtn}>
            <Trash2 className={styles.tinyIcon} />
            Delete Entry
          </button>
        </footer>
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

function RecordButton({ isRecording, onStart, onStop }) {
  return (
    <button
      type="button"
      onClick={isRecording ? onStop : onStart}
      className={`${styles.uploadButton} ${styles.uploadBtnBase} ${isRecording ? styles.recording : ''}`}
    >
      <div className={styles.uploadIcon}>
        {isRecording ? <Square className={styles.icon} /> : <Mic className={styles.icon} />}
      </div>
      <span className={styles.uploadLabel}>{isRecording ? 'Stop' : 'Audio'}</span>
      <span className={styles.uploadHint}>{isRecording ? 'Recording...' : 'Record now'}</span>
    </button>
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

function EntryCard({ entry, type, onClick }) {
  const formatTime = (date) => {
    try {
      const d = new Date(date);
      if (isNaN(d.getTime())) return 'Just now';
      return d.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (e) {
      return 'Just now';
    }
  };

  const TypeIcon = type === 'text' ? FileText : type === 'audio' ? Mic : Camera;
  const labels = { text: 'Note', audio: 'Audio', image: 'Photo', video: 'Video', media: 'Media', file: 'File' };

  return (
    <div className={styles.entryCard} onClick={onClick} role="button" tabIndex={0}>
      <div className={styles.entryIcon}>
        <TypeIcon className={styles.entryTypeIcon} />
      </div>
      <div className={styles.entryContent}>
        <div className={styles.entryMeta}>
          <span className={styles.entryType}>{labels[type] || 'Entry'}</span>
          <span className={styles.entryDot}>-</span>
          <span className={styles.entryTime}>{formatTime(entry.createdAt)}</span>
        </div>
        <div className={styles.entryText}>{entry.content || 'No content'}</div>
      </div>
    </div>
  );
}

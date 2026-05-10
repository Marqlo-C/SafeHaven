/**
 * DEV TEST PAGE — delete this file before shipping.
 * Access at: http://localhost:3000/dev-test
 * Tests: AI chat, bookmarks CRUD, image upload, voice-to-text.
 */

import { useState, useRef } from 'react';
import { useSpeechToText } from '../hooks/useSpeechToText';

const s = {
  page:    { fontFamily: 'monospace', padding: '24px', maxWidth: '800px', margin: '0 auto', background: '#0f0f13', color: '#e0e0e0', minHeight: '100vh' },
  section: { marginBottom: '40px', padding: '16px', border: '1px solid #333', borderRadius: '8px' },
  h2:      { color: '#a78bfa', marginTop: 0 },
  h3:      { color: '#6ee7b7', marginTop: 0 },
  input:   { width: '100%', padding: '8px', background: '#1a1a24', border: '1px solid #444', borderRadius: '4px', color: '#e0e0e0', marginBottom: '8px', boxSizing: 'border-box' },
  btn:     { padding: '8px 16px', background: '#7c3aed', border: 'none', borderRadius: '4px', color: '#fff', cursor: 'pointer', marginRight: '8px', marginBottom: '8px' },
  btnRed:  { padding: '8px 16px', background: '#dc2626', border: 'none', borderRadius: '4px', color: '#fff', cursor: 'pointer', marginRight: '8px' },
  btnGrn:  { padding: '8px 16px', background: '#059669', border: 'none', borderRadius: '4px', color: '#fff', cursor: 'pointer', marginRight: '8px' },
  pre:     { background: '#1a1a24', padding: '12px', borderRadius: '4px', overflow: 'auto', fontSize: '12px', whiteSpace: 'pre-wrap', wordBreak: 'break-word' },
  tag:     { display: 'inline-block', padding: '2px 8px', background: '#374151', borderRadius: '12px', fontSize: '11px', marginRight: '4px' },
  msg:     { padding: '8px 12px', borderRadius: '6px', marginBottom: '8px' },
};

// ─── AI Chat ─────────────────────────────────────────────────────────────────

function AiChatTest() {
  const [messages, setMessages]     = useState([]);
  const [input, setInput]           = useState('');
  const [loading, setLoading]       = useState(false);
  const [result, setResult]         = useState('');
  const [bookmarked, setBookmarked] = useState({});
  const { transcript, listening, supported, startListening, stopListening, clearTranscript, loading: sttLoading } = useSpeechToText();

  const sendMessage = async () => {
    if (!input.trim()) return;
    const newMessages = [...messages, { role: 'user', content: input }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);
    setResult('');
    try {
      const res = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ messages: newMessages }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) { setResult(`ERROR ${res.status}: ${data.error}`); return; }
      setMessages([...newMessages, { role: 'assistant', content: data.message }]);
      setResult('OK');
    } finally {
      setLoading(false);
    }
  };

  const bookmarkMessage = async (content, index) => {
    const res = await fetch('/api/bookmarks/from-chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'same-origin',
      body: JSON.stringify({ content }),
    });
    if (res.ok) setBookmarked((b) => ({ ...b, [index]: true }));
    else setResult(`Bookmark failed: ${res.status}`);
  };

  const useVoice = () => {
    if (transcript) { setInput(transcript); clearTranscript(); stopListening(); }
    else if (listening) stopListening();
    else startListening();
  };

  return (
    <div style={s.section}>
      <h2 style={s.h2}>AI Chat  <span style={{ fontSize: '13px', color: '#9ca3af' }}>(POST /api/ai-chat)</span></h2>

      <div style={{ marginBottom: '12px' }}>
        {messages.map((m, i) => (
          <div key={i} style={{ ...s.msg, background: m.role === 'user' ? '#1e1b4b' : '#064e3b' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <strong style={{ fontSize: '11px', opacity: 0.7 }}>{m.role.toUpperCase()}</strong>
              {m.role === 'assistant' && (
                <button
                  style={{ ...s.btn, padding: '2px 8px', fontSize: '12px', background: bookmarked[i] ? '#059669' : '#7c3aed' }}
                  onClick={() => bookmarkMessage(m.content, i)}
                  disabled={bookmarked[i]}
                >
                  {bookmarked[i] ? '✓ Bookmarked' : '📌 Bookmark'}
                </button>
              )}
            </div>
            <p style={{ margin: '4px 0 0' }}>{m.content}</p>
          </div>
        ))}
      </div>

      <input style={s.input} value={input} onChange={(e) => setInput(e.target.value)}
        placeholder="Type a message…" onKeyDown={(e) => e.key === 'Enter' && sendMessage()} />

      <button style={s.btn} onClick={sendMessage} disabled={loading}>
        {loading ? 'Waiting…' : 'Send'}
      </button>

      {supported && (
        <>
          <button style={listening ? s.btnRed : s.btnGrn} onClick={useVoice} disabled={sttLoading}>
            {sttLoading ? '⌛ Transcribing...' : listening ? '⏹ Stop & Transcribe' : transcript ? '✓ Use transcript' : '🎤 Voice input'}
          </button>
          {listening && (
            <div style={{ ...s.pre, marginTop: '6px', minHeight: '40px', borderColor: '#059669' }}>
              {transcript || <span style={{ opacity: 0.4 }}>Listening… speak now</span>}
            </div>
          )}
          {!listening && transcript && (
            <div style={{ ...s.pre, marginTop: '6px' }}>{transcript}</div>
          )}
        </>
      )}
      {!supported && <span style={{ fontSize: '12px', color: '#f87171' }}>Voice not supported in this browser.</span>}

      {result && <div style={{ ...s.pre, marginTop: '8px' }}>{result}</div>}
      <button style={{ ...s.btnRed, marginTop: '8px' }} onClick={() => { setMessages([]); setResult(''); setBookmarked({}); }}>Clear chat</button>
    </div>
  );
}

// ─── Bookmarks ────────────────────────────────────────────────────────────────

function BookmarksTest() {
  const [content, setContent]     = useState('');
  const [title, setTitle]         = useState('');
  const [type, setType]           = useState('note');
  const [bookmarks, setBookmarks] = useState(null);
  const [result, setResult]       = useState('');
  const [imageBookmarkId, setImageBookmarkId] = useState('');
  const fileRef = useRef();

  const api = async (method, path, body) => {
    const opts = { method, credentials: 'same-origin', headers: body ? { 'Content-Type': 'application/json' } : {} };
    if (body) opts.body = JSON.stringify(body);
    const res = await fetch(path, opts);
    const data = await res.json().catch(() => ({}));
    return { ok: res.ok, status: res.status, data };
  };

  const createBookmark = async () => {
    const { ok, status, data } = await api('POST', '/api/bookmarks', { content, title, type });
    setResult(`POST /api/bookmarks → ${status}\n${JSON.stringify(data, null, 2)}`);
    if (ok) { setContent(''); setTitle(''); listBookmarks(); }
  };

  const listBookmarks = async () => {
    const { status, data } = await api('GET', '/api/bookmarks');
    setBookmarks(data.bookmarks || []);
    setResult(`GET /api/bookmarks → ${status}\n${JSON.stringify(data.pagination, null, 2)}`);
  };

  const deleteBookmark = async (id) => {
    const { status, data } = await api('DELETE', `/api/bookmarks/${id}`);
    setResult(`DELETE /api/bookmarks/${id} → ${status}\n${JSON.stringify(data, null, 2)}`);
    listBookmarks();
  };

  const uploadImage = async () => {
    if (!imageBookmarkId || !fileRef.current?.files[0]) {
      setResult('Set a bookmark ID and choose a file first.'); return;
    }
    const form = new FormData();
    form.append('file', fileRef.current.files[0]);
    const res = await fetch(`/api/bookmarks/image?bookmarkId=${imageBookmarkId}`, {
      method: 'POST', credentials: 'same-origin', body: form,
    });
    const data = await res.json().catch(() => ({}));
    setResult(`POST /api/bookmarks/image → ${res.status}\n${JSON.stringify(data, null, 2)}`);
    listBookmarks();
  };

  return (
    <div style={s.section}>
      <h2 style={s.h2}>Bookmarks  <span style={{ fontSize: '13px', color: '#9ca3af' }}>(CRUD + image upload)</span></h2>

      <h3 style={s.h3}>Create</h3>
      <input style={s.input} placeholder="Title (optional)" value={title} onChange={(e) => setTitle(e.target.value)} />
      <textarea style={{ ...s.input, height: '80px', resize: 'vertical' }} placeholder="Content (required)"
        value={content} onChange={(e) => setContent(e.target.value)} />
      <select style={{ ...s.input, width: 'auto', marginRight: '8px' }} value={type} onChange={(e) => setType(e.target.value)}>
        <option value="note">note</option>
        <option value="ai_suggestion">ai_suggestion</option>
        <option value="resource">resource</option>
      </select>
      <button style={s.btn} onClick={createBookmark}>Create bookmark</button>

      <h3 style={{ ...s.h3, marginTop: '16px' }}>Image upload</h3>
      <input style={{ ...s.input, width: 'auto' }} placeholder="Bookmark ID" value={imageBookmarkId}
        onChange={(e) => setImageBookmarkId(e.target.value)} />
      <input ref={fileRef} type="file" accept="image/*" style={{ color: '#e0e0e0', marginBottom: '8px', display: 'block' }} />
      <button style={s.btn} onClick={uploadImage}>Upload image</button>

      <h3 style={{ ...s.h3, marginTop: '16px' }}>List</h3>
      <button style={s.btn} onClick={listBookmarks}>Fetch bookmarks</button>
      {bookmarks && bookmarks.map((b) => (
        <div key={b._id} style={{ ...s.pre, marginTop: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <span style={s.tag}>{b.type}</span>
            <strong style={{ marginLeft: '4px' }}>{b.title || '(no title)'}</strong>
            <p style={{ margin: '4px 0 0', opacity: 0.8 }}>{b.content.slice(0, 120)}{b.content.length > 120 ? '…' : ''}</p>
            <p style={{ margin: '4px 0 0', fontSize: '11px', opacity: 0.5 }}>{b._id}</p>
            {b.image?.fileId && (
              <img src={`/api/bookmarks/image/${b.image.fileId}`} alt="bookmark"
                style={{ marginTop: '8px', maxWidth: '200px', borderRadius: '4px' }} />
            )}
          </div>
          <button style={s.btnRed} onClick={() => deleteBookmark(b._id)}>Delete</button>
        </div>
      ))}

      {result && <pre style={{ ...s.pre, marginTop: '12px' }}>{result}</pre>}
    </div>
  );
}

// ─── Voice to text standalone ─────────────────────────────────────────────────

function VoiceTest() {
  const { transcript, listening, supported, startListening, stopListening, clearTranscript, loading: sttLoading } = useSpeechToText();
  return (
    <div style={s.section}>
      <h2 style={s.h2}>Voice to Text  <span style={{ fontSize: '13px', color: '#9ca3af' }}>(ElevenLabs STT)</span></h2>
      {!supported && <p style={{ color: '#f87171' }}>Not supported in this browser. MediaRecorder API required.</p>}
      {supported && (
        <>
          <button style={listening ? s.btnRed : s.btnGrn} onClick={listening ? stopListening : startListening} disabled={sttLoading}>
            {sttLoading ? '⌛ Transcribing...' : listening ? '⏹ Stop' : '🎤 Start'}
          </button>
          <button style={s.btn} onClick={clearTranscript}>Clear</button>
          <div style={{ ...s.pre, marginTop: '12px', minHeight: '60px' }}>
            {transcript || <span style={{ opacity: 0.4 }}>Transcript will appear here after stopping…</span>}
          </div>
        </>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DevTest() {
  return (
    <div style={s.page}>
      <h1 style={{ color: '#f87171', marginTop: 0 }}>⚠ DEV TEST — delete before shipping</h1>
      <p style={{ color: '#9ca3af', marginBottom: '32px' }}>
        Must be logged in — all routes require auth. Open <code>/login</code> first if you get 401s.
      </p>
      <AiChatTest />
      <BookmarksTest />
      <VoiceTest />
    </div>
  );
}

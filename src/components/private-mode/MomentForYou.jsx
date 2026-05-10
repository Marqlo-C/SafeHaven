import { useEffect, useState } from 'react';
import { Pause, Play, Quote as QuoteIcon, RefreshCw, Wind, X } from 'lucide-react';
import styles from '../../styles/MomentForYou.module.css';

const QUOTES = [
  {
    text: 'You are not what happened to you. You are what you choose to become.',
    author: 'Carl Jung',
  },
  {
    text: 'Healing takes time, and asking for help is a courageous step.',
    author: 'Mariska Hargitay',
  },
  {
    text: 'The wound is the place where the light enters you.',
    author: 'Rumi',
  },
  {
    text: 'You survived. That is everything.',
    author: 'Anonymous',
  },
  {
    text: 'You do not have to be positive all the time. It is okay to feel sad, angry, scared, or anxious.',
    author: 'Lori Deschene',
  },
  {
    text: 'Out of suffering have emerged the strongest souls.',
    author: 'Khalil Gibran',
  },
  {
    text: 'Your story is not over. The next page is yours to write.',
    author: 'Anonymous',
  },
];

const DURATIONS = {
  in: 4,
  hold: 4,
  out: 6,
};

const LABELS = {
  in: 'Breathe in',
  hold: 'Hold',
  out: 'Breathe out',
};

const NEXT_PHASE = {
  in: 'hold',
  hold: 'out',
  out: 'in',
};

export default function MomentForYou({ onClose }) {
  const [activeTab, setActiveTab] = useState('quote');

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <section
        className={styles.sheet}
        aria-label="A moment for you"
        onClick={(event) => event.stopPropagation()}
      >
        <header className={styles.header}>
          <h2>A moment for you</h2>
          <button type="button" className={styles.closeButton} onClick={onClose} aria-label="Close">
            <X aria-hidden="true" />
          </button>
        </header>

        <div className={styles.tabs} role="tablist" aria-label="Moment tools">
          <button
            type="button"
            className={`${styles.tabButton} ${activeTab === 'quote' ? styles.tabButtonActive : ''}`}
            aria-pressed={activeTab === 'quote'}
            onClick={() => setActiveTab('quote')}
          >
            <QuoteIcon aria-hidden="true" />
            Quote
          </button>
          <button
            type="button"
            className={`${styles.tabButton} ${activeTab === 'breathe' ? styles.tabButtonActive : ''}`}
            aria-pressed={activeTab === 'breathe'}
            onClick={() => setActiveTab('breathe')}
          >
            <Wind aria-hidden="true" />
            Breathe
          </button>
        </div>

        <div className={styles.body}>
          {activeTab === 'quote' ? <QuoteView /> : <BreatheView />}
        </div>
      </section>
    </div>
  );
}

function QuoteView() {
  const [index, setIndex] = useState(() => Math.floor(Math.random() * QUOTES.length));
  const quote = QUOTES[index];

  const nextQuote = () => {
    setIndex((current) => (current + 1) % QUOTES.length);
  };

  useEffect(() => {
    const timer = window.setInterval(nextQuote, 9000);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <div>
      <article className={styles.quoteCard}>
        <QuoteIcon className={styles.quoteMark} aria-hidden="true" />
        <div key={quote.text} className={styles.quoteTextWrap}>
          <p>&quot;{quote.text}&quot;</p>
          <span>- {quote.author}</span>
        </div>
      </article>

      <button type="button" className={styles.primaryButton} onClick={nextQuote}>
        <RefreshCw aria-hidden="true" />
        Another one
      </button>
    </div>
  );
}

function BreatheView() {
  const [running, setRunning] = useState(false);
  const [phase, setPhase] = useState('in');
  const [secondsLeft, setSecondsLeft] = useState(DURATIONS.in);
  const [cycles, setCycles] = useState(0);

  useEffect(() => {
    if (!running) return undefined;

    const timer = window.setTimeout(() => {
      if (secondsLeft > 1) {
        setSecondsLeft((current) => current - 1);
        return;
      }

      const nextPhase = NEXT_PHASE[phase];
      setPhase(nextPhase);
      setSecondsLeft(DURATIONS[nextPhase]);
      if (nextPhase === 'in') {
        setCycles((current) => current + 1);
      }
    }, 1000);

    return () => window.clearTimeout(timer);
  }, [running, phase, secondsLeft]);

  const reset = () => {
    setRunning(false);
    setPhase('in');
    setSecondsLeft(DURATIONS.in);
    setCycles(0);
  };

  const scale = phase === 'out' ? 0.58 : 1;
  const duration = phase === 'out' ? DURATIONS.out : phase === 'in' ? DURATIONS.in : 0.35;

  return (
    <div>
      <div className={styles.breatheCard}>
        <div
          className={styles.breatheCircle}
          style={{
            '--breath-scale': running ? scale : 0.7,
            '--breath-duration': `${duration}s`,
          }}
        >
          <span className={styles.breatheRingOuter} aria-hidden="true" />
          <span className={styles.breatheRingInner} aria-hidden="true" />
          <div className={styles.breatheCenter}>
            <span>{running ? LABELS[phase] : 'Ready when you are'}</span>
            <strong>{running ? secondsLeft : '-'}</strong>
          </div>
        </div>

        <p className={styles.breatheMeta}>
          {cycles > 0
            ? `${cycles} cycle${cycles === 1 ? '' : 's'} completed`
            : '4 in - 4 hold - 6 out'}
        </p>
      </div>

      <div className={styles.breatheActions}>
        <button
          type="button"
          className={styles.primaryButton}
          onClick={() => setRunning((current) => !current)}
        >
          {running ? <Pause aria-hidden="true" /> : <Play aria-hidden="true" />}
          {running ? 'Pause' : 'Start'}
        </button>
        <button type="button" className={styles.secondaryButton} onClick={reset}>
          <RefreshCw aria-hidden="true" />
          Reset
        </button>
      </div>
    </div>
  );
}

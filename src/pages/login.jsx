import Head from 'next/head';
import { useState } from 'react';
import { useRouter } from 'next/router';
import PanicExit from '../components/PanicExit';
import styles from '../styles/Login.module.css';

export default function LoginPage() {
  const router = useRouter();
  const returnTo = router.query.returnTo || '/app/calculator';

  const [mode, setMode] = useState('login');
  const [fields, setFields] = useState({ username: '', password: '', duressPassword: '' });
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [loading, setLoading] = useState(false);

  const update = (e) => {
    setFields((f) => ({ ...f, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setNotice('');

    try {
      if (mode === 'register') {
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'same-origin',
          body: JSON.stringify({
            username: fields.username,
            password: fields.password,
            ...(fields.duressPassword ? { duressPassword: fields.duressPassword } : {}),
          }),
        });
        const data = await res.json();
        if (!res.ok) { setError(data.error || 'Registration failed.'); return; }

        // Auto-sign in after registration.
        setNotice('Account created — signing you in…');
        setMode('login');
      }

      // Login (also runs after successful registration above).
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ username: fields.username, password: fields.password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Sign in failed.'); return; }

      // Cookie is set server-side. Navigate into the app.
      router.replace(returnTo);
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const switchMode = () => {
    setMode((m) => (m === 'login' ? 'register' : 'login'));
    setError('');
    setNotice('');
  };

  return (
    <>
      <Head>
        <title>{mode === 'login' ? 'Sign in' : 'Create account'}</title>
        <meta name="robots" content="noindex, nofollow" />
        <meta name="referrer" content="no-referrer" />
        <meta name="format-detection" content="telephone=no, date=no, email=no, address=no" />
      </Head>

      <div className={styles.page}>
        <main className={styles.main}>
          <form onSubmit={handleSubmit} className={styles.form} autoComplete="off">
            <h1 className={styles.heading}>
              {mode === 'login' ? 'Sign in' : 'Create account'}
            </h1>

            {notice && <p className={styles.notice}>{notice}</p>}
            {error  && <p className={styles.error}>{error}</p>}

            <div className={styles.field}>
              <label htmlFor="username" className={styles.label}>Username</label>
              <input
                id="username"
                name="username"
                type="text"
                value={fields.username}
                onChange={update}
                className={styles.input}
                autoComplete="off"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                required
              />
            </div>

            <div className={styles.field}>
              <label htmlFor="password" className={styles.label}>Password</label>
              <input
                id="password"
                name="password"
                type="password"
                value={fields.password}
                onChange={update}
                className={styles.input}
                autoComplete="new-password"
                required
              />
            </div>

            {mode === 'register' && (
              <div className={styles.field}>
                <label htmlFor="duressPassword" className={styles.label}>
                  Safety password{' '}
                  <span className={styles.optional}>(optional)</span>
                </label>
                <p className={styles.hint}>
                  A second password that activates a discreet safe view when used to sign in.
                  Must differ from your primary password.
                </p>
                <input
                  id="duressPassword"
                  name="duressPassword"
                  type="password"
                  value={fields.duressPassword}
                  onChange={update}
                  className={styles.input}
                  autoComplete="new-password"
                />
              </div>
            )}

            <button type="submit" className={styles.submit} disabled={loading}>
              {loading
                ? 'Please wait…'
                : mode === 'login'
                ? 'Sign in'
                : 'Create account'}
            </button>

            <button type="button" className={styles.toggle} onClick={switchMode}>
              {mode === 'login' ? 'Create an account' : 'Back to sign in'}
            </button>
          </form>
        </main>
      </div>

      <PanicExit />
    </>
  );
}

// Redirect to app if already authenticated.
export async function getServerSideProps(context) {
  const token = context.req.cookies?.auth_token;
  if (token) {
    try {
      const jwt = require('jsonwebtoken');
      const config = require('../config/config');
      jwt.verify(token, config.env.JWT_SECRET);
      return { redirect: { destination: '/app/calculator', permanent: false } };
    } catch {
      // Invalid token — show login page normally.
    }
  }
  return { props: {} };
}

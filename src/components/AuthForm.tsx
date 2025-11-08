
'use client';

import { useState, useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import styles from './AuthForm.module.css';

interface AuthFormProps {
  onClose: () => void;
}

export default function AuthForm({ onClose }: AuthFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, signUp, requestPasswordReset } = useAuth();
  const [tab, setTab] = useState<'signin' | 'signup' | 'reset'>('signin');
  const [showPw, setShowPw] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  const emailValid = useMemo(() => /.+@.+\..+/.test(email), [email]);
  const pwStrength = useMemo(() => {
    if (tab === 'reset') return 0;
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    return score; // 0-4
  }, [password, tab]);

  const strengthClass = pwStrength <= 1 ? styles.strWeak : pwStrength === 2 ? styles.strMed : styles.strStrong;

  const validateCommon = () => {
    const errs: string[] = [];
    if (!emailValid) errs.push('Enter a valid email.');
    if (tab !== 'reset' && password.length < 8) errs.push('Password must be at least 8 chars.');
    setErrors(errs);
    return errs.length === 0;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    if (!validateCommon()) { setLoading(false); return; }
    const { error } = await login(email, password);
    if (error) {
      setMessage(error.message);
    } else {
      setMessage('Signed in.');
      onClose();
    }
    setLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    if (!validateCommon()) { setLoading(false); return; }
    const { error } = await signUp(email, password);
    if (error) {
      setMessage(error.message);
    } else {
      setMessage('Account created. Please check your email to confirm.');
      // keep modal open briefly; then switch to sign-in
      setTab('signin');
    }
    setLoading(false);
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    const { error } = await requestPasswordReset(email);
    if (error) {
      setMessage(error.message);
    } else {
      setMessage('Reset email sent. Please check your inbox.');
      // Keep on reset tab so user sees the message
    }
    setLoading(false);
  };

  return (
    <div className={styles.wrap} id="auth-form">
      <div className={styles.header}>
        <h3 className={styles.title}>Account Access</h3>
        <button type="button" className={styles.closeBtn} onClick={onClose} aria-label="Close">×</button>
      </div>
      <div className={styles.tabs} role="tablist" aria-label="Authentication tabs">
        <button role="tab" aria-selected={tab === 'signin'} className={`${styles.tab}`} onClick={() => setTab('signin')}>Sign In</button>
        <button role="tab" aria-selected={tab === 'signup'} className={`${styles.tab}`} onClick={() => setTab('signup')}>Sign Up</button>
        <button role="tab" aria-selected={tab === 'reset'} className={`${styles.tab}`} onClick={() => setTab('reset')}>Reset</button>
      </div>
      <div className={styles.body}>
        {tab === 'signin' && <p className={styles.hint}>Sign in with your email and password.</p>}
        {tab === 'signup' && <p className={styles.hint}>Create a new account. Strong passwords help keep you safe.</p>}
        {tab === 'reset' && <p className={styles.hint}>Enter your email and we’ll send a password reset link.</p>}

        <form className={styles.form} onSubmit={tab === 'signin' ? handleLogin : tab === 'signup' ? handleSignUp : handleReset}>
          <div className={styles.field}>
            <label htmlFor="auth-email" className={styles.label}>Email</label>
              <input
              type="email"
              id="auth-email"
              className={styles.input}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
                aria-invalid={(!emailValid && email.length > 3) ? true : undefined}
            />
            {!emailValid && email.length > 3 && <span className={styles.error}>Enter a valid email.</span>}
          </div>

          {tab !== 'reset' && (
            <div className={styles.field}>
              <label htmlFor="auth-password" className={styles.label}>Password</label>
              <div className={styles.inputRow}>
                <input
                  type={showPw ? 'text' : 'password'}
                  id="auth-password"
                  className={styles.input}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder={tab === 'signup' ? 'At least 8 characters' : 'Your password'}
                  aria-invalid={(password.length > 0 && password.length < 8) ? 'true' : undefined}
                />
                <button type="button" className={styles.toggleEye} aria-label={showPw ? 'Hide password' : 'Show password'} onClick={() => setShowPw(p => !p)}>
                  {showPw ? '🙈' : '👁️'}
                </button>
              </div>
              <div className={styles.strength} aria-hidden="false">
                <div className={`${styles.strengthFill} ${strengthClass} ${styles[`pw${pwStrength}`]}`} />
              </div>
              {tab === 'signin' && (
                <button type="button" className={styles.linkBtn} onClick={() => setTab('reset')}>Forgot password?</button>
              )}
            </div>
          )}

          {errors.map((e,i) => <div key={i} className={styles.error}>{e}</div>)}
          {message && <p className={message.startsWith('Reset') || message.startsWith('Account') ? styles.success : styles.error}>{message}</p>}

          <div className={styles.actions}>
            <div className={styles.leftLinks}>
              {tab !== 'signin' && <button type="button" className={styles.linkBtn} onClick={() => setTab('signin')}>Sign In</button>}
              {tab !== 'signup' && <button type="button" className={styles.linkBtn} onClick={() => setTab('signup')}>Sign Up</button>}
              {tab !== 'reset' && <button type="button" className={styles.linkBtn} onClick={() => setTab('reset')}>Reset</button>}
            </div>
            <div className={styles.actionButtonsRow}>
              <button type="button" className={styles.cancel} onClick={onClose}>Cancel</button>
              {tab === 'signin' && <button type="submit" className={styles.primary} disabled={loading || !emailValid || password.length < 8}>{loading ? 'Signing…' : 'Sign In'}</button>}
              {tab === 'signup' && <button type="submit" className={styles.primary} disabled={loading || !emailValid || password.length < 8}>{loading ? 'Creating…' : 'Create Account'}</button>}
              {tab === 'reset' && <button type="submit" className={styles.primary} disabled={loading || !emailValid}>{loading ? 'Sending…' : 'Send Link'}</button>}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

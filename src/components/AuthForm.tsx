
'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';

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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
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
    <div id="auth-form">
      <div className="modal-header">
        <h3>Welcome</h3>
        <button type="button" className="modal-close" onClick={onClose} aria-label="Close">&times;</button>
      </div>
      <div className="modal-body">
        <div className="tabs mb-quarter">
          <button className={`btn ${tab === 'signin' ? 'btn-primary' : ''}`} onClick={() => setTab('signin')}>Sign In</button>
          <button className={`btn ${tab === 'signup' ? 'btn-primary' : ''}`} onClick={() => setTab('signup')}>Sign Up</button>
          <button className={`btn ${tab === 'reset' ? 'btn-primary' : ''}`} onClick={() => setTab('reset')}>Reset</button>
        </div>
        {tab === 'signin' && <p>Sign in with your email and password.</p>}
        {tab === 'signup' && <p>Create a new account with your email and password.</p>}
        {tab === 'reset' && <p>Enter your email and we’ll send you a password reset link.</p>}

        <div className="form-group">
          <label htmlFor="auth-email">Email</label>
          <input
            type="email"
            id="auth-email"
            className="form-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="you@example.com"
          />
        </div>

        {tab !== 'reset' && (
          <div className="form-group">
            <label htmlFor="auth-password">Password</label>
            <input
              type="password"
              id="auth-password"
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Your password"
            />
            {tab === 'signin' && (
              <button className="btn btn-link" type="button" onClick={() => setTab('reset')}>Forgot password?</button>
            )}
          </div>
        )}

        {message && <p className="message">{message}</p>}
      </div>
      <div className="modal-actions">
        <button type="button" className="btn" onClick={onClose}>Cancel</button>
        {tab === 'signin' && (
          <button type="button" className="btn btn-primary" onClick={handleLogin} disabled={loading}>
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        )}
        {tab === 'signup' && (
          <button type="button" className="btn btn-primary" onClick={handleSignUp} disabled={loading}>
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>
        )}
        {tab === 'reset' && (
          <button type="button" className="btn btn-primary" onClick={handleReset} disabled={loading || !email}>
            {loading ? 'Sending…' : 'Send reset link'}
          </button>
        )}
      </div>
    </div>
  );
}


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
  const { login } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    const { error } = await login(email, password);
    if (error) {
      setMessage(error.message);
    } else {
      setMessage('Check your email for confirmation!');
      onClose();
    }
    setLoading(false);
  };

  return (
    <form id="auth-form" onSubmit={handleLogin}>
      <div className="modal-header">
        <h3>Login / Sign Up</h3>
        <button type="button" className="modal-close" onClick={onClose} aria-label="Close">&times;</button>
      </div>
      <div className="modal-body">
        <p>Enter your email and password to sign up or sign in.</p>
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
        </div>
        {message && <p className="message">{message}</p>}
      </div>
      <div className="modal-actions">
        <button type="button" className="btn" onClick={onClose}>Cancel</button>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Signing Up...' : 'Sign Up'}
        </button>
      </div>
    </form>
  );
}

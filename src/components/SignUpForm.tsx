'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';

export default function SignUpForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    const { error } = await login(email, password);
    if (error) {
      setMessage(error.message);
    } else {
      setMessage('Check your email for confirmation!');
    }
    setLoading(false);
  };

  return (
    <div className="signup-form">
      <h2>Join The Community</h2>
      <p>Sign up to participate in discussions and connect with others.</p>
      <form onSubmit={handleSignUp}>
        <div className="form-group">
          <label htmlFor="signup-email">Email</label>
          <input
            type="email"
            id="signup-email"
            className="form-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="you@example.com"
          />
        </div>
        <div className="form-group">
          <label htmlFor="signup-password">Password</label>
          <input
            type="password"
            id="signup-password"
            className="form-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="Your password"
          />
        </div>
        {message && <p className="message">{message}</p>}
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Signing Up...' : 'Sign Up'}
        </button>
      </form>
    </div>
  );
}
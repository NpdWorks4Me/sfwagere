'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';

export default function ResetPasswordPage() {
  const { user, updatePassword } = useAuth();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [status, setStatus] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [isRecovery, setIsRecovery] = useState(false);

  // Detect recovery mode via URL fragment (Supabase sends type=recovery with access token)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash;
      if (hash.includes('type=recovery')) {
        setIsRecovery(true);
      }
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      setStatus('Password must be at least 8 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setStatus('Passwords do not match.');
      return;
    }
    setSubmitting(true);
    setStatus('');
    const { error } = await updatePassword(newPassword);
    if (error) {
      setStatus(error.message);
    } else {
      setStatus('Password updated. You can close this tab and sign in with your new password.');
      setNewPassword('');
      setConfirmPassword('');
    }
    setSubmitting(false);
  };

  return (
  <div className="container reset-container">
      <h1>Reset Password</h1>
      {!isRecovery && (
        <p>This page is used after clicking the password reset link sent to your email. If you did not arrive via that link, request a reset first.</p>
      )}
      {isRecovery && !user && (
        <p>Loading recovery session...</p>
      )}
      {(!isRecovery || user) && (
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="new-password">New Password</label>
            <input
              id="new-password"
              type="password"
              className="form-input"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={8}
            />
          </div>
          <div className="form-group">
            <label htmlFor="confirm-password">Confirm Password</label>
            <input
              id="confirm-password"
              type="password"
              className="form-input"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={8}
            />
          </div>
          {status && <p>{status}</p>}
          <button className="btn btn-primary" type="submit" disabled={submitting}>{submitting ? 'Updating…' : 'Update Password'}</button>
        </form>
      )}
    </div>
  );
}



'use client';

import { useAuth } from '@/context/AuthContext';
import { useState } from 'react';
import Modal from './Modal';
import AuthForm from './AuthForm';

export default function AuthControls() {
  const { user, logout } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  if (user) {
    return (
      <div className="auth-controls">
        <span>Welcome, {user.email}</span>
        <button onClick={() => logout()} className="btn">Logout</button>
      </div>
    );
  }

  return (
    <div className="auth-controls">
      <button onClick={() => { console.log('Login button clicked'); setIsAuthModalOpen(true); }} className="btn btn-primary">Login / Sign Up</button>
      {isAuthModalOpen && (
        <Modal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)}>
          <AuthForm onClose={() => setIsAuthModalOpen(false)} />
        </Modal>
      )}
    </div>
  );
}

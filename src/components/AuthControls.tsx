
'use client';

import { useAuth } from '@/context/AuthContext';
import { useState } from 'react';
import Skeleton from './Skeleton';
import styles from './AuthControls.module.css';
import Modal from './Modal';
import AuthForm from './AuthForm';

export default function AuthControls() {
  const { user, logout, profile, loading } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  if (loading) {
    return <div className="auth-controls"><Skeleton width={120} height={18} /></div>;
  }

  if (user) {
    const username = profile?.username || user.email?.split('@')[0] || 'You';
    return (
      <div className={`auth-controls ${styles.container}`}>
        <button className="btn" onClick={() => setMenuOpen(v => !v)} aria-haspopup="true" aria-expanded={menuOpen ? true : false}>
          <span className={styles.avatar}>{username.charAt(0)}</span>
          {username}
        </button>
        {menuOpen && (
          <div className={styles.dropdown} role="menu">
            <p className={styles.name}>{username}</p>
            <p className={styles.sub}>{user.email}</p>
            <hr />
            <button className="btn btn-link" role="menuitem" onClick={() => { logout(); setMenuOpen(false); }}>Logout</button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="auth-controls">
      <button onClick={() => { setIsAuthModalOpen(true); }} className="btn btn-primary">Login / Sign Up</button>
      {isAuthModalOpen && (
        <Modal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)}>
          <AuthForm onClose={() => setIsAuthModalOpen(false)} />
        </Modal>
      )}
    </div>
  );
}


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
  return <div className="auth-controls"><Skeleton width={36} height={36} radius={18} /></div>;
  }

  if (user) {
    const username = profile?.username || user.email?.split('@')[0] || 'You';
    return (
      <div className={`auth-controls ${styles.container}`}>
        <button
          className={styles.iconButton}
          onClick={() => setMenuOpen(v => !v)}
          aria-haspopup="true"
          aria-expanded={menuOpen ? true : false}
          aria-label={`${username} account menu`}
          title={username}
        >
          <span className={styles.avatar} aria-hidden>{username.charAt(0)}</span>
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
      <button
        onClick={() => { setIsAuthModalOpen(true); }}
        className={styles.iconButton}
        aria-label="Login or Sign Up"
        title="Login / Sign Up"
      >
        {/* User outline icon (inline SVG) */}
        <svg className={styles.icon} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      </button>
      {isAuthModalOpen && (
        <Modal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)}>
          <AuthForm onClose={() => setIsAuthModalOpen(false)} />
        </Modal>
      )}
    </div>
  );
}

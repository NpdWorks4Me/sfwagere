'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './admin-setup.module.css';

export default function AdminSetupPage() {
  const [localStatus, setLocalStatus] = useState('');
  const [supabaseStatus, setSupabaseStatus] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    // Check for existing local admin on mount
    const existing = localStorage.getItem('uas_forum_user_v1');
    if (existing) {
      const user = JSON.parse(existing);
      if (user.isModerator) {
        setLocalStatus(`✅ Admin account already exists: ${user.username}`);
      }
    }
  }, []);

  const createLocalAdmin = () => {
    const adminUser = {
      username: 'admin',
      email: 'admin@unadulting.org',
      isModerator: true,
      created: new Date().toISOString()
    };

    localStorage.setItem('uas_forum_user_v1', JSON.stringify(adminUser));
    setLocalStatus('✅ Admin account created automatically!');
  };

  const createSupabaseAdmin = async () => {
    if (!email || !password) {
      setSupabaseStatus('⚠️ Please enter both email and password');
      return;
    }
    setSupabaseStatus('ℹ️ Supabase admin creation requires server-side setup. Use local admin for now.');
  };

  return (
    <div className={styles.container}>
      <h1>🔐 Admin Profile Setup</h1>
      <p>Create an administrator account for managing your forum and blog.</p>

      <div className={styles.adminCard}>
        <h2>Local Admin Account (Demo Mode)</h2>
        <p>This creates an admin profile in your browser's local storage for immediate use.</p>
        <button onClick={createLocalAdmin} className={styles.btn}>Create Local Admin</button>
        <p>{localStatus}</p>
        {localStatus.includes('✅') && (
          <div>
            <Link href="/forum" className={styles.btn}>🚀 Go to Forum</Link>
            <Link href="/moderator" className={styles.btn}>⚡ Moderator Console</Link>
            <Link href="/blog" className={styles.btn}>📝 Blog</Link>
          </div>
        )}
      </div>

      <div className={styles.adminCard}>
        <h2>Supabase Admin Account</h2>
        <p>For production use with your Supabase database.</p>
        <div className={styles.inputGroup}>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={styles.inputField} placeholder="Admin email" />
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className={styles.inputField} placeholder="Password" />
        </div>
        <button onClick={createSupabaseAdmin} className={styles.btn}>Create Supabase Admin</button>
        <p>{supabaseStatus}</p>
      </div>

      <div className={styles.adminCard}>
        <h2>Admin Features Available:</h2>
        <ul>
          <li>✅ Moderate pending posts</li>
          <li>✅ Pin/unpin topics</li>
          <li>✅ Lock/unlock discussions</li>
          <li>✅ Delete inappropriate content</li>
          <li>✅ View moderation queue</li>
          <li>✅ Access audit logs</li>
          <li>✅ Review user reports</li>
          <li>✅ Manage forum categories</li>
        </ul>
      </div>
    </div>
  );
}

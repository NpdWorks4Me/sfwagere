'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import styles from './Header.module.css';
import AuthControls from './AuthControls';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className={styles.header}>
      <div className={styles.headerContent}>
        <Link href="/" className={styles.siteLogoLink}>
          {/* <Image src="https://twzknjvtwbxtedklclht.supabase.co/storage/v1/object/public/sfwagere/sparkylogo.svg" alt="The Unadulting Society Logo" width={32} height={32} className={styles.logoImage} /> */}
          <img src="https://twzknjvtwbxtedklclht.supabase.co/storage/v1/object/public/sfwagere/sparkylogo.svg" alt="The Unadulting Society Logo" width={32} height={32} className={styles.logoImage} />
        </Link>
    <div className={styles.titleContainer}>
      <h1 className={`${styles.siteTitle} site-title`} data-heading="tus" data-text="The Unadulting Society">
            The Unadulting Society
            </h1>
            <p className={styles.siteTagline}>A loose collective for people who don’t quite fit the scripts.</p>
        </div>
        <nav className={styles.navigation}>
          <button className={styles.menuToggle} onClick={() => setIsMenuOpen(!isMenuOpen)} aria-label="Toggle menu">
            ☰
          </button>
          <ul className={`${styles.navList} ${isMenuOpen ? styles.navListOpen : ''}`}>
            <li className={styles.navItem}><Link href="/" className={styles.navLink}>Home</Link></li>
            <li className={styles.navItem}><Link href="/blog" className={styles.navLink}>Blog</Link></li>
            <li className={styles.navItem}><Link href="/forum" className={styles.navLink}>Forum</Link></li>
            <li className={styles.navItem}><Link href="/faq" className={styles.navLink}>FAQ</Link></li>
            <li className={styles.navItem}><Link href="/join" className={styles.navLink}>Join</Link></li>
          </ul>
          <div className={styles.authRight}>
            <AuthControls />
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header;

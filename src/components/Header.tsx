import Link from 'next/link';
import styles from './Header.module.css';

const Header = () => {
  return (
    <header className={styles.header}>
      <div className={styles.headerContent}>
        <Link href="/" className={styles.siteLogoLink}>
          <img src="https://twzknjvtwbxtedklclht.supabase.co/storage/v1/object/public/sfwagere/sparkylogo.svg" alt="The Unadulting Society Logo" className={styles.logoImage} />
        </Link>
    <div className={styles.titleContainer}>
      <h1 className={`${styles.siteTitle} site-title`} data-heading="tus" data-text="The Unadulting Society">
            The Unadulting Society
            </h1>
            <p className={styles.siteTagline}>A loose collective for people who don’t quite fit the scripts.</p>
        </div>
        <nav className={styles.navigation}>
          <ul className={styles.navList}>
            <li className={styles.navItem}><Link href="/" className={styles.navLink}>Home</Link></li>
            <li className={styles.navItem}><Link href="/blog" className={styles.navLink}>Blog</Link></li>
            <li className={styles.navItem}><Link href="/forum" className={styles.navLink}>Forum</Link></li>
            <li className={styles.navItem}><Link href="/faq" className={styles.navLink}>FAQ</Link></li>
            <li className={styles.navItem}><Link href="/join" className={styles.navLink}>Join</Link></li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;

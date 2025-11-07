'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import styles from './HomePage.module.css';

const HomePageClient = () => {
  useEffect(() => {
    // (Temporarily disabled) Complex loading overlay logic removed for stability.
    // (Temporarily disabled) Easter egg modal and interactive card animation removed.
    // This leaves a no-op effect to ensure the component remains client-only without side effects.
  }, []);

  return (
    <>
      <section className={styles.contentHome}>
        {/* Scrolling Marquee */}
        <div className={styles.marquee} aria-hidden="true">
          <div className={styles.marqueeContent}>[WE BELIEVE YOU] • [YOU ARE SAFE NOW] • [THIS IS NOT A TEST] • [WE BELIEVE YOU] • [YOU ARE SAFE NOW] • [THIS IS NOT A TEST]</div>
        </div>

        {/* Blog Section Card */}
        <div className={styles.blogSectionCard}>
          <div className={styles.blogCardContainer}>
            <span className={styles.glow}></span>
            <div className={styles.inner}>
              <header className={styles.postHeader}>
                <h2 className={styles.postTitle}>Fragmented Thoughts</h2>
                <div className={styles.postMeta}>
                  <span>Latest Posts</span>
                  <span>•</span>
                  <span>The Unadulting Society</span>
                </div>
              </header>
              <p className={styles.postExcerpt}>Explore articles on trauma recovery, emotional resilience, and breaking free from survival patterns. Join our community in understanding the hidden rules our brains create to keep us safe.</p>
              <Link href="/blog" className={styles.readMore}>Explore Blog →</Link>
            </div>
          </div>
        </div>

        {/* Comfort overlay text */}
        <div className={`${styles.textOverlay} ${styles.bottomLeft}`}>the world is not right.</div>
      </section>

      {/* Easter Egg trigger and modal */}
      <button id="easter-egg" className={styles.easterEggQuestion} aria-label="About this site" title="About this site">?</button>
      <div id="about-modal" className={styles.modalOverlay} role="dialog" aria-modal="true" aria-labelledby="about-title">
        <div className={styles.modalContent}>
          <div className={styles.modalHeader}>
            <h2 id="about-title" className={styles.modalTitle}>About this space</h2>
            <button id="modal-close" className={styles.modalClose} aria-label="Close">×</button>
          </div>
          <div className={`${styles.modalBody} ${styles.aboutBody}`}>
            <p><span className={styles.scribbleUnderline}>This is a quiet, safe corner.</span> Take your time. Breathe.</p>
            <p>We believe you. You are not alone.</p>
          </div>
        </div>
      </div>

      {/* <Script src="https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/gsap.min.js" strategy="beforeInteractive" /> */}
    </>
  );
};

export default HomePageClient;

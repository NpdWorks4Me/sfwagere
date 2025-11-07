'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import Script from 'next/script';
import styles from './HomePage.module.css';

const HomePageClient = () => {
  useEffect(() => {
    // Set page attribute for styling
    document.body.setAttribute('data-page', 'home');

    // Loading screen animation
    const loadingScreen = document.getElementById('loading-screen');
    const loadingText = document.getElementById('loading-text');
    if (loadingScreen && loadingText) {
      // Lock scroll while loading overlay is visible
      const prevOverflow = document.documentElement.style.overflow;
      document.documentElement.style.overflow = 'hidden';

      const words = ["[analyzing_trauma...]", "[decrypting_memories...]", "[recalibrating_reality...]", "[finding_the_lost_child...]", "[welcome.]"];
      let wordIndex = 0;

      const interval = setInterval(() => {
        wordIndex++;
        if (wordIndex < words.length) {
          loadingText.textContent = words[wordIndex];
        } else {
          clearInterval(interval);
          loadingScreen.classList.add(styles.fadeOut);
          setTimeout(() => {
            if(loadingScreen.parentElement) {
                loadingScreen.parentElement.removeChild(loadingScreen);
            }
            // Restore scroll once loading screen is removed
            document.documentElement.style.overflow = prevOverflow;
            // Show header after loading
            document.body.classList.add('loaded');
          }, 500);
        }
      }, 2000);
    }

    // Easter egg modal
    const easterEggButton = document.getElementById('easter-egg');
    const aboutModal = document.getElementById('about-modal');
    const modalClose = document.getElementById('modal-close');

    if (easterEggButton && aboutModal && modalClose) {
      easterEggButton.addEventListener('click', () => {
        aboutModal.style.display = 'flex';
      });
      modalClose.addEventListener('click', () => {
        aboutModal.style.display = 'none';
      });
      window.addEventListener('click', (event) => {
        if (event.target === aboutModal) {
          aboutModal.style.display = 'none';
        }
      });
    }

    // Blog card animation
    const cards = document.querySelectorAll(`.${styles.blogCardContainer}`);
    const FADE_DURATION = 750;

    const updateCardProperties = (card: Element, e: MouseEvent) => {
      const rect = card.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const tiltX = dy / (rect.height / 2);
      const tiltY = -dx / (rect.width / 2);
      const angle = Math.atan2(dx, dy) * (180 / Math.PI) + 180;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const perx = (e.clientX - rect.left) / rect.width;
      const pery = (e.clientY - rect.top) / rect.height;

      (card as HTMLElement).style.setProperty('--pointer-x', `${(perx * 100).toFixed(2)}%`);
      (card as HTMLElement).style.setProperty('--pointer-y', `${(pery * 100).toFixed(2)}%`);
    };

    cards.forEach(card => {
      let fadeTimeout: NodeJS.Timeout;
      card.addEventListener('mousemove', (e) => {
        card.classList.add(styles.animating);
        clearTimeout(fadeTimeout);
        updateCardProperties(card, e as MouseEvent);
        fadeTimeout = setTimeout(() => {
          card.classList.remove(styles.animating);
        }, FADE_DURATION);
      });

      card.addEventListener('mouseleave', () => {
        card.classList.remove(styles.animating);
      });
    });

  }, []);

  return (
    <>
      {/* Loading Screen */}
      <div className={styles.loadingScreen} id="loading-screen" aria-live="polite">
        <div className={styles.word} id="loading-text">[altering_reality...]</div>
        <div className={styles.overlay}></div>
      </div>

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

      <Script src="https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/gsap.min.js" strategy="beforeInteractive" />
    </>
  );
};

export default HomePageClient;

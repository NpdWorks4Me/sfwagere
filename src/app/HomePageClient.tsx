'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import styles from './HomePage.module.css';
import ZineModal from '@/components/ZineModal';

const HomePageClient = () => {
  useEffect(() => {
    // Restore easter egg modal interactions with cleanup
    const easterEggButton = document.getElementById('easter-egg');
    const aboutModal = document.getElementById('about-modal') as HTMLElement | null;
    const modalClose = document.getElementById('modal-close');

    const openModal = () => { if (aboutModal) aboutModal.style.display = 'flex'; };
    const closeModal = () => { if (aboutModal) aboutModal.style.display = 'none'; };
    const outsideClick = (event: MouseEvent) => { if (event.target === aboutModal) closeModal(); };

    if (easterEggButton && aboutModal && modalClose) {
      easterEggButton.addEventListener('click', openModal);
      modalClose.addEventListener('click', closeModal);
      window.addEventListener('click', outsideClick);
    }

    // Restore blog card hover effect with cleanup
    const cards = Array.from(document.querySelectorAll(`.${styles.blogCardContainer}`));
    const FADE_DURATION = 750;

    const handlers: Array<{ el: Element; move: (e: Event) => void; leave: () => void; }>= [];

    const updateCardProperties = (card: Element, e: MouseEvent) => {
      const rect = card.getBoundingClientRect();
      const perx = (e.clientX - rect.left) / rect.width;
      const pery = (e.clientY - rect.top) / rect.height;
      (card as HTMLElement).style.setProperty('--pointer-x', `${(perx * 100).toFixed(2)}%`);
      (card as HTMLElement).style.setProperty('--pointer-y', `${(pery * 100).toFixed(2)}%`);
    };

    cards.forEach(card => {
      let fadeTimeout: ReturnType<typeof setTimeout> | undefined;
      const move = (e: Event) => {
        card.classList.add(styles.animating);
        if (fadeTimeout) clearTimeout(fadeTimeout);
        updateCardProperties(card, e as MouseEvent);
        fadeTimeout = setTimeout(() => { card.classList.remove(styles.animating); }, FADE_DURATION);
      };
      const leave = () => { card.classList.remove(styles.animating); };
      card.addEventListener('mousemove', move);
      card.addEventListener('mouseleave', leave);
      handlers.push({ el: card, move, leave });
    });

    return () => {
      // Cleanup modal listeners
      if (easterEggButton && aboutModal && modalClose) {
        easterEggButton.removeEventListener('click', openModal);
        modalClose.removeEventListener('click', closeModal);
        window.removeEventListener('click', outsideClick);
      }
      // Cleanup card listeners
      handlers.forEach(({ el, move, leave }) => {
        el.removeEventListener('mousemove', move);
        el.removeEventListener('mouseleave', leave);
      });
    };
  }, []);

  return (
    <>
      <section className={styles.contentHome}>
        {/* Zine trigger */}
        <div className={styles.zineTriggerWrap}>
          <ZineModal />
        </div>
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

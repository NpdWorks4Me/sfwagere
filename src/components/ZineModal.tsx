'use client';

import { useState, useEffect, useRef } from 'react';
import styles from './ZineModal.module.css';

interface ZineModalProps {
  autoOpen?: boolean;
}

// A distressed / photocopy styled modal for homepage "zine" content.
// Accessible: focus trap, ESC close, returns focus to trigger.
export default function ZineModal({ autoOpen = false }: ZineModalProps) {
  const [open, setOpen] = useState(autoOpen);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);

  const close = () => setOpen(false);
  const openModal = () => setOpen(true);

  // Focus trap + body scroll lock
  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const firstFocusable = panelRef.current?.querySelector<HTMLElement>(
      'a[href], button, textarea, input, select, [tabindex]:not([tabindex="-1"])'
    );
    firstFocusable?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        close();
      } else if (e.key === 'Tab') {
        const container = panelRef.current;
        if (!container) return;
        const focusables = Array.from(
          container.querySelectorAll<HTMLElement>(
            'a[href], button, textarea, input, select, [tabindex]:not([tabindex="-1"])'
          )
        ).filter(el => !el.hasAttribute('disabled'));
        if (!focusables.length) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener('keydown', onKey);
      // Return focus to trigger
      triggerRef.current?.focus();
    };
  }, [open]);

  if (!open) {
    return (
      <button
        ref={triggerRef}
        className={styles.openButton}
        type="button"
        aria-haspopup="dialog"
        aria-expanded={false}
        aria-controls="zine-modal"
        onClick={openModal}
      >
        UNFUCK YOUR LIFE
      </button>
    );
  }

  return (
    <div className={styles.overlay} role="dialog" aria-modal="true" aria-labelledby="zine-title" id="zine-modal">
      <div className={styles.paper} ref={panelRef}>
        <div className={styles.headerRow}>
          <h2 id="zine-title" className={styles.title}>UNFUCK YOUR LIFE</h2>
          <button onClick={close} className={styles.closeButton} aria-label="Close zine" type="button">close</button>
        </div>

        {/* Zine content (Tailwind-free, CSS Modules) */}
        <div className={styles.zineCanvas}>
          {/* I. Title & Subtitle */}
          <header className={`${styles.section} ${styles.sectionTight}`}>
            <div className={styles.titleBlock}>
              <h1 className={`${styles.badgeTitle} ${styles.titleUnder}`}>UNFUCK YOUR LIFE BY FUCKING UP THE RULES</h1>
              <h1 className={`${styles.badgeTitle} ${styles.titleMain} ${styles.neonAccent}`}>UNFUCK YOUR LIFE BY FUCKING UP THE RULES</h1>
            </div>
            <p className={`${styles.center} ${styles.zineText} ${styles.uppercase} ${styles.subTitle}`}>A Practical Guide to Low-Stakes Defiance and Healing</p>
          </header>

          {/* II. Section 1: The Premise (The Rage) */}
          <section className={styles.section}>
            <p className={`${styles.center} ${styles.zineText} ${styles.bold} ${styles.uppercase} ${styles.mb6}`}>
              YOUR ANGER IS A WEAPON. YOUR VOICE IS A SHIELD. CONFORMITY IS A CAGE BUILT BY THE COMFORT OF OTHERS. <span className={`${styles.neonAccent} ${styles.neonPulse}`}>SHATTER IT.</span>
            </p>
            <div className={`${styles.pixelFrame} ${styles.sectionTight}`}>
              <p className={`${styles.mono} ${styles.zineText}`}>
                <span className={`${styles.bold} ${styles.neonAccent}`}>WARNING:</span> Arbitrary rules are psychological handcuffs. This is therapy by rebellion. We start small, but we start now.
              </p>
            </div>
          </section>

          <hr className={styles.jaggedSeparator} />

          {/* III. Section 2: The Process */}
          <section className={styles.section}>
            <h2 className={`${styles.center} ${styles.heading2} ${styles.mb8}`}>THE PROCESS: 3 STEPS TO DEFIANCE</h2>
            <div className={styles.spaceY}>
              {/* Step 1 */}
              <div className={`${styles.row} ${styles.leftBorder}`}>
                <div className="icons-wrapper">
                  <svg className={styles.icons} width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                    <line x1="12" y1="9" x2="12" y2="13"/>
                    <line x1="12" y1="17" x2="12.01" y2="17"/>
                  </svg>
                </div>
                <div>
                  <h3 className={`${styles.mono} ${styles.bold} ${styles.uppercase} ${styles.neonAccent} ${styles.mb1}`}>STEP 1: IDENTIFY THE WIRES</h3>
                  <p className={`${styles.mono} ${styles.zineText}`}>
                    Find the <span className={styles.bold}>Friction</span>. Note every micro-annoyance today that made you feel small, forced, or fake. That feeling is the wire. Don’t judge it. Just see it. 
                    <span className={`${styles.neonAccent} ${styles.bold}`}> // THE CATCH:</span> The rule feels natural because it was installed early. The anxiety is proof it's working.
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className={`${styles.row} ${styles.leftBorder}`}>
                <div className="icons-wrapper">
                  <svg className={styles.icons} width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/>
                  </svg>
                </div>
                <div>
                  <h3 className={`${styles.mono} ${styles.bold} ${styles.uppercase} ${styles.neonAccent} ${styles.mb1}`}>STEP 2: DEFY THE NARRATIVE</h3>
                  <p className={`${styles.mono} ${styles.zineText}`}>
                    <span className={styles.bold}>Refuse the Response</span>. You feel the impulse to comply, apologize, or smile. This time, hold your peace. Let the silence hang. Let the internal cringe happen. 
                    <span className={`${styles.neonAccent} ${styles.bold}`}> // THE CATCH:</span> Compliance is a muscle memory. You must interrupt the physical impulse, not just the thought.
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className={`${styles.row} ${styles.leftBorder}`}>
                <div className="icons-wrapper">
                  <svg className={styles.icons} width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M12 2v10"/>
                    <path d="M18.36 5.64A9 9 0 1 1 5.64 18.36 9 9 0 0 1 18.36 5.64z"/>
                  </svg>
                </div>
                <div>
                  <h3 className={`${styles.mono} ${styles.bold} ${styles.uppercase} ${styles.neonAccent} ${styles.mb1}`}>STEP 3: RECLAIM THE REALITY</h3>
                  <p className={`${styles.mono} ${styles.zineText}`}>
                    <span className={styles.bold}>Burn the Script</span>. The rule is only real if you agree to it. You don't. Replace the expectation with a choice that is genuinely yours. 
                    <span className={`${styles.neonAccent} ${styles.bold}`}> // THE CATCH:</span> Do not seek approval for your new choice. The reward is the absence of obligation, not external validation.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <hr className={styles.jaggedSeparator} />

          {/* IV. Catalog */}
          <section className={styles.section}>
            <h2 className={`${styles.center} ${styles.mb6} ${styles.wider}`}>
              <span className={`${styles.neonAccent}`}>
                RULEBOOK: IGNORE ALL CONTENTS
              </span>
            </h2>

            <div>
              <div className={styles.catalogItem}>
                <h3 className={`${styles.mono} ${styles.bold} ${styles.uppercase} ${styles.neonAccent} ${styles.mb1}`}>THE ETIQUETTE COP // DON'T LAUGH AT THE JOKE IF IT’S SHIT.</h3>
                <p className={`${styles.mono} ${styles.zineText}`}>
                  <span className={`${styles.bold} ${styles.neonAccent}`}>ACTION:</span> When someone makes boring small talk or a stale joke, simply offer a flat "Yep." Do not add padding. Do not elaborate. Move on.
                </p>
              </div>

              <div className={styles.catalogItem}>
                <h3 className={`${styles.mono} ${styles.bold} ${styles.uppercase} ${styles.neonAccent} ${styles.mb1}`}>THE CONFORMITY UNIFORM // DRESS FOR YOUR MENTAL WEATHER, NOT THE OFFICE.</h3>
                <p className={`${styles.mono} ${styles.zineText}`}>
                  <span className={`${styles.bold} ${styles.neonAccent}`}>ACTION:</span> Wear the shoes that feel heavy but safe. Wear the too-big shirt. Wear the one pin that makes a statement. Let your clothes hold the line for you.
                </p>
              </div>

              <div className={styles.catalogItem}>
                <h3 className={`${styles.mono} ${styles.bold} ${styles.uppercase} ${styles.neonAccent} ${styles.mb1}`}>THE HAPPY FACE LIE // STOP THE EYE CONTACT APOLOGY TOUR.</h3>
                <p className={`${styles.mono} ${styles.zineText}`}>
                  <span className={`${styles.bold} ${styles.neonAccent}`}>ACTION:</span> When walking past strangers, look at the ground. Or look straight through them. Only hold contact if you truly want to engage. Otherwise, your eyes are your own.
                </p>
              </div>

              <div className={styles.catalogItem}>
                <h3 className={`${styles.mono} ${styles.bold} ${styles.uppercase} ${styles.neonAccent} ${styles.mb1}`}>THE TIME THIEF // ANSWER THE TEXT LATE. OR NEVER.</h3>
                <p className={`${styles.mono} ${styles.zineText}`}>
                  <span className={`${styles.bold} ${styles.neonAccent}`}>ACTION:</span> Do not let a notification dictate your breathing rhythm. Your focus is not an on-demand service. Let the anxiety spike and then let it pass.
                </p>
              </div>
            </div>
          </section>

          <hr className={styles.jaggedSeparator} />

          {/* V. Conclusion */}
          <section className={`${styles.section} ${styles.center}`}>
            <p className={`${styles.bigQuote} ${styles.neonAccent} ${styles.neonPulse} ${styles.mb6}`}>
              “THE CAGE WAS BUILT WITH YOUR OWN COMPLIANCE.”
            </p>
            <p className={`${styles.mono} ${styles.zineText} ${styles.mb8}`}>
              Every choice you make that isn’t compliance is a step back toward your own power. You made it this far, not by following, but by surviving.
            </p>
            <div>
              <img
                src="https://twzknjvtwbxtedklclht.supabase.co/storage/v1/object/public/sfwagere/sparkylogo.svg"
                alt="Sparky Logo of Defiance"
                className={styles.closingIcon}
                width={80}
                height={80}
                onError={(e) => { const t = e.currentTarget; t.style.display = 'none'; const span = document.createElement('span'); span.textContent = '// Logo asset broken //'; t.parentElement?.appendChild(span); }}
              />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

// Optional: future helper to serialize zine sections (id and text) for analytics or persistence
export function serializeZineSections(sections: Array<{ id: string; text: string }>) {
  try {
    return JSON.stringify(sections.map(s => ({ id: s.id, t: s.text })));
  } catch {
    return '[]';
  }
}

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
        UNFUCK YOUR LIFE – zine
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
        <div className={styles.body}>
          <span className={styles.sectionLabel}>introduction</span>
          <p><strong>You are not broken.</strong> Your brain wrote secret rules to keep you alive. Some still help. Some are silently shredding your bandwidth.</p>
          <p><em>This zine is a slow peel.</em> A mirror held at a safer angle. A place to name patterns without judgment.</p>

          <span className={styles.sectionLabel}>this space</span>
          <ul className={styles.list}>
            <li>No shame linguistics.</li>
            <li>No grind gospel.</li>
            <li>Thrive ≠ perform normal.</li>
            <li>Rest counts as progress.</li>
          </ul>

          <span className={styles.sectionLabel}>try</span>
          <p>Notice a survival script today. Whisper: "Thanks. I might not need you in this moment." That is rewiring. Tiny. Real.</p>

          <p className={styles.footerNote}>Draft alpha • Visuals intentionally rough / photocopy • More sections coming.</p>
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

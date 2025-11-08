
'use client';

import { ReactNode, useEffect, useRef } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
}

export default function Modal({ isOpen, onClose, children }: ModalProps) {
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    // Lock body scroll
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // Focus the first focusable element inside the modal
    const container = contentRef.current;
    if (container) {
      const focusables = container.querySelectorAll<HTMLElement>(
        'a[href], button, textarea, input, select, [tabindex]:not([tabindex="-1"])'
      );
      const first = focusables[0];
      first?.focus();
    }

    return () => {
      document.body.style.overflow = prev;
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key === 'Tab') {
        const container = contentRef.current;
        if (!container) return;
        const focusables = Array.from(
          container.querySelectorAll<HTMLElement>(
            'a[href], button, textarea, input, select, [tabindex]:not([tabindex="-1"])'
          )
        ).filter(el => !el.hasAttribute('disabled'));
        if (focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="modal show" aria-hidden="false" role="dialog" aria-modal="true">
      <div className="modal-backdrop" onClick={onClose} />
      <div className="modal-content" ref={contentRef}>
        {children}
      </div>
    </div>
  );
}

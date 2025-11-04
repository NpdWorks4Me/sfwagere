
'use client';

import { ReactNode } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
}

export default function Modal({ isOpen, onClose, children }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="modal active" aria-hidden="false">
      <div className="modal-backdrop" onClick={onClose}></div>
      <div className="modal-content">
        {children}
      </div>
    </div>
  );
}

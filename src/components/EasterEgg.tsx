"use client";
import { useState } from 'react';

export default function EasterEgg() {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ textAlign: 'center', marginTop: 8 }}>
      <button className="nav-link" onClick={() => setOpen(true)} id="easter-egg" type="button">
        About
      </button>
      <div className={`modal-overlay ${open ? 'active' : ''}`} id="about-modal" onClick={(e) => {
        if (e.currentTarget === e.target) setOpen(false);
      }}>
        <div className="modal-content" role="dialog" aria-modal="true" aria-labelledby="about-title">
          <div className="modal-header">
            <h3 className="modal-title" id="about-title">About The Unadulting Society</h3>
            <button className="modal-close" id="modal-close" aria-label="Close" onClick={() => setOpen(false)}>&times;</button>
          </div>
          <div className="modal-body about-body">
            <p>
              We’re building a friendly, no-gatekeeping resource hub and community for people who survived rough starts.
              You’re not alone. Explore posts, share in the forum, and take what helps.
            </p>
            <p>
              This site is evolving — we’re moving to a modern framework for speed, accessibility, and stability.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

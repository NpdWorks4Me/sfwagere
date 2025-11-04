"use client";

export default function FooterComfort() {
  function scrollTop() {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }
  return (
    <footer className="footer">
      <div className="copyright">© 2025 The Unadulting Society. Try not to worry.</div>
      <div className="comfort-element">
        <div className="pixel-heart" aria-hidden>
          <svg viewBox="0 0 18 18" width="28" height="28" className="heart-svg">
            <path d="M9 16s-7-4.5-7-9c0-2.5 2-4.5 4.5-4.5 1.7 0 3.2.9 4 2.2.8-1.3 2.3-2.2 4-2.2 2.5 0 4.5 2 4.5 4.5 0 4.5-7 9-7 9z" fill="#ff69b4" opacity="0.7"></path>
            <rect x="4.5" y="6.5" width="1" height="1" fill="#ff1493"></rect>
            <rect x="12.5" y="6.5" width="1" height="1" fill="#ff1493"></rect>
            <rect x="9" y="8.5" width="1" height="1" fill="#ff1493"></rect>
            <rect x="6.5" y="10.5" width="1" height="1" fill="#ff1493"></rect>
            <rect x="10.5" y="10.5" width="1" height="1" fill="#ff1493"></rect>
          </svg>
        </div>
        <div className="comfort-text">you made it this far</div>
      </div>
      <button className="scroll-indicator" onClick={scrollTop} title="Scroll to top" aria-label="Scroll to top">▲</button>
    </footer>
  );
}

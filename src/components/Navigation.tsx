"use client";
import Link from 'next/link';
import useTextResize from '../hooks/useTextResize';

export default function Navigation() {
  const { label, title, cycle } = useTextResize();
  return (
    <header className="navigation">
      <div className="nav-container">
        <nav aria-label="Main">
          <ul className="nav-list">
            <li className="nav-item"><Link className="nav-link" href="/">Home</Link></li>
            <li className="nav-item"><Link className="nav-link" href="/blog">Blog</Link></li>
            <li className="nav-item"><Link className="nav-link" href="/forum">Forum</Link></li>
            <li className="nav-item"><Link className="nav-link" href="/faq">FAQ</Link></li>
            <li className="nav-item"><Link className="nav-link" href="/join">Guidelines</Link></li>
            <li className="nav-item"><Link className="nav-link" href="/moderator">Moderator</Link></li>
            <li className="nav-item"><Link className="nav-link" href="/admin-setup">Admin Setup</Link></li>
            <li className="nav-item">
              <button id="text-resize-button" className="nav-link text-resize-button" onClick={cycle} title={title} aria-label="Change text size">
                {label}
              </button>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}

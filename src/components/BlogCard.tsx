"use client";
import Link from 'next/link';
import { useRef } from 'react';

export interface BlogCardProps {
  href: string;
  title: string;
  date?: string;
  author?: string;
  excerpt?: string;
}

export default function BlogCard({ href, title, date, author, excerpt }: BlogCardProps) {
  const ref = useRef<HTMLAnchorElement>(null);

  function onMove(e: React.MouseEvent) {
    const el = ref.current as HTMLElement | null;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const px = e.clientX;
    const py = e.clientY;
    const dx = px - cx;
    const dy = py - cy;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const max = Math.sqrt((rect.width * rect.width + rect.height * rect.height)) / 2;
    const closeness = Math.max(0, Math.min(100, 100 - (dist / max) * 100));
    const angle = (Math.atan2(dy, dx) * 180) / Math.PI; // -180..180
    el.style.setProperty('--pointer-d', `${closeness}`);
    el.style.setProperty('--pointer-\u00B0', `${angle}deg`);
  }

  function onLeave() {
    const el = ref.current as HTMLElement | null;
    if (!el) return;
    el.style.removeProperty('--pointer-d');
    el.style.removeProperty('--pointer-\u00B0');
  }

  return (
    <Link ref={ref} href={href} className="blog-card-container" onMouseMove={onMove} onMouseLeave={onLeave}>
      <div className="inner">
        <header className="post-header">
          <h3 className="post-title">{title}</h3>
          {(date || author) && (
            <div className="post-meta">
              {date && <time>{date}</time>}
              {date && author && <span aria-hidden>•</span>}
              {author && <span>{author}</span>}
            </div>
          )}
        </header>
        {excerpt && <p className="post-excerpt">{excerpt}</p>}
        <span className="read-more">Read more →</span>
      </div>
      <i aria-hidden className="glow" />
    </Link>
  );
}

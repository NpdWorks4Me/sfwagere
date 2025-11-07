'use client';

import Link from 'next/link';
import { useEffect } from 'react';

const posts = [
  {
    slug: 'two-faces-of-survival',
    title: 'The Two Faces of Survival: How Childhood Trauma Wires You to Over-Function or Over-React',
    date: '2025-10-28',
    excerpt: 'How childhood trauma splits survival into two paths: over-giving or over-reacting. Explore Internalizers vs Externalizers, BPD/NPD dynamics, ACEs, and steps to rebuild inner resilience.',
  },
  {
    slug: 'youre-not-broken-secret-rules',
    title: "You're Not Broken: The Secret Rules Your Brain Made to Keep You Safe",
    date: '2025-10-28',
    excerpt: 'Not broken—wired for survival. Understand internalizers vs externalizers, emotional neglect, dysregulation, and build inner stability with boundaries, compassion, and purpose.',
  },
];

export default function BlogIndexPage() {
  useEffect(() => {
    const cards = Array.from(document.querySelectorAll<HTMLElement>('.blog-card-container'));
    const moveHandlers = new Map<HTMLElement, (e: PointerEvent) => void>();
    const leaveHandlers = new Map<HTMLElement, (e: PointerEvent) => void>();
    cards.forEach((card) => {
      const handler = (e: PointerEvent) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        // Percent positions (kept for any radial backgrounds)
        card.style.setProperty('--pointer-x', `${(x / rect.width) * 100}%`);
        card.style.setProperty('--pointer-y', `${(y / rect.height) * 100}%`);
        // Distance/angle for glow intensity and border gradient orientation
        const cx = rect.width / 2;
        const cy = rect.height / 2;
        const dx = x - cx;
        const dy = y - cy;
        const dist = Math.hypot(dx, dy);
        const max = Math.hypot(rect.width, rect.height) / 2;
        const closeness = Math.max(0, Math.min(100, 100 - (dist / max) * 100));
        const angle = (Math.atan2(dy, dx) * 180) / Math.PI; // -180..180
        card.style.setProperty('--pointer-d', `${closeness}`);
        card.style.setProperty('--pointer-\u00B0', `${angle}deg`);
      };
      const leave = () => {
        card.style.removeProperty('--pointer-x');
        card.style.removeProperty('--pointer-y');
        card.style.removeProperty('--pointer-d');
        card.style.removeProperty('--pointer-\u00B0');
      };
      moveHandlers.set(card, handler);
      leaveHandlers.set(card, leave);
      card.addEventListener('pointermove', handler);
      card.addEventListener('pointerleave', leave);
    });
    return () => {
      cards.forEach((card) => {
        const mh = moveHandlers.get(card);
        if (mh) card.removeEventListener('pointermove', mh);
        const lh = leaveHandlers.get(card);
        if (lh) card.removeEventListener('pointerleave', lh);
      });
    };
  }, []);

  return (
    <main className="main-content" id="latest">
      <section className="section-content blog-section">
        <header className="section-header">
          <h3 className="glitch-title" data-text="FRAGMENTED THOUGHTS">FRAGMENTED THOUGHTS</h3>
          <p className="section-tagline">blog • current events • fragments</p>
        </header>
        <div className="blog-posts-container">
          {posts.map((post) => (
            <div key={post.slug} className="blog-card-container" itemScope itemType="https://schema.org/BlogPosting">
              <span className="glow"></span>
              <div className="inner">
                <header className="post-header">
                  <h2 className="post-title" itemProp="headline">{post.title}</h2>
                  <div className="post-meta">
                    <time itemProp="datePublished" dateTime={post.date}>{new Date(post.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</time>
                    <span>•</span>
                    <span itemProp="author" itemScope itemType="https://schema.org/Person"><span itemProp="name">The Unadulting Society</span></span>
                  </div>
                </header>
                <p className="post-excerpt" itemProp="abstract">{post.excerpt}</p>
                <Link href={`/posts/${post.slug}`} className="read-more">Read Full Post →</Link>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

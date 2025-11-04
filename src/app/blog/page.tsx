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
    const handlers = new Map<HTMLElement, (e: PointerEvent) => void>();
    cards.forEach((card) => {
      const handler = (e: PointerEvent) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        card.style.setProperty('--pointer-x', `${(x / rect.width) * 100}%`);
        card.style.setProperty('--pointer-y', `${(y / rect.height) * 100}%`);
      };
      handlers.set(card, handler);
      card.addEventListener('pointermove', handler);
    });
    return () => {
      cards.forEach((card) => {
        const h = handlers.get(card);
        if (h) card.removeEventListener('pointermove', h);
      });
    };
  }, []);

  return (
    <main className="main-content" id="latest">
      <section className="section-content blog-section">
        <header className="section-header">
          <h2 className="glitch-title" data-text="FRAGMENTED THOUGHTS">FRAGMENTED THOUGHTS</h2>
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

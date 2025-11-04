import Link from 'next/link';

export default function HomeBlogCTA() {
  return (
    <div className="blog-section-card">
      <Link href="/blog" className="blog-card-container">
        <span className="glow" aria-hidden />
        <div className="inner">
          <header className="post-header">
            <h2 className="post-title">Fragmented Thoughts</h2>
            <div className="post-meta">
              <span>Latest Posts</span>
              <span aria-hidden>•</span>
              <span>The Unadulting Society</span>
            </div>
          </header>
          <p className="post-excerpt">Explore articles on trauma recovery, emotional resilience, and breaking free from survival patterns. Join our community in understanding the hidden rules our brains create to keep us safe.</p>
          <span className="read-more">Explore Blog →</span>
        </div>
      </Link>
    </div>
  );
}

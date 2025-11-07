import Skeleton from '@/components/Skeleton';

export default function BlogLoading() {
  return (
    <main className="main-content" id="latest">
      <section className="section-content blog-section">
        <header className="section-header">
          <h3 className="glitch-title" data-text="FRAGMENTED THOUGHTS">FRAGMENTED THOUGHTS</h3>
          <p className="section-tagline">blog • current events • fragments</p>
        </header>
        <div className="blog-posts-container blog-skeleton">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="blog-card-skeleton">
              <div className="sk-title"><Skeleton width={320} height={20} /></div>
              <div className="sk-meta"><Skeleton width={180} height={14} /></div>
              <div className="sk-lines">
                <div className="sk-line"><Skeleton width={520} height={12} /></div>
                <div className="sk-line"><Skeleton width={480} height={12} /></div>
                <div className="sk-line"><Skeleton width={500} height={12} /></div>
              </div>
              <div className="sk-cta"><Skeleton width={140} height={14} /></div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

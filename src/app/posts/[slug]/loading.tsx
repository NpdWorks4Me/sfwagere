import Skeleton from '@/components/Skeleton';

export default function PostLoading() {
  return (
    <main className="main-content">
      <section className="section-content blog-section">
        <div className="blog-posts-container post-skeleton">
          <div className="post-layout">
            <article>
              <div className="sk-title"><Skeleton width={420} height={30} /></div>
              <div className="sk-meta"><Skeleton width={240} height={16} /></div>
              <div className="sk-body">
                {Array.from({ length: 10 }).map((_, i) => (
                  <div key={i} className="sk-line"><Skeleton width={Math.round(400 + Math.random()*150)} height={14} /></div>
                ))}
              </div>
            </article>
            <aside className="toc-aside">
              <div className="sk-toc-title"><Skeleton width={160} height={18} /></div>
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="sk-toc-line"><Skeleton width={140 - i*10} height={12} /></div>
              ))}
            </aside>
          </div>
        </div>
      </section>
    </main>
  );
}

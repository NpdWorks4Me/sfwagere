import NextDynamic from 'next/dynamic';
import { createClient } from '@supabase/supabase-js';
import { renderMarkdownServer } from '@/utils/markdown-server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const TopicPageClient = NextDynamic(() => import('./TopicPageClient'), { ssr: false });

async function getTopic(id: string) {
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
  const { data, error } = await supabase
    .from('topics')
    .select('id, title, body, is_pinned, is_locked, content_warning, content_warning_text, created_at, updated_at, categories!category_id(id, slug, name), profiles!author_id(username, role)')
    .eq('id', id)
    .single();
  if (error) return null;
  return data as any;
}

export default async function TopicPage({ params }: { params: { id: string } }) {
  const topic = params.id ? await getTopic(params.id) : null;
  const bodyHtml = topic ? renderMarkdownServer(topic.body || '') : '';
  const canonicalUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://example.com'}/forum/topic/${params.id}`;
  return (
    <div className="section-content">
      {topic ? (
        <>
          <header className="topic-header">
            <h1 className="glitch-title" data-text={topic.title}>{topic.title}</h1>
            <div className="topic-meta">
              {topic.categories && <span className="badge category">{topic.categories.name}</span>}
              {topic.is_pinned && <span className="badge pin">Pinned</span>}
              {topic.is_locked && <span className="badge lock">Locked</span>}
              <span className="subtle">Updated {new Date(topic.updated_at).toLocaleString()}</span>
            </div>
            {topic.content_warning && (
              <div className="content-warning">
                ⚠ Content warning: {topic.content_warning_text || 'Sensitive content'}
              </div>
            )}
          </header>
          <article className="post-item mb-one">
            <div className="post-author">{topic.profiles?.username || 'Anonymous'}</div>
            <div className="post-time">{new Date(topic.created_at).toLocaleString()}</div>
            <div className="post-body" dangerouslySetInnerHTML={{ __html: bodyHtml }} />
          </article>
          <link rel="canonical" href={canonicalUrl} />
          <meta property="og:type" content="article" />
          <meta property="og:title" content={topic.title} />
          <meta property="og:url" content={canonicalUrl} />
          <meta name="description" content={String(topic.body).slice(0,160)} />
          <meta property="og:description" content={String(topic.body).slice(0,160)} />
        </>
      ) : (
        <p>Loading topic…</p>
      )}
      {/* Client-side replies, report modal, and actions */}
      <TopicPageClient />
    </div>
  );
}

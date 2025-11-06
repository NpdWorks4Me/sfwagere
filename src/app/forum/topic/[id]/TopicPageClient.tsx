"use client";

import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import { forumApi } from '@/lib/supabase/forumApi';
import { useAuth } from '@/context/AuthContext';

type Topic = {
  id: number;
  title: string;
  body: string;
  is_pinned: boolean;
  is_locked: boolean;
  content_warning: boolean;
  content_warning_text: string | null;
  created_at: string;
  updated_at: string;
  categories: { id: number; slug: string; name: string } | null;
  profiles: { username: string; role: string } | null;
};

type Post = {
  id: number;
  body: string;
  created_at: string;
  profiles: { username: string; role: string } | null;
};

export default function TopicPageClient() {
  const params = useParams();
  const topicId = useMemo(() => Number(params?.id), [params]);
  const { user } = useAuth();

  const [topic, setTopic] = useState<Topic | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reply, setReply] = useState('');
  const [posting, setPosting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      if (!topicId) return;
      setLoading(true);
      const [t, terr] = await forumApi.getTopic(topicId);
      if (!cancelled) {
        if (terr) setError(terr.message);
        else setTopic(t as any);
      }
      const [p, perr] = await forumApi.listPosts({ topicId });
      if (!cancelled) {
        if (perr) setError(perr.message);
        else setPosts((p as any) || []);
        setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [topicId]);

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setError('You must be logged in to reply.');
      return;
    }
    if (!reply.trim()) return;
    setPosting(true);
    setError(null);
    const [data, err] = await forumApi.createPost({ topic_id: topicId, body: reply.trim() });
    if (err) {
      setError(err.message);
    } else {
      setReply('');
      // Refresh posts
      const [p] = await forumApi.listPosts({ topicId });
      setPosts((p as any) || []);
    }
    setPosting(false);
  };

  if (loading) return <div className="section-content"><p>Loading topic…</p></div>;
  if (error) return <div className="section-content"><p className="error-message">{error}</p></div>;
  if (!topic) return <div className="section-content"><p>Topic not found.</p></div>;

  return (
    <div className="section-content">
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

      <div className="posts-list">
        {posts.map((p) => (
          <article key={p.id} className="post-item">
            <div className="post-author">{p.profiles?.username || 'Anonymous'}</div>
            <div className="post-time">{new Date(p.created_at).toLocaleString()}</div>
            <div className="post-body" dangerouslySetInnerHTML={{ __html: p.body.replace(/\n/g, '<br/>') }} />
          </article>
        ))}
        {posts.length === 0 && <p>No replies yet. Be the first to respond.</p>}
      </div>

      {!topic.is_locked && (
        <form onSubmit={handleReply} className="reply-form">
          <label htmlFor="reply-body" className="form-label">Your reply</label>
          <textarea
            id="reply-body"
            className="form-textarea enhanced-textarea"
            rows={6}
            placeholder={user ? 'Share your thoughts…' : 'Sign in to reply'}
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            disabled={!user || posting}
          />
          {error && <p className="error-message">{error}</p>}
          <div className="form-actions">
            <button type="submit" className="btn btn-primary" disabled={!user || posting || !reply.trim()}>
              {posting ? 'Posting…' : 'Post Reply'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

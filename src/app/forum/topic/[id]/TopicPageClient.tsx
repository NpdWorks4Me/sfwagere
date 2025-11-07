"use client";

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { forumApi } from '@/lib/supabase/forumApi';
import { useAuth } from '@/context/AuthContext';
import { renderMarkdown } from '@/utils/markdown';
import Modal from '@/components/Modal';
import { allowAction } from '@/utils/rateLimit';

type Topic = {
  id: string;
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
  id: string;
  body: string;
  created_at: string;
  profiles: { username: string; role: string } | null;
};

export default function TopicPageClient() {
  const params = useParams();
  const topicId = useMemo(() => String(params?.id || ''), [params]);
  const { user } = useAuth();
  const router = useRouter();

  const [topic, setTopic] = useState<Topic | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reply, setReply] = useState('');
  const [posting, setPosting] = useState(false);
  const [reportOpen, setReportOpen] = useState<{ open: boolean, target: 'topic' | { postId: string } } | null>(null);
  const [reportReason, setReportReason] = useState('abuse');
  const [reportNotes, setReportNotes] = useState('');
  const [reporting, setReporting] = useState(false);
  const { isModerator } = useAuth();

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
  const rl = allowAction(`post:${topicId}:${user.id}`, 10000);
    if (!rl.allowed) {
      setError(`Please wait ${(rl.waitMs/1000).toFixed(1)}s before posting again.`);
      return;
    }
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

  if (loading) return <div className="section-content"><p>Loading replies…</p></div>;
  if (error) return <div className="section-content"><p className="error-message">{error}</p></div>;
  if (!topic) return <div className="section-content"><p>Topic not found.</p></div>;

  return (
    <div className="section-content">
      {/* Actions under SSR header/body */}
      <div className="form-actions mt-half">
        <button className="btn" onClick={() => setReportOpen({ open: true, target: 'topic' })}>Report Topic</button>
        {isModerator && (
          <>
            <button className="btn" onClick={async () => {
              await forumApi.updateTopic(topic.id, { is_locked: !topic.is_locked });
              const [t] = await forumApi.getTopic(topic.id);
              setTopic(t as any);
            }}>{topic.is_locked ? 'Unlock' : 'Lock'}</button>
            <button className="btn" onClick={async () => {
              await forumApi.updateTopic(topic.id, { is_pinned: !topic.is_pinned });
              const [t] = await forumApi.getTopic(topic.id);
              setTopic(t as any);
            }}>{topic.is_pinned ? 'Unpin' : 'Pin'}</button>
            <button className="btn" onClick={async () => {
              if (!confirm('Delete this topic? This cannot be undone.')) return;
              await forumApi.deleteTopic(topic.id);
              router.push('/forum');
            }}>Delete</button>
          </>
        )}
      </div>

      <div className="posts-list">
        {posts.map((p) => (
          <article key={p.id} className="post-item">
            <div className="post-author">{p.profiles?.username || 'Anonymous'}</div>
            <div className="post-time">{new Date(p.created_at).toLocaleString()}</div>
            <div className="post-body" dangerouslySetInnerHTML={{ __html: renderMarkdown(p.body) }} />
            <div className="form-actions mt-quarter">
              <button className="btn" onClick={() => setReportOpen({ open: true, target: { postId: p.id } })}>Report</button>
            </div>
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

      {reportOpen?.open && (
        <Modal isOpen onClose={() => setReportOpen(null)}>
          <div className="modal-header">
            <h3>Report {reportOpen.target === 'topic' ? 'Topic' : 'Post'}</h3>
          </div>
          <div className="modal-body">
            <div className="form-group">
              <label htmlFor="report-reason">Reason</label>
              <select id="report-reason" className="form-select" value={reportReason} onChange={(e) => setReportReason(e.target.value)}>
                <option value="abuse">Abuse/Harassment</option>
                <option value="spam">Spam</option>
                <option value="nsfw">NSFW/Inappropriate</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="report-notes">Notes</label>
              <textarea id="report-notes" className="form-textarea" rows={4} placeholder="Add details (optional)" value={reportNotes} onChange={(e) => setReportNotes(e.target.value)} />
            </div>
          </div>
          <div className="modal-actions">
            <button className="btn" onClick={() => setReportOpen(null)} disabled={reporting}>Cancel</button>
            <button className="btn btn-primary" disabled={reporting} onClick={async () => {
              const rl = allowAction(`report:${topicId}:${user?.id || 'anon'}`, 15000);
              if (!rl.allowed) {
                alert(`Please wait ${(rl.waitMs/1000).toFixed(1)}s before submitting another report.`);
                return;
              }
              setReporting(true);
              const notes = reportOpen.target === 'topic' ? reportNotes : `Post ID: ${(reportOpen.target as any).postId}\n${reportNotes}`;
              const [_, err] = await forumApi.createReport({ topic_id: topic.id, reason: reportReason, notes });
              setReporting(false);
              if (err) {
                alert(err.message);
              } else {
                setReportOpen(null);
                setReportNotes('');
                setReportReason('abuse');
                alert('Report submitted. Thank you.');
              }
            }}>Submit Report</button>
          </div>
        </Modal>
      )}
    </div>
  );
}

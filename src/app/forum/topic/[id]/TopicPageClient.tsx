"use client";

import { useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { forumApi } from '@/lib/supabase/forumApi';
import { useAuth } from '@/context/AuthContext';
import { renderMarkdown } from '@/utils/markdown';
import Modal from '@/components/Modal';
import AuthForm from '@/components/AuthForm';
import { allowAction } from '@/utils/rateLimit';
import { createClient } from '@/lib/supabase/client';

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
  author_id?: string;
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
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [editingBody, setEditingBody] = useState('');
  const [editing, setEditing] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const replyRef = useRef<HTMLTextAreaElement | null>(null);
  const supabase = useMemo(() => createClient(), []);
  const [authOpen, setAuthOpen] = useState(false);

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
      try { localStorage.removeItem(`reply_draft_${topicId}`); } catch {}
      // Refresh posts
      const [p] = await forumApi.listPosts({ topicId });
      setPosts((p as any) || []);
    }
    setPosting(false);
  };

  // Realtime updates for posts in this topic
  useEffect(() => {
    if (!topicId) return;
    const channel = supabase
      .channel(`posts_${topicId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'forum', table: 'posts', filter: `topic_id=eq.${topicId}` }, (payload: any) => {
        setPosts(prev => {
          const exists = prev.some(p => p.id === payload.new.id);
          if (exists) return prev;
          const next = [...prev, payload.new];
          return next.sort((a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
        });
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'forum', table: 'posts', filter: `id=eq.*` }, (payload: any) => {
        setPosts(prev => prev.map(p => p.id === payload.new.id ? { ...p, ...payload.new } : p));
      })
      .on('postgres_changes', { event: 'DELETE', schema: 'forum', table: 'posts', filter: `id=eq.*` }, (payload: any) => {
        setPosts(prev => prev.filter(p => p.id !== payload.old.id));
      })
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, topicId]);

  // Draft autosave for reply
  useEffect(() => {
    if (!topicId) return;
    try {
      const key = `reply_draft_${topicId}`;
      const saved = localStorage.getItem(key);
      if (saved && !reply) setReply(saved);
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [topicId]);

  useEffect(() => {
    if (!topicId) return;
    try {
      const key = `reply_draft_${topicId}`;
      if (reply) localStorage.setItem(key, reply);
    } catch {}
  }, [reply, topicId]);

  // Simple markdown toolbar helpers
  const surroundSelection = (before: string, after: string = before) => {
    const el = replyRef.current;
    if (!el) return;
    const start = el.selectionStart ?? 0;
    const end = el.selectionEnd ?? 0;
    const value = reply;
    const selected = value.slice(start, end) || '';
    const next = value.slice(0, start) + before + selected + after + value.slice(end);
    setReply(next);
    // restore caret
    requestAnimationFrame(() => {
      const pos = start + before.length + selected.length + (after ? 0 : 0);
      el.focus();
      el.setSelectionRange(pos, pos);
    });
  };

  const insertAtCursor = (text: string) => {
    const el = replyRef.current;
    if (!el) return;
    const start = el.selectionStart ?? 0;
    const end = el.selectionEnd ?? 0;
    const value = reply;
    const next = value.slice(0, start) + text + value.slice(end);
    setReply(next);
    requestAnimationFrame(() => {
      const pos = start + text.length;
      el.focus();
      el.setSelectionRange(pos, pos);
    });
  };

  const quotePost = (p: Post) => {
    const author = p.profiles?.username || 'Anonymous';
    const when = new Date(p.created_at).toLocaleString();
    const quoted = p.body.split('\n').map(l => `> ${l}`).join('\n');
    const block = `> @${author} wrote on ${when}:\n> \n${quoted}\n\n`;
    // If reply has text, add separation
    const prefix = reply.trim() ? '\n\n' : '';
    setReply(r => `${r}${prefix}${block}`);
    setShowPreview(true);
    replyRef.current?.focus();
  };

  const beginEdit = (post: Post) => {
    setEditingPostId(post.id);
    setEditingBody(post.body);
  };

  const cancelEdit = () => {
    setEditingPostId(null);
    setEditingBody('');
  };

  const saveEdit = async () => {
    if (!editingPostId || !editingBody.trim()) return;
    if (!user) { setError('You must be logged in to edit.'); return; }
    const rl = allowAction(`edit:${editingPostId}:${user.id}`, 10000);
    if (!rl.allowed) { setError(`Please wait ${(rl.waitMs/1000).toFixed(1)}s before editing again.`); return; }
    setEditing(true);
    setError(null);
    const original = posts;
    // Optimistic update
    setPosts(prev => prev.map(p => p.id === editingPostId ? { ...p, body: editingBody } : p));
    const [_, err] = await forumApi.updatePost(editingPostId, { body: editingBody.trim() });
    if (err) {
      setError(err.message);
      setPosts(original); // revert
    } else {
      // Optionally refetch to pull server-rendered markdown sanitization or other mutations
      const [p] = await forumApi.listPosts({ topicId });
      setPosts((p as any) || []);
      cancelEdit();
    }
    setEditing(false);
  };

  const deletePost = async (postId: string) => {
    if (!user) { setError('You must be logged in to delete.'); return; }
    if (!confirm('Delete this post? This cannot be undone.')) return;
    const original = posts;
    // Optimistic remove
    setPosts(prev => prev.filter(p => p.id !== postId));
    const [_, err] = await forumApi.deletePost(postId);
    if (err) {
      setError(err.message);
      setPosts(original);
    }
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
        {posts.map((p) => {
          const canEdit = !!user && (user.id === p.author_id || isModerator);
          const isEditing = editingPostId === p.id;
          return (
            <article key={p.id} className="post-item">
              <div className="post-author">{p.profiles?.username || 'Anonymous'}</div>
              <div className="post-time">{new Date(p.created_at).toLocaleString()}</div>
              {!isEditing && (
                <div className="post-body" dangerouslySetInnerHTML={{ __html: renderMarkdown(p.body) }} />
              )}
              {isEditing && (
                <div className="form-group">
                  <label htmlFor={`edit-${p.id}`} className="form-label">Edit post</label>
                  <textarea
                    id={`edit-${p.id}`}
                    className="form-textarea enhanced-textarea"
                    rows={6}
                    value={editingBody}
                    onChange={(e) => setEditingBody(e.target.value)}
                    disabled={editing}
                  />
                </div>
              )}
              <div className="form-actions mt-quarter">
                <button className="btn" onClick={() => setReportOpen({ open: true, target: { postId: p.id } })}>Report</button>
                <button className="btn" onClick={() => quotePost(p)}>Quote</button>
                {canEdit && !topic.is_locked && !isEditing && (
                  <>
                    <button className="btn" onClick={() => beginEdit(p)}>Edit</button>
                    <button className="btn" onClick={() => deletePost(p.id)}>Delete</button>
                  </>
                )}
                {canEdit && isEditing && (
                  <>
                    <button className="btn" onClick={cancelEdit} disabled={editing}>Cancel</button>
                    <button className="btn btn-primary" onClick={saveEdit} disabled={editing || !editingBody.trim()}>Save</button>
                  </>
                )}
              </div>
            </article>
          );
        })}
        {posts.length === 0 && <p>No replies yet. Be the first to respond.</p>}
      </div>

      {!topic.is_locked && (
        <form onSubmit={handleReply} className="reply-form">
          <label htmlFor="reply-body" className="form-label">Your reply</label>
          <div className="toolbar mb-quarter">
            <button type="button" className="btn" onClick={() => surroundSelection('**')}>Bold</button>
            <button type="button" className="btn" onClick={() => surroundSelection('*')}>Italic</button>
            <button type="button" className="btn" onClick={() => surroundSelection('`')}>Code</button>
            <button type="button" className="btn" onClick={() => insertAtCursor('\n- ')}>List</button>
            <button type="button" className="btn" onClick={() => insertAtCursor('\n> ')}>Quote</button>
            <button type="button" className="btn" onClick={() => insertAtCursor('[text](https://)')}>Link</button>
            <span className="spacer" />
            <button type="button" className="btn" onClick={() => setShowPreview(p => !p)}>{showPreview ? 'Edit' : 'Preview'}</button>
          </div>
          {!showPreview && (
            <textarea
              id="reply-body"
              ref={replyRef}
              className="form-textarea enhanced-textarea"
              rows={6}
              placeholder={user ? 'Share your thoughts…' : 'Sign in to reply'}
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              disabled={posting}
            />
          )}
          {showPreview && (
            <div className="post-body markdown-preview-box" dangerouslySetInnerHTML={{ __html: renderMarkdown(reply || '') }} />
          )}
          {error && <p className="error-message">{error}</p>}
          {!user && (
            <p className="subtle mt-quarter">You can draft your reply above, but you must sign in to post.</p>
          )}
          <div className="form-actions">
            <button type="submit" className="btn btn-primary" disabled={!user || posting || !reply.trim()}>
              {posting ? 'Posting…' : 'Post Reply'}
            </button>
            {!user && (
              <button type="button" className="btn" onClick={() => setAuthOpen(true)}>
                Sign in to post
              </button>
            )}
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

      {authOpen && (
        <Modal isOpen onClose={() => setAuthOpen(false)}>
          <AuthForm onClose={() => setAuthOpen(false)} />
        </Modal>
      )}
    </div>
  );
}

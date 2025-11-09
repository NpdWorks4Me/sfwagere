'use client';

import { useEffect, useState, useRef } from 'react';
import Skeleton from '@/components/Skeleton';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { forumApi } from '@/lib/supabase/forumApi';
import { createClient } from '@/lib/supabase/client';
import Modal from '@/components/Modal';
import NewTopicForm from '@/components/NewTopicForm';
import ForumControls from '@/components/ForumControls';
import AuthControls from '@/components/AuthControls';
import styles from './ForumPage.module.css';

interface Topic {
  id: string;
  title: string;
  body: string;
  author_id: string;
  flags_count: number;
  is_pinned: boolean;
  is_locked: boolean;
  status: string;
  content_warning: boolean;
  content_warning_text: string | null;
  created_at: string;
  updated_at: string;
  categories: { id: number; slug: string; name: string } | null;
  profiles: { username: string; role: string } | null;
  replies: number;
  vote_count?: number;
}

export default function ForumPageClient({ topics: initialTopics = [] }: { topics?: Topic[] }) {
  const [topics, setTopics] = useState<Topic[]>(initialTopics);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isNewTopicModalOpen, setIsNewTopicModalOpen] = useState(false);
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [hasMore, setHasMore] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [votesMap, setVotesMap] = useState<Record<string, number>>({});
  const [scoresMap, setScoresMap] = useState<Record<string, number>>({});
  const [pendingVotes, setPendingVotes] = useState<Record<string, boolean>>({});
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const [jump, setJump] = useState('');
  const prefetchRef = useRef<number | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  const fetchTopics = async (filters: { category?: string; sort?: string; search?: string; page?: number } = {}) => {
    setLoading(true);
    const effectivePage = filters.page ?? page;
    const sort = (filters.sort as any) || 'latest';
    const [result, err] = await forumApi.listTopics({
      categorySlug: filters.category,
      search: filters.search,
      sort,
      page: effectivePage,
      pageSize,
    });
    if (err) {
      setError(err.message);
    } else {
      const formattedData = (result?.items as any[]).map(item => ({
        ...item,
        categories: Array.isArray(item.categories) ? item.categories[0] : item.categories,
        profiles: Array.isArray(item.profiles) ? item.profiles[0] : item.profiles,
      }));
      setTopics(formattedData || []);
      setHasMore(!!result?.hasMore);
      setTotalCount(result?.totalCount || 0);
      // Populate authoritative scoresMap from returned topics (vote_count) if available
      try {
        const scores: Record<string, number> = {};
        (formattedData || []).forEach((t: any) => { if (typeof t.vote_count !== 'undefined') scores[t.id] = Number(t.vote_count || 0); });
        if (Object.keys(scores).length) setScoresMap(scores);
        // fetch user votes for these topics (authenticated only)
        const [uVotes, vErr] = await forumApi.listUserVotes();
        if (!vErr && uVotes) {
          setVotesMap(uVotes as Record<string, number>);
          try { localStorage.setItem('forum:votes', JSON.stringify(uVotes)); } catch {}
        } else {
          try { const raw = localStorage.getItem('forum:votes'); if (raw) setVotesMap(JSON.parse(raw)); } catch {}
        }
      } catch (e) {
        // ignore non-critical failures
      }
    }
    setLoading(false);
  };

  const setLocalVotes = (map: Record<string, number>) => {
    try { localStorage.setItem('forum:votes', JSON.stringify(map)); } catch {}
  };

  const handleVote = async (topicId: string, dir: 1 | -1) => {
    // Prevent duplicate clicks
    setPendingVotes(prev => ({ ...prev, [topicId]: true }));
    // Optimistic UI
    setVotesMap((prev) => {
      const existing = prev[topicId] || 0;
      const next = { ...prev };
      if (existing === dir) delete next[topicId]; else next[topicId] = dir;
      setLocalVotes(next);
      return next;
    });
    setScoresMap((prev) => {
      const existing = prev[topicId] || 0;
      const userPrev = votesMap[topicId] || 0;
      let delta = 0;
      if (userPrev === dir) delta = -dir;
      else if (userPrev === 0) delta = dir;
      else delta = dir - userPrev;
      return { ...prev, [topicId]: existing + delta };
    });

    try {
      const [res, err] = await forumApi.voteTopic({ topicId, vote: dir });
      if (err) {
        // Handle common errors
        const msg = (err.message || '').toString();
        if (msg.includes('not_authenticated')) {
          // prompt sign-in
          try { alert('Please sign in to save your vote.'); } catch {}
        } else if (msg.includes('rate_limited')) {
          try { alert('You are voting too quickly — try again in a few seconds.'); } catch {}
        } else {
          console.warn('Vote API error', err);
        }
        // rollback optimistic vote by reloading authoritative score
        const [scores, sErr] = await forumApi.getTopicScores([topicId]);
        if (!sErr && scores) setScoresMap(prev => ({ ...prev, [topicId]: scores[topicId] ?? prev[topicId] }));
      } else {
        // res may be the updated score map value or null; refresh authoritative count
        const [scores, sErr] = await forumApi.getTopicScores([topicId]);
        if (!sErr && scores) {
          setScoresMap(prev => ({ ...prev, [topicId]: scores[topicId] ?? prev[topicId] }));
          setTopics(prev => prev.map(t => t.id === topicId ? { ...t, vote_count: scores[topicId] ?? t.vote_count } : t));
        }
      }
    } catch (e) {
      console.warn('Vote request failed', e);
    } finally {
      setPendingVotes(prev => { const next = { ...prev }; delete next[topicId]; return next; });
    }
  };

  // Realtime subscription: listen for topic updates (vote_count) and apply
  useEffect(() => {
    const sb = createClient();
    let sub: any = null;
    try {
      sub = sb.channel('public:forum.topics')
        .on('postgres_changes', { event: 'UPDATE', schema: 'forum', table: 'topics' }, (payload: any) => {
          const rec = payload.record;
          if (!rec || !rec.id) return;
          if (typeof rec.vote_count !== 'undefined') {
            setScoresMap(prev => ({ ...prev, [rec.id]: Number(rec.vote_count || 0) }));
            setTopics(prev => prev.map(t => t.id === rec.id ? { ...t, vote_count: Number(rec.vote_count || 0) } : t));
          }
        })
        .subscribe();
    } catch (e) {
      // ignore
    }
    return () => { try { if (sub) sub.unsubscribe(); } catch {} };
  }, []);

  const handleTopicCreated = () => {
    // Refetch with current filters
    const currentCategory = searchParams.get('category') || '';
    const currentSort = searchParams.get('sort') || 'latest';
    const currentSearch = searchParams.get('search') || '';
    fetchTopics({ category: currentCategory, sort: currentSort, search: currentSearch });
  };

  // Initial fetch on mount and whenever search params change
  useEffect(() => {
    const currentCategory = searchParams.get('category') || '';
    const currentSort = searchParams.get('sort') || 'latest';
    const currentSearch = searchParams.get('search') || '';
    const sp = Number(searchParams.get('page') || '1');
    const nextPage = Number.isFinite(sp) && sp > 0 ? sp : 1;
    if (nextPage !== page) setPage(nextPage);
    fetchTopics({ category: currentCategory, sort: currentSort, search: currentSearch, page: nextPage });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams?.toString()]);

  // Prefetch next page topics on idle
  useEffect(() => {
    if (!hasMore) return;
    const currentCategory = searchParams.get('category') || '';
    const currentSort = searchParams.get('sort') || 'latest';
    const currentSearch = searchParams.get('search') || '';
    const nextPageNum = page + 1;
    // Use requestIdleCallback if available, else fallback to setTimeout
    const prefetch = () => {
      forumApi.listTopics({
        categorySlug: currentCategory,
        search: currentSearch,
        sort: currentSort as any,
        page: nextPageNum,
        pageSize,
      }); // Fire and forget; cache layer will retain
    };
    if ('requestIdleCallback' in window) {
      const handle = (window as any).requestIdleCallback(prefetch, { timeout: 1500 });
      prefetchRef.current = handle;
      return () => {
        if (prefetchRef.current && 'cancelIdleCallback' in window) {
          (window as any).cancelIdleCallback(prefetchRef.current);
        }
      };
    } else {
      const handle = setTimeout(prefetch, 800);
      return () => clearTimeout(handle);
    }
  }, [hasMore, page, searchParams, pageSize]);

  const handleFilterChange = (filters: { category: string; sort: string; search: string }) => {
    const params = new URLSearchParams();
    if (filters.category) params.set('category', filters.category);
    if (filters.sort) params.set('sort', filters.sort);
    if (filters.search) params.set('search', filters.search);
    params.set('page', '1');
    setPage(1);
    router.push(`/forum?${params.toString()}`);
  };

  const formatTimeAgo = (iso: string) => {
    const d = new Date(iso).getTime();
    const now = Date.now();
    const diff = Math.max(0, now - d);
    const s = Math.floor(diff / 1000);
    if (s < 45) return 'now';
    const m = Math.floor(s / 60);
    if (m < 60) return `${m}m`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h`;
    const day = Math.floor(h / 24);
    if (day < 14) return `${day}d`;
    const wk = Math.floor(day / 7);
    if (wk < 8) return `${wk}w`;
    const mo = Math.floor(day / 30);
    if (mo < 18) return `${mo}mo`;
    const yr = Math.floor(day / 365);
    return `${yr}y`;
  };

  return (
    <div id="content" className={`container ${styles.compact}`}> 
      <header className="page-header">
        <h1 className="glitch-title" data-text="FORUM">FORUM</h1>
        <p>Discuss, share, and connect with the community.</p>
        <AuthControls />
      </header>

      <div className="forum-controls">
        <ForumControls onFilterChange={handleFilterChange} />
        <div className="forum-actions">
          <button className="btn btn-primary" onClick={() => { console.log('Start new topic clicked'); setIsNewTopicModalOpen(true); }}>Start New Topic</button>
        </div>
      </div>

      {isNewTopicModalOpen && (
        <Modal isOpen={isNewTopicModalOpen} onClose={() => setIsNewTopicModalOpen(false)}>
          <NewTopicForm onTopicCreated={handleTopicCreated} onClose={() => setIsNewTopicModalOpen(false)} />
        </Modal>
      )}

      <div className="forum-content">
        {loading && (
          <table className="forum-topic-list skeleton-table">
            <thead>
              <tr>
                <th>Topic</th>
                <th>Category</th>
                <th>Author</th>
                <th>Replies</th>
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 6 }).map((_, i) => (
                <tr key={i}>
                  <td><Skeleton width={220} height={16} /></td>
                  <td><Skeleton width={90} height={16} /></td>
                  <td><Skeleton width={80} height={16} /></td>
                  <td><Skeleton width={40} height={16} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {error && <p className="error-message">Error: {error}</p>}
        {!loading && !error && topics.length === 0 && (
          <div className="empty-state">
            <h3>No topics yet.</h3>
            <p>Be the first to start a conversation!</p>
          </div>
        )}
        {!loading && !error && topics.length > 0 && (
          <table className="forum-topic-list reddit-style">
            <thead>
              <tr>
                <th aria-hidden="true">Vote</th>
                <th>Topic</th>
                <th>Replies</th>
              </tr>
            </thead>
            <tbody>
              {topics.map((topic) => (
                <tr key={topic.id} data-pinned={topic.is_pinned ? 'true' : 'false'} data-locked={topic.is_locked ? 'true' : 'false'}>
                  <td className="vote-col" role="gridcell">
                    <div className="vote-box" aria-hidden>
                      <button
                        className={`vote up ${votesMap[topic.id] === 1 ? 'active' : ''}`}
                        title="Upvote"
                        aria-pressed={votesMap[topic.id] === 1 ? 'true' : 'false'}
                        aria-label={`Upvote ${topic.title}`}
                        onClick={() => handleVote(topic.id, 1)}
                        disabled={!!pendingVotes[topic.id]}
                      >
                        ▲
                      </button>
                      <div className="score" aria-hidden>{(typeof topic.vote_count !== 'undefined') ? topic.vote_count : (scoresMap[topic.id] ?? 0)}</div>
                      <button
                        className={`vote down ${votesMap[topic.id] === -1 ? 'active' : ''}`}
                        title="Downvote"
                        aria-pressed={votesMap[topic.id] === -1 ? 'true' : 'false'}
                        aria-label={`Downvote ${topic.title}`}
                        onClick={() => handleVote(topic.id, -1)}
                        disabled={!!pendingVotes[topic.id]}
                      >
                        ▼
                      </button>
                    </div>
                  </td>

                  <td>
                    <div className="topic-card">
                      <div className="topic-main">
                        <Link href={`/forum/topic/${topic.id}`} title={topic.title} className="topic-link">{topic.title}</Link>
                        <div className="topic-meta">
                          <span className={styles.authorByline}>{topic.profiles?.username || 'unknown'}</span>
                          {topic.categories && (
                            <span className="badge category" title={topic.categories.name}>{topic.categories.name}</span>
                          )}
                          {topic.is_pinned && <span className="badge pin" title="Pinned topic">Pinned</span>}
                          {topic.is_locked && <span className="badge lock" title="Locked topic">Locked</span>}
                          {topic.content_warning && (
                            <span className="badge cw" title={topic.content_warning_text || 'Content warning'}>CW</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="replies-col" role="gridcell">
                    <div className="replies-count">{topic.replies}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
  <div className="pagination-controls">
          <button
            className="btn"
            disabled={page === 1 || loading}
            onClick={() => {
              const p = 1;
              const params = new URLSearchParams(searchParams.toString());
              params.set('page', String(p));
              setPage(p);
              router.push(`/forum?${params.toString()}`);
            }}
          >First</button>
          <button
            className="btn"
            disabled={page <= 1 || loading}
            onClick={() => {
              const p = Math.max(1, page - 1);
              const params = new URLSearchParams(searchParams.toString());
              params.set('page', String(p));
              setPage(p);
              router.push(`/forum?${params.toString()}`);
            }}
          >
            Prev
          </button>
          <span className="page-indicator">Page {page} / {Math.max(1, Math.ceil(totalCount / pageSize))}</span>
          <button
            className="btn"
            disabled={loading || !hasMore}
            onClick={() => {
              const p = page + 1;
              const params = new URLSearchParams(searchParams.toString());
              params.set('page', String(p));
              setPage(p);
              router.push(`/forum?${params.toString()}`);
            }}
          >
            Next
          </button>
          <button
            className="btn"
            disabled={loading || page === totalPages}
            onClick={() => {
              const p = totalPages;
              const params = new URLSearchParams(searchParams.toString());
              params.set('page', String(p));
              setPage(p);
              router.push(`/forum?${params.toString()}`);
            }}
          >Last</button>
          <input
            type="number"
            min={1}
            max={totalPages}
            placeholder="Jump"
            className="form-input jump-input"
            value={jump}
            onChange={(e) => setJump(e.target.value)}
          />
          <button
            className="btn"
            disabled={loading || !jump.trim()}
            onClick={() => {
              const num = Number(jump);
              if (!Number.isFinite(num) || num < 1 || num > totalPages) return;
              const params = new URLSearchParams(searchParams.toString());
              params.set('page', String(num));
              setPage(num);
              router.push(`/forum?${params.toString()}`);
              setJump('');
            }}
          >Go</button>
        </div>
      </div>
    </div>
  );
}

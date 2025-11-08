'use client';

import { useEffect, useState, useRef } from 'react';
import Skeleton from '@/components/Skeleton';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { forumApi } from '@/lib/supabase/forumApi';
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
    }
    setLoading(false);
  };

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
                <th>Activity</th>
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 6 }).map((_, i) => (
                <tr key={i}>
                  <td><Skeleton width={220} height={16} /></td>
                  <td><Skeleton width={90} height={16} /></td>
                  <td><Skeleton width={80} height={16} /></td>
                  <td><Skeleton width={40} height={16} /></td>
                  <td><Skeleton width={70} height={16} /></td>
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
          <table className="forum-topic-list">
            <thead>
              <tr>
                <th>Topic</th>
                <th>Category</th>
                <th>Author</th>
                <th>Replies</th>
                <th>Activity</th>
              </tr>
            </thead>
            <tbody>
              {topics.map((topic) => (
                <tr key={topic.id} data-pinned={topic.is_pinned ? 'true' : 'false'} data-locked={topic.is_locked ? 'true' : 'false'}>
                  <td>
                    <div className="topic-title">
                      <Link href={`/forum/topic/${topic.id}`} title={topic.title}>{topic.title}</Link>
                      {topic.profiles?.username && (
                        <span className={styles.authorByline}> · {topic.profiles.username}</span>
                      )}
                      {topic.is_pinned && <span className="badge pin" title="Pinned topic">Pinned</span>}
                      {topic.is_locked && <span className="badge lock" title="Locked topic">Locked</span>}
                      {topic.content_warning && (
                        <span className="badge cw" title={topic.content_warning_text || 'Content warning'}>CW</span>
                      )}
                    </div>
                  </td>
                  <td>
                    {topic.categories && (
                      <span className="badge category" title={topic.categories.name}>{topic.categories.name}</span>
                    )}
                  </td>
                  <td>{topic.profiles?.username || '...'}</td>
                  <td>{topic.replies}</td>
                  <td>
                    <time className="time-chip" dateTime={topic.updated_at} title={new Date(topic.updated_at).toLocaleString()}>
                      {formatTimeAgo(topic.updated_at)}
                    </time>
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

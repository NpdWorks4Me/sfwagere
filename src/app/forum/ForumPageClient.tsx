
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { forumApi } from '@/lib/supabase/forumApi';
import Modal from '@/components/Modal';
import NewTopicForm from '@/components/NewTopicForm';
import ForumControls from '@/components/ForumControls';
import AuthControls from '@/components/AuthControls';

interface Topic {
  id: number;
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
  const router = useRouter();
  const searchParams = useSearchParams();

  const fetchTopics = async (filters: { category?: string; sort?: string; search?: string; page?: number } = {}) => {
    setLoading(true);
    const effectivePage = filters.page ?? page;
    const sort = (filters.sort as any) || 'latest';
    const [data, err] = await forumApi.listTopics({
      categorySlug: filters.category,
      search: filters.search,
      sort,
      page: effectivePage,
      pageSize,
    });
    if (err) {
      setError(err.message);
    } else {
      const formattedData = (data as any[]).map(item => ({
        ...item,
        categories: Array.isArray(item.categories) ? item.categories[0] : item.categories,
        profiles: Array.isArray(item.profiles) ? item.profiles[0] : item.profiles,
      }));
      setTopics(formattedData || []);
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

  const handleFilterChange = (filters: { category: string; sort: string; search: string }) => {
    const params = new URLSearchParams();
    if (filters.category) params.set('category', filters.category);
    if (filters.sort) params.set('sort', filters.sort);
    if (filters.search) params.set('search', filters.search);
    params.set('page', '1');
    setPage(1);
    router.push(`/forum?${params.toString()}`);
  };

  return (
    <div id="content" className="container">
      <header className="page-header">
        <h1 className="glitch-title" data-text="FORUM">FORUM</h1>
        <p>Discuss, share, and connect with the community.</p>
        <AuthControls />
      </header>

      <div className="forum-controls">
        <ForumControls onFilterChange={handleFilterChange} />
        <div className="forum-actions">
          <button className="btn btn-primary" onClick={() => setIsNewTopicModalOpen(true)}>Start New Topic</button>
        </div>
      </div>

      {isNewTopicModalOpen && (
        <Modal isOpen={isNewTopicModalOpen} onClose={() => setIsNewTopicModalOpen(false)}>
          <NewTopicForm onTopicCreated={handleTopicCreated} onClose={() => setIsNewTopicModalOpen(false)} />
        </Modal>
      )}

      <div className="forum-content">
        {loading && <p>Loading topics...</p>}
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
                <tr key={topic.id}>
                  <td>
                    <div className="topic-title">
                      <Link href={`/forum/topic/${topic.id}`}>{topic.title}</Link>
                      {topic.is_pinned && <span className="badge pin">Pinned</span>}
                      {topic.is_locked && <span className="badge lock">Locked</span>}
                    </div>
                  </td>
                  <td>
                    {topic.categories && (
                      <span className="badge category">{topic.categories.name}</span>
                    )}
                  </td>
                  <td>{topic.profiles?.username || '...'}</td>
                  <td>{topic.replies}</td>
                  <td>{new Date(topic.updated_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
  <div className="pagination-controls">
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
          <span className="page-indicator">Page {page}</span>
          <button
            className="btn"
            disabled={loading || topics.length < pageSize}
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
        </div>
      </div>
    </div>
  );
}

// Forum API helpers for Supabase (schema: forum)
// Import: import { forumApi } from './supabase/forumApi.js'

import { createClient } from '@/lib/supabase/client';
import { PostgrestError, SupabaseClient } from '@supabase/supabase-js';

type Err = PostgrestError | Error;
type ApiResult<T> = [T, null] | [null, Err];

function errTuple<T>({ data, error }: { data: T | null, error: PostgrestError | null }): ApiResult<T> {
  if (error) return [null, error];
  return [data as T, null];
}

type SupabaseClientType = SupabaseClient<any, "public", any>;

export const forumApi = {
  // Categories
  async listCategories(supabase: SupabaseClientType = createClient()) {
    const res = await supabase.schema('forum').from('categories')
      .select('id, slug, name, description, sort_order')
      .order('sort_order', { ascending: true });
    return errTuple(res);
  },

  async getTopic(id: string, supabase: SupabaseClientType = createClient()) {
    const res = await supabase.schema('forum').from('topics')
      .select('id, title, body, author_id, flags_count, is_pinned, is_locked, status, content_warning, content_warning_text, created_at, updated_at, categories!category_id(id, slug, name), profiles!author_id(username, role)')
      .eq('id', id)
      .single();
    return errTuple(res);
  },

  // Topics
  async listTopics(
    { categorySlug, search, sort = 'latest', page = 1, pageSize = 10 }: { categorySlug?: string, search?: string, sort?: 'latest'|'newest'|'most-replies', page?: number, pageSize?: number } = {},
    supabase: SupabaseClientType = createClient()
    ): Promise<ApiResult<{ items: ({
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
      } & { replies: number })[]; totalCount: number; hasMore: boolean }>> {
    // Call RPC (must exist in DB). Fallback to legacy logic if RPC errors.
    const { data: rpcData, error: rpcError } = await supabase.rpc('get_topics_with_replies', {
      category_slug: categorySlug || null,
      search: search || null,
      sort,
      page,
      page_size: pageSize,
    });
    if (!rpcError && Array.isArray(rpcData)) {
      const totalCount = rpcData[0]?.total_count ? Number(rpcData[0].total_count) : 0;
      const items = rpcData.map(r => ({
  id: r.id,
        title: r.title,
        body: r.body,
        author_id: r.author_id,
        flags_count: r.flags_count,
        is_pinned: r.is_pinned,
        is_locked: r.is_locked,
        status: r.status,
        content_warning: r.content_warning,
        content_warning_text: r.content_warning_text,
        created_at: r.created_at,
        updated_at: r.updated_at,
        categories: r.category_id ? { id: r.category_id, slug: r.category_slug, name: r.category_name } : null,
        profiles: { username: r.author_username, role: r.author_role },
        replies: Number(r.replies_count || 0),
      }));
      const hasMore = page * pageSize < totalCount;
      return [{ items: items as any, totalCount, hasMore }, null];
    }
    // Legacy fallback (should rarely execute once RPC deployed)
    let query = supabase.schema('forum').from('topics')
      .select('id, title, body, author_id, flags_count, is_pinned, is_locked, status, content_warning, content_warning_text, created_at, updated_at, categories!category_id(id, slug, name), profiles!author_id(username, role)', { count: 'exact' })
      .order('is_pinned', { ascending: false });

    if (sort === 'newest') {
      query = query.order('created_at', { ascending: false });
    } else {
      // latest activity by default
      query = query.order('updated_at', { ascending: false });
    }

    if (categorySlug) {
      query = query.eq('categories.slug', categorySlug);
    }
    if (search && search.trim()) {
      const s = search.trim().replace(/[%_]/g, '\\$&'); // Escape % and _ for ilike
      // Safe search using multiple conditions
      query = query.or(`title.ilike.%${s}%,body.ilike.%${s}%`);
    }
    // Pagination
    const from = Math.max(0, (page - 1) * pageSize);
    const to = from + pageSize - 1;
  const { data, error, count } = await query.range(from, to);
    if (error) return [null, error];
    // Add replies count
    const topicsWithReplies = await Promise.all((data || []).map(async (topic) => {
      const { count: replyCount, error: countErr } = await supabase
        .from('posts')
        .select('*', { count: 'exact', head: true })
        .eq('topic_id', topic.id)
        .eq('status', 'published');
      return { ...topic, replies: countErr ? 0 : (replyCount || 0) };
    }));
    let items = topicsWithReplies as any[];
    if (sort === 'most-replies') {
      items = [...items].sort((a, b) => (b.replies || 0) - (a.replies || 0));
    }
    const totalCount = count || 0;
    const hasMore = from + (data?.length || 0) < totalCount;
    return [{ items: items as any, totalCount, hasMore }, null];
  },

  async createTopic(
    { categorySlug, title, body, content_warning = false, content_warning_text = '' }: { categorySlug: string, title: string, body: string, content_warning?: boolean, content_warning_text?: string },
    supabase: SupabaseClientType = createClient()
    ) {
    // Resolve category id
    const { data: cats, error: catErr } = await supabase.schema('forum').from('categories')
      .select('id')
      .eq('slug', categorySlug)
      .limit(1);
  if (catErr) return [null, catErr];
  if (!cats || !cats[0]) return [null, new Error('Category not found')];
    const category_id = cats[0].id;

    const res = await supabase.schema('forum').from('topics')
      .insert({ category_id, title, body, content_warning, content_warning_text })
      .select('*')
      .single();
    return errTuple(res);
  },

  async updateTopic(id: string, patch: object, supabase: SupabaseClientType = createClient()) {
    const res = await supabase.schema('forum').from('topics')
      .update(patch)
      .eq('id', id)
      .select('*')
      .single();
    return errTuple(res);
  },

  async deleteTopic(id: string, supabase: SupabaseClientType = createClient()) {
    const res = await supabase.schema('forum').from('topics')
      .delete()
      .eq('id', id);
    return errTuple(res);
  },

  // Reports
  async createReport({ topic_id, reason, notes }: { topic_id: string, reason: string, notes: string }, supabase: SupabaseClientType = createClient()) {
    const { data: user } = await supabase.auth.getUser();
    const reporter_id = user?.user?.id || null;
    const res = await supabase.schema('forum').from('reports')
      .insert({ topic_id, reporter_id, reason, notes })
      .select('*')
      .single();
    return errTuple(res);
  },

  async listReports(supabase: SupabaseClientType = createClient()) {
    const res = await supabase.schema('forum').from('reports')
      .select('*, topics(id, title), profiles!reporter_id(username)')
      .order('created_at', { ascending: false });
    return errTuple(res);
  },

  async updateReport(id: string, patch: object, supabase: SupabaseClientType = createClient()) {
    const res = await supabase.schema('forum').from('reports')
      .update(patch)
      .eq('id', id)
      .select('*')
      .single();
    return errTuple(res);
  },

  // Posts
  async listPosts({ topicId }: { topicId: string }, supabase: SupabaseClientType = createClient()) {
    const res = await supabase.schema('forum').from('posts')
      .select('*, profiles(username, role)')
      .eq('topic_id', topicId)
      .eq('status', 'published')
      .order('created_at', { ascending: true });
    return errTuple(res);
  },

  async createPost({ topic_id, body }: { topic_id: string, body: string }, supabase: SupabaseClientType = createClient()) {
    const { data: user } = await supabase.auth.getUser();
    const author_id = user?.user?.id || null;
    if (!author_id) return [null, new Error('User not authenticated')];

    const res = await supabase.schema('forum').from('posts')
      .insert({ topic_id, author_id, body })
      .select('*')
      .single();
    return errTuple(res);
  },

  async getPost(id: string, supabase: SupabaseClientType = createClient()) {
    const res = await supabase.schema('forum').from('posts')
      .select('*, profiles(username, role)')
      .eq('id', id)
      .single();
    return errTuple(res);
  },

  async updatePost(id: string, patch: object, supabase: SupabaseClientType = createClient()) {
    const res = await supabase.schema('forum').from('posts')
      .update(patch)
      .eq('id', id)
      .select('*')
      .single();
    return errTuple(res);
  },

  async deletePost(id: string, supabase: SupabaseClientType = createClient()) {
    const res = await supabase.schema('forum').from('posts')
      .delete()
      .eq('id', id);
    return errTuple(res);
  },

  // Voting (optional DB table: forum.topic_votes)
  async voteTopic({ topicId, vote }: { topicId: string, vote: number }, supabase: SupabaseClientType = createClient()) {
    // vote = 1 (up) or -1 (down)
    const { data: user } = await supabase.auth.getUser();
    const voter_id = user?.user?.id || null;
    if (!voter_id) return [null, new Error('User not authenticated')];
    try {
      const res = await supabase.schema('forum').from('topic_votes')
        .upsert({ topic_id: topicId, voter_id, vote }, { onConflict: 'topic_id,voter_id' })
        .select('*');
      return errTuple(res as any);
    } catch (e: any) {
      return [null, e];
    }
  },

  async listUserVotes(supabase: SupabaseClientType = createClient()) {
    const { data: user } = await supabase.auth.getUser();
    const voter_id = user?.user?.id || null;
    if (!voter_id) return [{}, null] as ApiResult<Record<string, number>>;
    try {
      const { data, error } = await supabase.schema('forum').from('topic_votes')
        .select('topic_id, vote')
        .eq('voter_id', voter_id);
      if (error) return [null, error];
      const map: Record<string, number> = {};
      (data || []).forEach((r: any) => { map[r.topic_id] = Number(r.vote || 0); });
      return [map, null];
    } catch (e: any) {
      return [null, e];
    }
  },

  async getTopicScores(topicIds: string[] = [], supabase: SupabaseClientType = createClient()) {
    if (!topicIds || topicIds.length === 0) return [{}, null] as ApiResult<Record<string, number>>;
    try {
      const { data, error } = await supabase.schema('forum').from('topic_votes')
        .select('topic_id, vote')
        .in('topic_id', topicIds);
      if (error) return [null, error];
      const map: Record<string, number> = {};
      (data || []).forEach((r: any) => { map[r.topic_id] = (map[r.topic_id] || 0) + Number(r.vote || 0); });
      return [map, null];
    } catch (e: any) {
      return [null, e];
    }
  },
};

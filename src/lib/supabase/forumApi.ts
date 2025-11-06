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
    const res = await supabase
      .from('categories')
      .select('id, slug, name, description, sort_order')
      .order('sort_order', { ascending: true });
    return errTuple(res);
  },

  async getTopic(id: number, supabase: SupabaseClientType = createClient()) {
    const res = await supabase
      .from('topics')
      .select('id, title, body, author_id, flags_count, is_pinned, is_locked, status, content_warning, content_warning_text, created_at, updated_at, categories!category_id(id, slug, name), profiles!author_id(username, role)')
      .eq('id', id)
      .single();
    return errTuple(res);
  },

  // Topics
  async listTopics(
    { categorySlug, search, sort = 'latest', page = 1, pageSize = 10 }: { categorySlug?: string, search?: string, sort?: 'latest'|'newest'|'most-replies', page?: number, pageSize?: number } = {},
    supabase: SupabaseClientType = createClient()
    ): Promise<ApiResult<(
      {
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
        categories: { id: number; slug: string; name: string } | { id: number; slug: string; name: string }[] | null;
        profiles: { username: string; role: string } | { username: string; role: string }[] | null;
      } & { replies: number }
    )[]>> {
    let query = supabase
      .from('topics')
      .select('id, title, body, author_id, flags_count, is_pinned, is_locked, status, content_warning, content_warning_text, created_at, updated_at, categories!category_id(id, slug, name), profiles!author_id(username, role)')
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
    const { data, error } = await query.range(from, to);
  if (error) return [null, error];
    // Add replies count
    const topicsWithReplies = await Promise.all((data || []).map(async (topic) => {
      const { count, error: countErr } = await supabase
        .from('posts')
        .select('*', { count: 'exact', head: true })
        .eq('topic_id', topic.id)
        .eq('status', 'published');
      return { ...topic, replies: countErr ? 0 : (count || 0) };
    }));
    let items = topicsWithReplies as any[];
    if (sort === 'most-replies') {
      items = [...items].sort((a, b) => (b.replies || 0) - (a.replies || 0));
    }
    return [items as any, null];
  },

  async createTopic(
    { categorySlug, title, body, content_warning = false, content_warning_text = '' }: { categorySlug: string, title: string, body: string, content_warning?: boolean, content_warning_text?: string },
    supabase: SupabaseClientType = createClient()
    ) {
    // Resolve category id
    const { data: cats, error: catErr } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', categorySlug)
      .limit(1);
  if (catErr) return [null, catErr];
  if (!cats || !cats[0]) return [null, new Error('Category not found')];
    const category_id = cats[0].id;

    const res = await supabase
      .from('topics')
      .insert({ category_id, title, body, content_warning, content_warning_text })
      .select('*')
      .single();
    return errTuple(res);
  },

  async updateTopic(id: number, patch: object, supabase: SupabaseClientType = createClient()) {
    const res = await supabase
      .from('topics')
      .update(patch)
      .eq('id', id)
      .select('*')
      .single();
    return errTuple(res);
  },

  async deleteTopic(id: number, supabase: SupabaseClientType = createClient()) {
    const res = await supabase
      .from('topics')
      .delete()
      .eq('id', id);
    return errTuple(res);
  },

  // Reports
  async createReport({ topic_id, reason, notes }: { topic_id: number, reason: string, notes: string }, supabase: SupabaseClientType = createClient()) {
    const { data: user } = await supabase.auth.getUser();
    const reporter_id = user?.user?.id || null;
    const res = await supabase
      .from('reports')
      .insert({ topic_id, reporter_id, reason, notes })
      .select('*')
      .single();
    return errTuple(res);
  },

  async listReports(supabase: SupabaseClientType = createClient()) {
    const res = await supabase
      .from('reports')
      .select('*, topics(id, title), profiles!reporter_id(username)')
      .order('created_at', { ascending: false });
    return errTuple(res);
  },

  async updateReport(id: number, patch: object, supabase: SupabaseClientType = createClient()) {
    const res = await supabase
      .from('reports')
      .update(patch)
      .eq('id', id)
      .select('*')
      .single();
    return errTuple(res);
  },

  // Posts
  async listPosts({ topicId }: { topicId: number }, supabase: SupabaseClientType = createClient()) {
    const res = await supabase
      .from('posts')
      .select('*, profiles(username, role)')
      .eq('topic_id', topicId)
      .eq('status', 'published')
      .order('created_at', { ascending: true });
    return errTuple(res);
  },

  async createPost({ topic_id, body }: { topic_id: number, body: string }, supabase: SupabaseClientType = createClient()) {
    const { data: user } = await supabase.auth.getUser();
    const author_id = user?.user?.id || null;
    if (!author_id) return [null, new Error('User not authenticated')];

    const res = await supabase
      .from('posts')
      .insert({ topic_id, author_id, body })
      .select('*')
      .single();
    return errTuple(res);
  },

  async getPost(id: number, supabase: SupabaseClientType = createClient()) {
    const res = await supabase
      .from('posts')
      .select('*, profiles(username, role)')
      .eq('id', id)
      .single();
    return errTuple(res);
  },

  async updatePost(id: number, patch: object, supabase: SupabaseClientType = createClient()) {
    const res = await supabase
      .from('posts')
      .update(patch)
      .eq('id', id)
      .select('*')
      .single();
    return errTuple(res);
  },

  async deletePost(id: number, supabase: SupabaseClientType = createClient()) {
    const res = await supabase
      .from('posts')
      .delete()
      .eq('id', id);
    return errTuple(res);
  },
};

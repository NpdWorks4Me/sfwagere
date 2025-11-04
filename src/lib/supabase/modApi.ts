import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/lib/database.types';

type Topic = Database['forum']['Tables']['topics']['Row'] & {
  categories: { slug: string } | null;
};

type Report = Database['forum']['Tables']['reports']['Row'] & {
  topics: { id: string; title: string } | null;
};

type AuditLog = Database['forum']['Tables']['audit_log']['Row'];

// Role check: expects profiles.role to be 'mod' or 'admin'
async function isModerator(supabase: SupabaseClient<Database, 'forum'>): Promise<boolean> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;
    const { data, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('user_id', user.id)
      .single();
    if (error) throw error;
    return data?.role === 'mod' || data?.role === 'admin';
  } catch (e) {
    console.warn('[modApi] isModerator check failed', e);
    return false;
  }
}

// Pending topics (status = 'pending'), optionally filter by category slug and search
async function listPending(supabase: SupabaseClient<Database, 'forum'>, { categorySlug = null, search = '' }: { categorySlug?: string | null, search?: string } = {}): Promise<Topic[]> {
  let q = supabase.from('topics')
    .select('id,title,body,status,is_pinned,is_locked,flags_count,updated_at, categories!category_id(slug), author_id')
    .eq('status', 'pending')
    .order('updated_at', { ascending: false })
    .limit(100);
  if (categorySlug) q = q.eq('categories.slug', categorySlug);
  if (search && search.trim()) {
    const s = search.trim().replace(/[%_]/g, '\\$&'); // Escape % and _ for ilike
    q = q.ilike('title', `%${s}%`);
  }
  const { data, error } = await q;
  if (error) throw error;
  return data as unknown as Topic[];
}

async function listOpenReports(supabase: SupabaseClient<Database, 'forum'>): Promise<Report[]> {
  const { data, error } = await supabase
    .from('reports')
    .select('id, created_at, status, reason, notes, topics!topic_id(id, title)')
    .eq('status', 'open')
    .order('created_at', { ascending: false })
    .limit(100);
  if (error) throw error;
  return data as unknown as Report[];
}

async function listRecentAudit(supabase: SupabaseClient<Database, 'forum'>): Promise<AuditLog[]> {
  const { data, error } = await supabase
    .from('audit_log')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50);
  if (error) throw error;
  return data as AuditLog[];
}

// Actions
async function approveTopic(supabase: SupabaseClient<Database, 'forum'>, id: string) {
  const { error } = await supabase.from('topics').update({ status: 'published' }).eq('id', id);
  if (error) throw error;
}

async function deleteTopic(supabase: SupabaseClient<Database, 'forum'>, id: string) {
  const { error } = await supabase.from('topics').delete().eq('id', id);
  if (error) throw error;
}

async function togglePin(supabase: SupabaseClient<Database, 'forum'>, id: string, isPinned: boolean) {
  const { error } = await supabase.from('topics').update({ is_pinned: !isPinned }).eq('id', id);
  if (error) throw error;
}

async function toggleLock(supabase: SupabaseClient<Database, 'forum'>, id: string, isLocked: boolean) {
  const { error } = await supabase.from('topics').update({ is_locked: !isLocked }).eq('id', id);
  if (error) throw error;
}

async function resolveReport(supabase: SupabaseClient<Database, 'forum'>, id: string) {
  const { error } = await supabase.from('reports').update({ status: 'closed' }).eq('id', id);
  if (error) throw error;
}

export const modApi = {
  isModerator,
  listPending,
  listOpenReports,
  listRecentAudit,
  approveTopic,
  deleteTopic,
  togglePin,
  toggleLock,
  resolveReport
};

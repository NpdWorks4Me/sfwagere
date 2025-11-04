'use client';

import { useState, useEffect, useCallback } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { modApi } from '@/lib/supabase/modApi';
import { Database } from '@/lib/database.types';

type Topic = Awaited<ReturnType<typeof modApi.listPending>>[0];
type Report = Awaited<ReturnType<typeof modApi.listOpenReports>>[0];
type AuditLog = Awaited<ReturnType<typeof modApi.listRecentAudit>>[0];

export default function ModeratorPage() {
  const router = useRouter();
  const supabase = createBrowserClient<Database, 'forum'>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const [pending, setPending] = useState<Topic[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [audit, setAudit] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('all');

  const esc = (s: any) => String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');

  const loadAll = useCallback(async () => {
    const isMod = await modApi.isModerator(supabase);
    if (!isMod) {
      alert('Moderator access required.');
      router.push('/forum');
      return;
    }

    setLoading(true);
    try {
      const [pendingData, reportsData, auditData] = await Promise.all([
        modApi.listPending(supabase, { categorySlug: category === 'all' ? null : category, search: searchTerm }),
        modApi.listOpenReports(supabase),
        modApi.listRecentAudit(supabase)
      ]);
      setPending(pendingData);
      setReports(reportsData);
      setAudit(auditData);
    } catch (error) {
      console.error('Error loading moderator data:', error);
      alert('Failed to load moderator data.');
    } finally {
      setLoading(false);
    }
  }, [supabase, router, category, searchTerm]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const handleAction = async (action: string, id: string, currentStatus?: boolean) => {
    try {
      if (action === 'approve') await modApi.approveTopic(supabase, id);
      if (action === 'delete') { if (confirm('Delete this topic?')) await modApi.deleteTopic(supabase, id); }
      if (action === 'pin') await modApi.togglePin(supabase, id, !!currentStatus);
      if (action === 'lock') await modApi.toggleLock(supabase, id, !!currentStatus);
      if (action === 'resolve') await modApi.resolveReport(supabase, id);
      await loadAll();
    } catch (err) {
      alert('Action failed: ' + (err instanceof Error ? err.message : String(err)));
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/forum');
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <main className="main-content">
      <section className="section-content mod-section">
        <header className="section-header">
          <h2 className="glitch-title" data-text="MODERATOR CONSOLE">Moderator Console</h2>
          <p className="section-tagline">Review, approve, and manage reports</p>
          <div>
            <button onClick={handleSignOut} className="btn">Sign out</button>
          </div>
        </header>
        <div className="mod-section">
          <div className="util-row">
            <h2>Pending topics</h2>
            <div className="util-right">
              <input type="search" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="input" placeholder="Search pending…" />
              <select value={category} onChange={(e) => setCategory(e.target.value)} className="select" aria-label="Filter pending by category">
                <option value="all">All</option>
                <option value="everyday-life">Everyday Life</option>
                <option value="recovery-resilience">Support</option>
                <option value="resources-help">Resources</option>
                <option value="identity">Introductions</option>
                <option value="humor-memes">Off Topic</option>
              </select>
            </div>
          </div>
          <div className="mod-list" role="list">
            {pending.map(t => (
              <div key={t.id} className="mod-card" role="listitem">
                <div className="title"><strong>{esc(t.title)}</strong></div>
                <div className="meta">cat: {esc(t.categories?.slug || 'n/a')} • flags: {t.flags_count || 0} • updated: {t.updated_at || ''}</div>
                <div className="meta">
                  <span className={`badge ${esc(t.status)}`}>{esc(t.status)}</span>
                  {t.is_locked && <span className="badge locked">locked</span>}
                  {t.is_pinned && <span className="badge">pinned</span>}
                </div>
                <div className="mod-actions">
                  <button className="btn" onClick={() => handleAction('approve', t.id)}>Approve</button>
                  <button className="btn" onClick={() => handleAction('delete', t.id)}>Delete</button>
                  <button className="btn" onClick={() => handleAction('pin', t.id, t.is_pinned)}>{t.is_pinned ? 'Unpin' : 'Pin'}</button>
                  <button className="btn" onClick={() => handleAction('lock', t.id, t.is_locked)}>{t.is_locked ? 'Unlock' : 'Lock'}</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mod-grid">
          <section className="mod-section">
            <h2>Open reports</h2>
            <div className="mod-list" role="list">
              {reports.map(r => (
                <div key={r.id} className="mod-card" role="listitem">
                  <div className="title"><strong>{esc(r.topics?.title || 'Unknown topic')}</strong></div>
                  <div className="meta">reason: {esc(r.reason)} • status: <span className={`badge ${esc(r.status)}`}>{esc(r.status)}</span> • {esc(r.created_at)}</div>
                  {r.notes && <div className="meta">notes: {esc(r.notes)}</div>}
                  <div className="mod-actions">
                    <button className="btn" onClick={() => handleAction('resolve', r.id)}>Resolve</button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="mod-section">
            <h2>Audit (recent)</h2>
            <div className="mod-list" role="list">
              {audit.map(a => (
                <div key={a.id} className="mod-card" role="listitem">
                  <div className="meta">{esc(a.created_at)} • {esc(((a as any).actor_username || a.actor_id || 'system'))}</div>
                  <div>{esc(a.action || '')} on {esc(a.target_type)} {esc(a.target_id)}</div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}

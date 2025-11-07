'use client';

import { useEffect, useState } from 'react';
import { forumApi } from '@/lib/supabase/forumApi';

interface Topic {
  id: string;
  title: string;
  author_username: string;
  created_at: string;
  status: string;
}

interface Report {
  id: string;
  reason: string;
  status: string;
  created_at: string;
  topics: { title: string };
}

export default function ModerationDashboard() {
  const [pendingTopics, setPendingTopics] = useState<Topic[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      // Fetch pending topics (assuming we add a filter for status='pending')
      const [topicsRes] = await forumApi.listTopics({ pageSize: 50 }); // Adjust for pending
      const pending = (topicsRes?.items || []).filter(t => t.status === 'pending');
      setPendingTopics(pending as any);

      const [reportsRes] = await forumApi.listReports();
      setReports(reportsRes || []);
      setLoading(false);
    };
    loadData();
  }, []);

  const approveTopic = async (id: string) => {
    await forumApi.updateTopic(id, { status: 'published' });
    setPendingTopics(prev => prev.filter(t => t.id !== id));
  };

  const rejectTopic = async (id: string) => {
    await forumApi.deleteTopic(id);
    setPendingTopics(prev => prev.filter(t => t.id !== id));
  };

  const closeReport = async (id: string) => {
    await forumApi.updateReport(id, { status: 'closed' });
    setReports(prev => prev.filter(r => r.id !== id));
  };

  if (loading) return <p>Loading dashboard...</p>;

  return (
    <div className="moderation-dashboard">
      <section>
        <h2>Pending Topics</h2>
        {pendingTopics.length === 0 ? <p>No pending topics.</p> : (
          <ul>
            {pendingTopics.map(topic => (
              <li key={topic.id}>
                <strong>{topic.title}</strong> by {topic.author_username} ({new Date(topic.created_at).toLocaleDateString()})
                <button onClick={() => approveTopic(topic.id)}>Approve</button>
                <button onClick={() => rejectTopic(topic.id)}>Reject</button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2>Open Reports</h2>
        {reports.filter(r => r.status === 'open').length === 0 ? <p>No open reports.</p> : (
          <ul>
            {reports.filter(r => r.status === 'open').map(report => (
              <li key={report.id}>
                {report.reason} on "{report.topics?.title}" ({new Date(report.created_at).toLocaleDateString()})
                <button onClick={() => closeReport(report.id)}>Close</button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
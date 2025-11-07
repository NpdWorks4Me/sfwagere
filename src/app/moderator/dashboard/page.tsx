'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import ModerationDashboard from '@/components/ModerationDashboard';

export default function ModeratorDashboardPage() {
  const { isModerator, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isModerator) {
      router.push('/forum'); // Redirect non-mods
    }
  }, [isModerator, loading, router]);

  if (loading) return <div className="section-content"><p>Loading...</p></div>;
  if (!isModerator) return <div className="section-content"><p>Access denied.</p></div>;

  return (
    <div className="section-content">
      <h1>Moderator Dashboard</h1>
      <ModerationDashboard />
    </div>
  );
}
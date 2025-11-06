import NextDynamic from 'next/dynamic';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const ForumPageClient = NextDynamic(() => import('./ForumPageClient'), { ssr: false });

export default function ForumPage() {
  // Render client-only forum. The client component will fetch topics after mount.
  return <ForumPageClient topics={[]} />;
}

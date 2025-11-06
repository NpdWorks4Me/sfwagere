import NextDynamic from 'next/dynamic';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const TopicPageClient = NextDynamic(() => import('./TopicPageClient'), { ssr: false });

export default function TopicPage() {
  return <TopicPageClient />;
}

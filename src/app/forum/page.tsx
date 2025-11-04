import { createClient } from '@/lib/supabase/server';
import { forumApi } from '@/lib/supabase/forumApi';
import ForumPageClient from './ForumPageClient';

export const dynamic = 'force-dynamic';

export default async function ForumPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const supabase = createClient();
  const [topics, error] = await forumApi.listTopics(
    {
      categorySlug: searchParams.category as string,
      search: searchParams.search as string,
    },
    supabase
  );

  if (error) {
    // Handle error appropriately
    console.error(error);
  }

  const normalized = (topics || []).map((t: any) => ({
    ...t,
    categories: Array.isArray(t.categories) ? t.categories[0] : t.categories,
    profiles: Array.isArray(t.profiles) ? t.profiles[0] : t.profiles,
  }));

  return <ForumPageClient topics={normalized} />;
}

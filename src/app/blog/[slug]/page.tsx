
import { promises as fs } from 'fs';
import path from 'path';
import { notFound } from 'next/navigation';
import dynamic from 'next/dynamic';

const PostToc = dynamic(() => import('../../../components/PostToc'), { ssr: false });
const ReadingAid = dynamic(() => import('../../../components/ReadingAid'), { ssr: false });


// Resolve possible locations of posts directory and return the first that exists
async function resolvePostsDir(): Promise<string | null> {
  const candidates = [
    path.join(process.cwd(), 'posts'),
    path.join(process.cwd(), 'src', 'posts'),
    path.join(process.cwd(), 'public', 'posts'),
  ];
  for (const dir of candidates) {
    try {
      await fs.readdir(dir);
      return dir;
    } catch {
      // try next
    }
  }
  return null;
}

// This function will be used by Next.js to generate static pages for each blog post
export async function generateStaticParams() {
  const postsDirectory = await resolvePostsDir();
  if (!postsDirectory) return [];
  const filenames = await fs.readdir(postsDirectory);
  return filenames
    .filter((f) => /\.(html|md|mdx)$/i.test(f))
    .map((filename) => ({ slug: filename.replace(/\.(html|md|mdx)$/i, '') }));
}

// This function gets the content of a single post
async function getPost(slug: string) {
  const postsDirectory = await resolvePostsDir();
  if (!postsDirectory) return null;
  const filePathHtml = path.join(postsDirectory, `${slug}.html`);
  const filePathMdx = path.join(postsDirectory, `${slug}.mdx`);
  const filePathMd = path.join(postsDirectory, `${slug}.md`);
  const tryPaths = [filePathHtml, filePathMdx, filePathMd];
  for (const p of tryPaths) {
    try {
      const fileContent = await fs.readFile(p, 'utf8');
      const bodyMatch = fileContent.match(/<body[^>]*>([\s\S]*)<\/body>/i);
      const body = bodyMatch ? bodyMatch[1] : fileContent;
      return { content: body };
    } catch {
      // try next extension
    }
  }
  return null;
}

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = await getPost(params.slug);

  if (!post) {
    notFound();
  }

  return (
    <main className="main-content">
      <section className="section-content blog-section">
        <div className="blog-posts-container">
          <div className="post-layout">
            <article>
              {/* Optional: could derive a title from first h1, we keep inline content. */}
              <ReadingAid />
              <div className="post-body" dangerouslySetInnerHTML={{ __html: post.content }} />
              <PostToc />
            </article>
            <aside id="toc-aside" className="toc-aside" aria-label="Table of Contents">
              <button id="toc-toggle" className="toc-toggle" aria-controls="toc-collapsible-content" aria-expanded="false">
                Table of Contents
              </button>
              <div id="toc-collapsible-content" className="toc-collapsible">
                <ul className="toc-list"></ul>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </main>
  );
}

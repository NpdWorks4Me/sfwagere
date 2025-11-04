
import { promises as fs } from 'fs';
import path from 'path';
import { notFound } from 'next/navigation';


// This function will be used by Next.js to generate static pages for each blog post
export async function generateStaticParams() {
  const postsDirectory = path.join(process.cwd(), '../posts');
  const filenames = await fs.readdir(postsDirectory);
  return filenames.map((filename) => ({
    slug: filename.replace(/\.html$/, ''),
  }));
}

// This function gets the content of a single post
async function getPost(slug: string) {
  const postsDirectory = path.join(process.cwd(), '../posts');
  const filePath = path.join(postsDirectory, `${slug}.html`);
  try {
    const fileContent = await fs.readFile(filePath, 'utf8');
    // A simple way to extract the body content from the HTML file
    const bodyMatch = fileContent.match(/<body[^>]*>([\s\S]*)<\/body>/i);
    const body = bodyMatch ? bodyMatch[1] : '';
    return { content: body };
  } catch (error) {
    return null;
  }
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
          <article className="blog-post" dangerouslySetInnerHTML={{ __html: post.content }} />
        </div>
      </section>
    </main>
  );
}

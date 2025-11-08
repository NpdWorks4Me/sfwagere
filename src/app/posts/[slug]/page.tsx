import fs from 'node:fs';
import path from 'node:path';
import dynamic from 'next/dynamic';

const PostToc = dynamic(() => import('../../../components/PostToc'), { ssr: false });
const ReadingAid = dynamic(() => import('../../../components/ReadingAid'), { ssr: false });

interface Params { params: { slug: string } }

const slugToFile: Record<string, string> = {
  'two-faces-of-survival': 'two-faces-of-survival.html',
  'youre-not-broken-secret-rules': 'youre-not-broken-secret-rules.html'
};

const slugToTitle: Record<string, string> = {
  'two-faces-of-survival': 'The Two Faces of Survival',
  'youre-not-broken-secret-rules': "You're Not Broken: Secret Rules"
};

export function generateStaticParams() {
  return Object.keys(slugToFile).map((slug) => ({ slug }));
}

function readPostHtml(slug: string): string {
  const filename = slugToFile[slug];
  if (!filename) return `<p>Post not found.</p>`;
  const filePath = path.resolve(process.cwd(), 'posts', filename);
  try {
    const html = fs.readFileSync(filePath, 'utf8');
    const match = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
    const body = match ? match[1] : html;
    return sanitizePostHtml(body);
  } catch (e) {
    return `<p>Unable to load post.</p>`;
  }
}

function sanitizePostHtml(input: string): string {
  let s = input;
  // Prefer the main article content only
  const postBody = s.match(/<section[^>]*class=["'][^"']*\bpost-body\b[^"']*["'][^>]*>([\s\S]*?)<\/section>/i);
  if (postBody) {
    s = postBody[1];
  }
  // Remove large duplicate UI blocks if they appear
  s = s.replace(/<div[^>]*class=["'][^"']*\bimage-container\b[^"']*["'][^>]*>[\s\S]*?<\/div>/gi, '');
  s = s.replace(/<nav[^>]*class=["'][^"']*\bnavigation\b[^"']*["'][^>]*>[\s\S]*?<\/nav>/gi, '');
  s = s.replace(/<header[^>]*class=["'][^"']*\bheader\b[^"']*["'][^>]*>[\s\S]*?<\/header>/gi, '');
  s = s.replace(/<footer[^>]*class=["'][^"']*\bfooter\b[^"']*["'][^>]*>[\s\S]*?<\/footer>/gi, '');
  s = s.replace(/<div[^>]*class=["'][^"']*\bscroll-indicator\b[^"']*["'][^>]*>[\s\S]*?<\/div>/gi, '');
  // Remove any scripts within the content (JSON-LD or behavior scripts)
  s = s.replace(/<script[\s\S]*?<\/script>/gi, '');
  // Rewrite legacy .html internal links to Next routes
  s = s.replace(/href="\/(index)\.html"/gi, 'href="/"');
  s = s.replace(/href="\/(blog|forum|faq|join)\.html"/gi, (_m, p1) => `href="/${String(p1).toLowerCase()}"`);
  s = s.replace(/href="\/([a-z0-9\-]+)\.html"/gi, 'href="/$1"');

  // Inject IDs into all h2/h3
  const slugify = (str: string) =>
    str
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
  s = s.replace(/<(h[23])([^>]*)>(.*?)<\/h[23]>/gi, (match, tag, attrs, text) => {
    // If already has id, leave it
    if (/id=\s*['"][^'"]+['"]/.test(attrs)) return match;
    const id = slugify(text.replace(/<[^>]+>/g, ""));
    return `<${tag}${attrs} id="${id}">${text}</${tag}>`;
  });

  // Tidy leftover whitespace
  return s.trim();
}

export default function PostPage({ params }: Params) {
  const { slug } = params;
  const content = readPostHtml(slug);
  const title = slugToTitle[slug] ?? 'Post';
  return (
    <div className="post-layout">
      <article>
        <h1 className="site-title" data-heading="tus" data-text={title}>{title}</h1>
        {/* Reading time + progress bar */}
        <ReadingAid />
        <PostToc />
        <div className="post-body" dangerouslySetInnerHTML={{ __html: content }} />
      </article>
    </div>
  );
}

import { marked } from 'marked';
import sanitizeHtml from 'sanitize-html';

export function renderMarkdownServer(md: string): string {
  const raw = marked.parse(md || '');
  const safe = sanitizeHtml(String(raw), {
    // Reasonable default allowlist; adjust as needed
    allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img', 'h1', 'h2', 'h3', 'pre', 'code']),
    allowedAttributes: {
      ...sanitizeHtml.defaults.allowedAttributes,
      img: ['src', 'alt', 'title'],
      a: ['href', 'name', 'target', 'rel'],
    },
    allowedSchemes: ['http', 'https', 'mailto'],
    transformTags: {
      // Ensure links open safely
      'a': sanitizeHtml.simpleTransform('a', { target: '_blank', rel: 'noopener noreferrer' })
    }
  });
  return safe;
}

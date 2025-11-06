"use client";

import { marked } from 'marked';
import DOMPurify from 'dompurify';

// Configure marked for reasonably strict output
marked.setOptions({
  breaks: true,
  gfm: true,
});

export function renderMarkdown(md: string): string {
  try {
    const html = marked.parse(md || '');
    // Ensure string output (marked can return string or Promise/string types in some versions)
    // Use default DOMPurify allowlist; we can optionally tighten later.
    const safe = DOMPurify.sanitize(String(html));
    return safe;
  } catch {
    // Fallback to escaped text if something goes wrong
    const escaped = (md || '').replace(/[&<>"]/g, (c) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;'
    }[c] as string));
    return `<pre>${escaped}</pre>`;
  }
}

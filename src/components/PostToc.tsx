"use client";
import { useEffect, useState, useRef } from "react";

export default function PostToc() {
  const [open, setOpen] = useState(false);
  const [toc, setToc] = useState<Array<{ id: string; text: string; level: number }>>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const tocListRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const postBody = document.querySelector<HTMLElement>("article .post-body");
    if (!postBody) return;
    const headings = Array.from(postBody.querySelectorAll<HTMLElement>("h2, h3"));
    const slugify = (str: string) =>
      str
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-");
    const tocData: Array<{ id: string; text: string; level: number }> = headings.map((h) => {
      if (!h.id) h.id = slugify(h.textContent || "");
      return { id: h.id, text: h.textContent?.replace(/🚨|💡|✅/g, '').trim() || "", level: h.tagName === "H3" ? 3 : 2 };
    });
    setToc(tocData);

    // Scrollspy
    const handleScroll = () => {
      let current: string | null = null;
      for (const h of headings) {
        const rect = h.getBoundingClientRect();
        if (rect.top < 120) {
          current = h.id;
        }
      }
      setActiveId(current);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!toc.length) return null;

  return (
    <aside className="table-of-contents" id="toc-aside">
      <div
        id="toc-toggle"
        className="toc-toggle"
        tabIndex={0}
        role="button"
        aria-controls="toc-collapsible-content"
  aria-expanded={open ? 'true' : 'false'}
        onClick={() => setOpen((v) => !v)}
        onKeyDown={e => { if (e.key === "Enter" || e.key === " ") setOpen(v => !v); }}
      >
        Table of Contents <span className="toggle-icon">{open ? "▼" : "▶"}</span>
      </div>
      <div id="toc-collapsible-content" className={open ? "toc-collapsible" : "toc-collapsible hidden"}>
        <ul className="toc-list" ref={tocListRef}>
          {toc.map(item => (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                className={`toc-link${item.level === 3 ? " h3-level" : ""}${activeId === item.id ? " active-toc" : ""}`}
                onClick={() => setOpen(false)}
              >
                {item.text}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}

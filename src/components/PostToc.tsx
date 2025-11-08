"use client";
import { useEffect, useRef, useState } from "react";

// Dynamic, responsive dropdown Table of Contents
export default function PostToc() {
  const [open, setOpen] = useState(false);
  const [toc, setToc] = useState<null | Array<{ id: string; text: string; level: number }>>(null);
  const panelRef = useRef<HTMLDivElement>(null);

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
      return { id: h.id, text: h.textContent || "", level: h.tagName === "H3" ? 3 : 2 };
    });
    setToc(tocData);
  }, []);

  // Close on click outside
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  if (!toc || toc.length === 0) return null;

  return (
    <div className="toc-dropdown-wrap" ref={panelRef}>
      <button
        className="toc-dropdown-toggle"
        aria-controls="toc-dropdown-panel"
        aria-expanded={open ? "true" : "false"}
        onClick={() => setOpen((v) => !v)}
        onKeyDown={(e) => {
          if (e.key === "Escape") setOpen(false);
        }}
      >
        Table of Contents
        <span className="toggle-icon" aria-hidden>{open ? "▾" : "▸"}</span>
      </button>
      <div
        id="toc-dropdown-panel"
        className={`toc-dropdown-panel${open ? " toc-dropdown-open" : " toc-dropdown-closed"}`}
        tabIndex={-1}
        aria-hidden={open ? "false" : "true"}
      >
        <ul className="toc-list">
          {toc.map((item, i) => (
            <li key={item.id} className={item.level === 3 ? "toc-sub-list" : undefined}>
              <a href={`#${item.id}`} onClick={() => setOpen(false)}>{item.text}</a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

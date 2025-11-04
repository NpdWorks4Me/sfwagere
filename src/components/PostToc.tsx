"use client";

import { useEffect } from "react";

// Boots a client-side TOC: populates the .toc-list from h2/h3 inside article .post-body
export default function PostToc() {
  useEffect(() => {
    const postBody = document.querySelector<HTMLElement>("article .post-body");
    if (!postBody) return;

    const tocList = document.querySelector<HTMLUListElement>("#toc-aside .toc-list");
    const tocAside = document.getElementById("toc-aside");
    const tocToggle = document.getElementById("toc-toggle");
    const tocContent = document.getElementById("toc-collapsible-content");

    if (!tocList || !tocAside || !tocToggle || !tocContent) return;

    // Build list from headings
    const headings = Array.from(postBody.querySelectorAll<HTMLElement>("h2, h3"));
    // Clear existing list
    tocList.innerHTML = "";

    let currentUl: HTMLUListElement = tocList;
    let lastLevel = 2;

    const slugify = (str: string) =>
      str
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-");

    headings.forEach((h) => {
      const level = h.tagName === "H3" ? 3 : 2;
      if (!h.id) h.id = slugify(h.textContent || "");
      const li = document.createElement("li");
      const a = document.createElement("a");
      a.href = `#${h.id}`;
      a.textContent = h.textContent || "";
      li.appendChild(a);

      if (level > lastLevel) {
        // create a sub-list
        const sub = document.createElement("ul");
        sub.className = "toc-sub-list";
        currentUl.appendChild(sub);
        currentUl = sub;
      } else if (level < lastLevel) {
        // climb back to parent list (one level)
        const parent = currentUl.parentElement?.closest(
          ".toc-list, .toc-sub-list"
        ) as HTMLUListElement | null;
        currentUl = parent || tocList;
      }

      currentUl.appendChild(li);
      lastLevel = level;
    });

    // Toggle behavior and a11y
    tocToggle.setAttribute("role", "button");
    tocToggle.setAttribute("tabindex", "0");
    tocToggle.setAttribute("aria-controls", "toc-collapsible-content");
    tocToggle.setAttribute(
      "aria-expanded",
      tocAside.classList.contains("toc-open") ? "true" : "false"
    );

    const onToggle = () => {
      tocAside.classList.toggle("toc-open");
      tocToggle.setAttribute(
        "aria-expanded",
        tocAside.classList.contains("toc-open") ? "true" : "false"
      );
    };

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        onToggle();
      }
    };

    const onClickOutside = (event: MouseEvent) => {
      if (
        tocAside &&
        !tocAside.contains(event.target as Node) &&
        tocAside.classList.contains("toc-open")
      ) {
        tocAside.classList.remove("toc-open");
        tocToggle.setAttribute("aria-expanded", "false");
      }
    };

    tocToggle.addEventListener("click", onToggle);
    tocToggle.addEventListener("keydown", onKey);
    document.addEventListener("click", onClickOutside);

    return () => {
      tocToggle.removeEventListener("click", onToggle);
      tocToggle.removeEventListener("keydown", onKey);
      document.removeEventListener("click", onClickOutside);
    };
  }, []);

    return null;
}

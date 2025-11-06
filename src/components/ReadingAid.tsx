"use client";

import { useEffect, useState } from "react";

function getWordCount(root: HTMLElement | null): number {
  if (!root) return 0;
  const text = root.innerText || "";
  const words = text.trim().split(/\s+/).filter(Boolean);
  return words.length;
}

export default function ReadingAid() {
  const [minutes, setMinutes] = useState<number | null>(null);

  useEffect(() => {
    const bodyEl = document.querySelector<HTMLElement>("article .post-body");
    if (bodyEl) {
      const words = getWordCount(bodyEl);
      const mins = Math.max(1, Math.round(words / 200)); // ~200 wpm
      setMinutes(mins);
    }

    const progressBar = document.getElementById("read-progress-bar");
    if (!progressBar || !bodyEl) return;

    const onScroll = () => {
      const bodyTop = bodyEl.getBoundingClientRect().top + window.scrollY;
      const bodyHeight = bodyEl.getBoundingClientRect().height;
      const viewport = window.innerHeight;
      const total = Math.max(1, bodyTop + bodyHeight - viewport);
      const scrolled = Math.min(Math.max(0, window.scrollY - bodyTop), total);
      const pct = Math.min(100, Math.max(0, (scrolled / total) * 100));
      progressBar.style.width = pct + "%";
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <>
      <div className="post-meta">
        {minutes != null && (
          <span className="reading-time" aria-label="Estimated reading time">
            {minutes} min read
          </span>
        )}
      </div>
      <div className="read-progress" aria-hidden="true">
        <div id="read-progress-bar" className="read-progress__bar" />
      </div>
    </>
  );
}

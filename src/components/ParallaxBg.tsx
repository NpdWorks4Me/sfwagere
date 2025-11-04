"use client";
import { useEffect, useRef } from 'react';

export default function ParallaxBg() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let ticking = false;
    function update() {
      if (!el) return;
      const scrolled = window.pageYOffset || 0;
      const yPos = -(scrolled * 0.4);
      el.style.transform = `translate3d(0, ${yPos}px, 0)`;
      ticking = false;
    }
    function onScroll() {
      if (!ticking) {
        requestAnimationFrame(update);
        ticking = true;
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    update();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return <div ref={ref} className="parallax-bg" aria-hidden="true" />;
}

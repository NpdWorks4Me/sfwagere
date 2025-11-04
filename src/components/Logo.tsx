"use client";
import { useEffect, useRef } from 'react';

export default function Logo() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const el = ref.current;
      if (!el) return;
      try {
        const { gsap } = await import('gsap');
        if (cancelled) return;
        gsap.to(el, { y: -3, duration: 3, ease: 'power1.inOut', repeat: -1, yoyo: true });
        el.addEventListener('mouseenter', () => gsap.to(el, { scale: 1.05, duration: 0.3 }));
        el.addEventListener('mouseleave', () => gsap.to(el, { scale: 1, duration: 0.3 }));
      } catch {
        // no-op; leave static
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  return (
    <div ref={ref} className="logo-block" />
  );
}

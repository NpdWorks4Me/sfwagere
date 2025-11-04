"use client";
import { useEffect, useState } from 'react';

export default function LoadingScreen() {
  const [done, setDone] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setDone(true), 800);
    return () => clearTimeout(t);
  }, []);
  if (done) return null;
  return (
    <div className="loading-screen" aria-live="polite">
      <div className="word">[altering_reality...]</div>
      <div className="overlay" />
    </div>
  );
}

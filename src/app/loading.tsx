'use client';

import { useEffect, useRef } from 'react';

export default function Loading() {
  const textRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    console.log('Loading component rendered');
    const words = ["[analyzing_trauma...]", "[decrypting_memories...]", "[recalibrating_reality...]", "[finding_the_lost_child...]", "[welcome.]"];
    let wordIndex = 0;

    const interval = setInterval(() => {
      wordIndex++;
      if (wordIndex < words.length) {
        if (textRef.current) {
          textRef.current.textContent = words[wordIndex];
        }
      } else {
        clearInterval(interval);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="page-loading">
      <div ref={textRef}>[altering_reality...]</div>
    </div>
  );
}
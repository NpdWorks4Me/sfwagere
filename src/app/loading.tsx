'use client';

import { useEffect, useState, useRef } from 'react';

export default function Loading() {
  const [text, setText] = useState('[altering_reality...]');
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    console.log('Loading component rendered');
    const words = ["[analyzing_trauma...]", "[decrypting_memories...]", "[recalibrating_reality...]", "[finding_the_lost_child...]", "[welcome.]"];
    let wordIndex = 0;

    intervalRef.current = setInterval(() => {
      wordIndex++;
      if (wordIndex < words.length) {
        setText(words[wordIndex]);
      } else {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      }
    }, 3000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, []);

  return (
    <div className="page-loading">
      <div>{text}</div>
    </div>
  );
}
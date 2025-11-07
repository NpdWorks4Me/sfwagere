'use client';

import { useEffect, useState } from 'react';

export default function Loading() {
  const [text, setText] = useState('[altering_reality...]');

  useEffect(() => {
    const words = ["[analyzing_trauma...]", "[decrypting_memories...]", "[recalibrating_reality...]", "[finding_the_lost_child...]", "[welcome.]"];
    let wordIndex = 0;

    const interval = setInterval(() => {
      wordIndex++;
      if (wordIndex < words.length) {
        setText(words[wordIndex]);
      } else {
        clearInterval(interval);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="page-loading">
      <div>{text}</div>
    </div>
  );
}
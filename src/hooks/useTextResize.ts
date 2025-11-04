"use client";
import { useCallback, useEffect, useState } from 'react';

type Size = '1' | '2' | '3';

const STORAGE_KEY = 'uas_text_size';
const nextMap: Record<Size, Size> = { '1': '2', '2': '3', '3': '1' };

function read(): Size {
  if (typeof window === 'undefined') return '1';
  const s = localStorage.getItem(STORAGE_KEY);
  return s === '2' || s === '3' ? s : '1';
}

export default function useTextResize() {
  const [size, setSize] = useState<Size>('1');

  useEffect(() => {
    setSize(read());
  }, []);

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-text-size', size);
      localStorage.setItem(STORAGE_KEY, size);
    }
  }, [size]);

  const cycle = useCallback(() => setSize(prev => nextMap[prev]), []);

  const label = size === '1' ? 'A+' : size === '2' ? 'A++' : 'A-';
  const title = size === '1' ? 'Increase text size' : size === '2' ? 'Further increase text size' : 'Reset text size';

  return { size, cycle, label, title };
}

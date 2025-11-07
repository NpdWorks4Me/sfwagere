'use client';

import styles from './ParallaxBackground.module.css';

// Minimal, safe background component (no JS animations)
export default function ParallaxBackground() {
  return <div className={styles.parallaxBg} aria-hidden="true" />;
}

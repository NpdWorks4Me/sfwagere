'use client';

import { useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import styles from './ParallaxBackground.module.css';

gsap.registerPlugin(ScrollTrigger);

const ParallaxBackground = () => {
  useEffect(() => {
    gsap.to(`.${styles.parallaxBg}`, {
      backgroundPosition: '50% 100%',
      ease: 'none',
      scrollTrigger: {
        trigger: 'body',
        start: 'top top',
        end: 'bottom top',
        scrub: true,
      },
    });
  }, []);

  return <div className={styles.parallaxBg}></div>;
};

export default ParallaxBackground;

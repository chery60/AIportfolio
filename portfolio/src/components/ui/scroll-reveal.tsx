'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';

interface ScrollRevealProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  yOffset?: number;
  blur?: string;
  once?: boolean;
  margin?: string;
}

/**
 * Scroll-triggered reveal animation — text/content gently unblurs and slides up as it enters viewport.
 * Inspired by react-bits.dev/text-animations/scroll-reveal
 */
export function ScrollReveal({
  children,
  className,
  delay = 0,
  duration = 0.6,
  yOffset = 24,
  blur = '8px',
  once = true,
  margin = '-50px',
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const isInView = useInView(ref, { once, margin: margin as any });

  return (
    <motion.div
      ref={ref}
      initial={{ y: yOffset, opacity: 0, filter: `blur(${blur})` }}
      animate={
        isInView
          ? { y: 0, opacity: 1, filter: 'blur(0px)' }
          : { y: yOffset, opacity: 0, filter: `blur(${blur})` }
      }
      transition={{
        delay,
        duration,
        ease: [0.21, 0.47, 0.32, 0.98],
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

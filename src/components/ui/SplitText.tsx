'use client';

import { motion } from 'framer-motion';
import { charStagger, charChild } from '@/lib/motion';

type SplitTextProps = {
  text: string;
  className?: string;
  delay?: number;
  by?: 'char' | 'word';
  once?: boolean;
};

// Splits text into per-char or per-word spans for masked stagger reveals.
// Each unit is wrapped in an overflow-hidden parent so the children can
// translateY from 110% → 0 for a curtain-rise effect.
export default function SplitText({
  text,
  className,
  delay = 0,
  by = 'word',
  once = true,
}: SplitTextProps) {
  const units = by === 'word' ? text.split(' ') : text.split('');

  return (
    <motion.span
      className={className}
      variants={charStagger}
      initial="hidden"
      whileInView="show"
      viewport={{ once, amount: 0.4 }}
      transition={{ delayChildren: delay }}
      style={{ display: 'inline-block' }}
      aria-label={text}
    >
      {units.map((unit, i) => (
        <span
          key={i}
          aria-hidden
          style={{
            display: 'inline-block',
            overflow: 'hidden',
            verticalAlign: 'top',
            marginRight: by === 'word' ? '0.25em' : 0,
          }}
        >
          <motion.span
            variants={charChild}
            style={{ display: 'inline-block', willChange: 'transform' }}
          >
            {unit === ' ' ? ' ' : unit}
          </motion.span>
        </span>
      ))}
    </motion.span>
  );
}

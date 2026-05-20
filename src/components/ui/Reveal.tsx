'use client';

import { motion, type Variants } from 'framer-motion';
import { fadeRise } from '@/lib/motion';

type RevealProps = {
  children: React.ReactNode;
  delay?: number;
  variants?: Variants;
  className?: string;
  as?: 'div' | 'section' | 'article' | 'span';
  once?: boolean;
  amount?: number;
};

export default function Reveal({
  children,
  delay = 0,
  variants = fadeRise,
  className,
  as = 'div',
  once = true,
  amount = 0.25,
}: RevealProps) {
  const MotionTag = motion[as] as typeof motion.div;
  return (
    <MotionTag
      className={className}
      variants={variants}
      initial="hidden"
      whileInView="show"
      viewport={{ once, amount }}
      transition={{ delay }}
    >
      {children}
    </MotionTag>
  );
}

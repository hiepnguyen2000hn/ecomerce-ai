'use client';

import { motion, Variants } from 'framer-motion';
import { cn } from '@/lib/utils';

interface TextAnimateProps {
  text: string;
  type?: 'word' | 'char';
  animation?: 'fade' | 'slide-up' | 'blur-in';
  className?: string;
  delay?: number;
}

const variants: Record<string, Variants> = {
  'fade': {
    hidden: { opacity: 0 },
    show: { opacity: 1 }
  },
  'slide-up': {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  },
  'blur-in': {
    hidden: { opacity: 0, filter: 'blur(10px)' },
    show: { opacity: 1, filter: 'blur(0px)' }
  }
};

export function TextAnimate({ 
  text, 
  type = 'word', 
  animation = 'fade', 
  className,
  delay = 0 
}: TextAnimateProps) {
  const items = type === 'word' ? text.split(' ') : text.split('');
  
  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={{
        show: {
          transition: {
            staggerChildren: type === 'word' ? 0.1 : 0.02,
            delayChildren: delay,
          }
        }
      }}
      className={cn("inline-block", className)}
    >
      {items.map((item, i) => (
        <motion.span
          key={i}
          variants={variants[animation]}
          className={cn(
            "inline-block",
            type === 'word' ? "mr-[0.25em]" : ""
          )}
        >
          {item === ' ' ? '\u00A0' : item}
        </motion.span>
      ))}
    </motion.div>
  );
}

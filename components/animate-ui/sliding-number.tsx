'use client';

import { useEffect, useState } from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';
import { cn } from '@/lib/utils';

interface SlidingNumberProps {
  value: number;
  className?: string;
}

export function SlidingNumber({ value, className }: SlidingNumberProps) {
  const digits = value.toString().split('');

  return (
    <div className={cn("flex flex-row overflow-hidden leading-none", className)}>
      {digits.map((digit, i) => (
        <Digit key={`${i}-${digit}`} digit={digit} />
      ))}
    </div>
  );
}

function Digit({ digit }: { digit: string }) {
  const num = parseInt(digit);
  const isNumber = !isNaN(num);
  
  if (!isNumber) {
    return <span>{digit}</span>;
  }

  return (
    <div className="relative h-[1em] w-[0.6em]">
      <motion.div
        initial={{ y: 0 }}
        animate={{ y: `-${num * 10}%` }}
        transition={{ type: "spring", stiffness: 50, damping: 15 }}
        className="absolute top-0 left-0 flex flex-col"
      >
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
          <span key={n} className="flex h-[1em] w-full items-center justify-center">
            {n}
          </span>
        ))}
      </motion.div>
    </div>
  );
}

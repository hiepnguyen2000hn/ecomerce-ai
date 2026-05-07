'use client';

import React from 'react';
import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface InteractiveHoverButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

export const InteractiveHoverButton = React.forwardRef<HTMLButtonElement, InteractiveHoverButtonProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "group relative w-auto cursor-pointer overflow-hidden rounded-full border border-white/10 bg-white/5 p-4 px-8 text-center font-semibold text-white transition-all hover:bg-white/10",
          className
        )}
        {...props}
      >
        <div className="flex items-center justify-center gap-2">
          <div className="inline-block transition-all duration-300 group-hover:translate-x-12 group-hover:opacity-0">
            {children}
          </div>
          <div className="absolute top-0 z-10 flex h-full w-full translate-x-12 items-center justify-center gap-2 opacity-0 transition-all duration-300 group-hover:-translate-x-0 group-hover:opacity-100">
            <span>{children}</span>
            <ArrowRight className="size-4" />
          </div>
        </div>
        
        {/* Background animation effect */}
        <div className="absolute left-[20%] top-[40%] h-2 w-2 scale-[1] rounded-full bg-white transition-all duration-500 group-hover:left-0 group-hover:top-0 group-hover:h-full group-hover:w-full group-hover:scale-[1.8] group-hover:opacity-10" />
      </button>
    );
  }
);

InteractiveHoverButton.displayName = "InteractiveHoverButton";

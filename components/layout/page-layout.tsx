'use client';

import React from 'react';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface BreadcrumbItem {
  label: string;
  onClick?: () => void;
}

interface PageLayoutProps {
  breadcrumb?: BreadcrumbItem[];
  headerRight?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  /** Classes applied to the content wrapper. Use to control scroll, padding, flex layout. */
  contentClassName?: string;
}

export function PageLayout({
  breadcrumb,
  headerRight,
  children,
  className,
  contentClassName,
}: PageLayoutProps) {
  const hasHeader = (breadcrumb && breadcrumb.length > 0) || headerRight;

  return (
    <div className={cn('flex flex-col h-full bg-[#f8f9fc] dark:bg-[#080808]', className)}>
      {hasHeader && (
        <div className="sticky top-0 z-30 shrink-0 flex items-center justify-between px-4 sm:px-6 lg:px-10 xl:px-12 py-5 bg-[#f8f9fc]/80 dark:bg-[#080808]/80 backdrop-blur-md">
          {breadcrumb && breadcrumb.length > 0 && (
            <nav className="flex items-center gap-1.5 text-[11px] font-semibold text-gray-500 min-w-0">
              {breadcrumb.map((item, i) => (
                <React.Fragment key={i}>
                  {i > 0 && <ChevronRight size={12} className="text-gray-600 shrink-0" />}
                  {item.onClick ? (
                    <button
                      onClick={item.onClick}
                      className="hover:text-black dark:hover:text-white transition-colors shrink-0"
                    >
                      {item.label}
                    </button>
                  ) : (
                    <span className="text-black/70 dark:text-white/70 truncate">{item.label}</span>
                  )}
                </React.Fragment>
              ))}
            </nav>
          )}
          {headerRight && <div className="flex items-center gap-3">{headerRight}</div>}
        </div>
      )}
      <div className={cn('flex-1 min-h-0', contentClassName)}>
        {children}
      </div>
    </div>
  );
}

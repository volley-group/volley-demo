import { cn } from '@/lib/utils';
import React from 'react';

export const Inner = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('max-w-screen-2xl w-full px-4', className)} {...props} />
  )
);

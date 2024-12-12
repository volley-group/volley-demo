// src/components/ui/icon/types.ts
import { ComponentProps } from 'react';
import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

type IconSizeVariant = 'icon' | 'default' | 'lg' | 'xl' | '2xl';

const sizeVariants: Record<IconSizeVariant, number> = {
  icon: 16,
  default: 24,
  lg: 32,
  xl: 48,
  '2xl': 64,
};

export type IconProps = ComponentProps<'img'> & {
  size?: number;
  color?: string;
  variant?: IconSizeVariant;
};

export const CustomIcon = forwardRef<HTMLImageElement, IconProps>(
  ({ className, color, size, variant = 'default', children, ...props }, ref) => {
    const finalSize = size || sizeVariants[variant];

    return (
      <img ref={ref} width={finalSize} height={finalSize} className={cn('', className)} {...props}>
        {children}
      </img>
    );
  }
);

CustomIcon.displayName = 'CustomIcon';

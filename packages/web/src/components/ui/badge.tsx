import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground shadow",
        secondary: "border-transparent bg-secondary text-secondary-foreground",
        destructive: "border-transparent bg-destructive text-destructive-foreground shadow",
        outline: "text-foreground",
      },
      hoverable: {
        true: "",
      },
    },
    compoundVariants: [
      {
        variant: "default",
        hoverable: true,
        className: "hover:bg-primary/80",
      },
      {
        variant: "secondary",
        hoverable: true,
        className: "hover:bg-secondary/80",
      },
      {
        variant: "destructive",
        hoverable: true,
        className: "hover:bg-destructive/80",
      },
    ],
    defaultVariants: {
      variant: "default",
      hoverable: false,
    },
  }
);

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {
  hoverable?: boolean;
}

const Badge = ({ className, variant, hoverable, ...props }: BadgeProps) => (
  <div className={cn(badgeVariants({ variant, hoverable }), className)} {...props} />
);

export { Badge, badgeVariants };

'use client';

import React, { HTMLAttributes, ReactNode } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

// Define card variants using class-variance-authority
const cardVariants = cva(
  "decode-card border rounded-lg backdrop-blur-sm transition-all",
  {
    variants: {
      variant: {
        default: "border-decode-green/30 bg-decode-glassbg hover:border-decode-green/40",
        secondary: "border-decode-blue/30 bg-decode-glassbg hover:border-decode-blue/40",
        warning: "border-yellow-500/30 bg-decode-glassbg hover:border-yellow-500/40",
        error: "border-red-500/30 bg-decode-glassbg hover:border-red-500/40",
        ghost: "border-transparent bg-transparent"
      },
      hover: {
        default: "hover:transform hover:translate-y-[-2px] hover:shadow-lg hover:shadow-decode-green/10",
        none: ""
      },
      padding: {
        none: "p-0",
        small: "p-2",
        default: "p-4",
        large: "p-6"
      }
    },
    defaultVariants: {
      variant: "default",
      hover: "default",
      padding: "default"
    }
  }
);

export interface CardProps 
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {
  children: ReactNode;
  bordered?: boolean;
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, hover, padding, children, ...props }, ref) => {
    return (
      <div
        className={cn(cardVariants({ variant, hover, padding, className }))}
        ref={ref}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = "Card";

// Card Header Component
interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        className={cn("flex flex-col space-y-1.5 pb-4", className)}
        ref={ref}
        {...props}
      >
        {children}
      </div>
    );
  }
);

CardHeader.displayName = "CardHeader";

// Card Title Component
interface CardTitleProps extends HTMLAttributes<HTMLHeadingElement> {
  children: ReactNode;
}

const CardTitle = React.forwardRef<HTMLHeadingElement, CardTitleProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <h3
        className={cn("text-lg font-semibold text-decode-white", className)}
        ref={ref}
        {...props}
      >
        {children}
      </h3>
    );
  }
);

CardTitle.displayName = "CardTitle";

// Card Description Component
interface CardDescriptionProps extends HTMLAttributes<HTMLParagraphElement> {
  children: ReactNode;
}

const CardDescription = React.forwardRef<HTMLParagraphElement, CardDescriptionProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <p
        className={cn("text-sm text-gray-400", className)}
        ref={ref}
        {...props}
      >
        {children}
      </p>
    );
  }
);

CardDescription.displayName = "CardDescription";

// Card Content Component
interface CardContentProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

const CardContent = React.forwardRef<HTMLDivElement, CardContentProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div 
        className={cn("", className)} 
        ref={ref} 
        {...props}
      >
        {children}
      </div>
    );
  }
);

CardContent.displayName = "CardContent";

// Card Footer Component
interface CardFooterProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

const CardFooter = React.forwardRef<HTMLDivElement, CardFooterProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        className={cn("flex items-center pt-4", className)}
        ref={ref}
        {...props}
      >
        {children}
      </div>
    );
  }
);

CardFooter.displayName = "CardFooter";

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, cardVariants };

'use client';

import React, { ButtonHTMLAttributes, ReactNode, forwardRef } from 'react';
import Link from 'next/link';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

// Define button variants using class-variance-authority
const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-lg text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-decode-green/50 disabled:opacity-50 disabled:pointer-events-none",
  {
    variants: {
      variant: {
        primary: "bg-decode-green text-white hover:bg-decode-green/90",
        secondary: "bg-transparent border border-decode-green/30 text-decode-white hover:border-decode-green hover:text-decode-green",
        outline: "border border-decode-green/30 bg-transparent text-decode-white hover:border-decode-green/60",
        ghost: "bg-transparent text-decode-white hover:text-decode-green",
        link: "text-decode-green underline-offset-4 hover:underline p-0 h-auto"
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 px-3 py-1 text-xs",
        lg: "h-12 px-6 py-3",
        icon: "h-10 w-10 p-0"
      }
    },
    defaultVariants: {
      variant: "primary",
      size: "default"
    }
  }
);

// Add props interface extending HTML button attributes and our variants
export interface ButtonProps 
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  children: ReactNode;
  loading?: boolean;
  href?: string;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>((
  { className, variant, size, loading, children, disabled, href, ...props }, ref) => {
    const buttonClasses = cn(buttonVariants({ variant, size, className }));
    
    // If href is provided, render as Link
    if (href) {
      return (
        <Link href={href} className={buttonClasses}>
          {loading && (
            <div className="mr-2">
              <svg className="animate-spin h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
          )}
          {children}
        </Link>
      );
    }
    
    // Otherwise render as button
    return (
      <button
        className={buttonClasses}
        ref={ref}
        disabled={loading || disabled}
        {...props}
      >
        {loading && (
          <div className="mr-2">
            <svg className="animate-spin h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";

export { Button, buttonVariants };

'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps
    extends React.InputHTMLAttributes<HTMLInputElement> { }

const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className, type, ...props }, ref) => {
        return (
            <input
                type={type}
                className={cn(
                    "flex h-10 w-full rounded-md border border-decode-green/30 bg-decode-black/30 p-3 text-sm text-decode-white ring-offset-decode-black placeholder:text-decode-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-decode-green focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                    className
                )}
                ref={ref}
                {...props}
            />
        );
    }
);

Input.displayName = 'Input';

export { Input }; 
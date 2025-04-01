'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

interface ToastProps {
    variant?: 'default' | 'destructive' | 'success';
    title?: string;
    description?: string;
    action?: React.ReactNode;
    className?: string;
    onClose?: () => void;
}

const Toast = React.forwardRef<HTMLDivElement, ToastProps>(
    ({ variant = 'default', title, description, action, className, onClose, ...props }, ref) => {
        const variantClasses = {
            default: 'bg-decode-black/80 border-decode-green/40 text-decode-white',
            destructive: 'bg-red-900/80 border-red-500/40 text-red-100',
            success: 'bg-green-900/80 border-green-500/40 text-green-100',
        };

        return (
            <div
                ref={ref}
                className={cn(
                    'group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-4 pr-8 shadow-lg transition-all',
                    variantClasses[variant],
                    className
                )}
                {...props}
            >
                <div className="flex flex-col gap-1">
                    {title && <div className="text-sm font-medium">{title}</div>}
                    {description && <div className="text-sm opacity-90">{description}</div>}
                </div>
                {action && <div className="shrink-0">{action}</div>}
                {onClose && (
                    <button
                        onClick={onClose}
                        className="absolute right-2 top-2 rounded-md p-1 text-decode-white/50 opacity-0 transition-opacity hover:text-decode-white focus:opacity-100 focus:outline-none focus:ring-2 group-hover:opacity-100"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                )}
            </div>
        );
    }
);

Toast.displayName = 'Toast';

export { Toast }; 
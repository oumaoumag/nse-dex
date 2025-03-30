'use client';

import React from 'react';
import { cn } from '@/lib/utils';

type StatusType = 'success' | 'warning' | 'error' | 'info';

interface StatusIndicatorProps {
  type: StatusType;
  title: string;
  message: string;
  icon?: React.ReactNode;
  className?: string;
}

const icons = {
  success: (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  ),
  warning: (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  ),
  error: (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
  info: (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
};

const colors = {
  success: {
    border: 'border-decode-green/30',
    text: 'text-decode-green',
    bg: 'bg-decode-green/10',
  },
  warning: {
    border: 'border-yellow-500/30',
    text: 'text-yellow-500',
    bg: 'bg-yellow-500/10',
  },
  error: {
    border: 'border-red-500/30',
    text: 'text-red-500',
    bg: 'bg-red-500/10',
  },
  info: {
    border: 'border-decode-blue/30',
    text: 'text-decode-blue',
    bg: 'bg-decode-blue/10',
  },
};

export default function StatusIndicator({
  type,
  title,
  message,
  icon,
  className,
}: StatusIndicatorProps) {
  return (
    <div className={cn(
      'decode-card p-4 rounded-lg', 
      colors[type].border,
      colors[type].bg,
      className
    )}>
      <div className="flex items-center gap-3 mb-2">
        <div className={colors[type].text}>
          {icon || icons[type]}
        </div>
        <p className="font-bold text-decode-white">{title}</p>
      </div>
      <p className="text-sm text-gray-400 pl-9">{message}</p>
    </div>
  );
}

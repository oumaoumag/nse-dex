'use client';

import React, { ReactNode } from 'react';

interface HeroSectionProps {
  title: string;
  highlightedWord?: string;
  description: string;
  children?: ReactNode;
  centered?: boolean;
  maxWidth?: string;
}

/**
 * Consistent Hero Section component with Safaricom Decode styling
 */
export default function HeroSection({
  title,
  highlightedWord,
  description,
  children,
  centered = false,
  maxWidth = '4xl'
}: HeroSectionProps) {
  // Split the title to insert highlighted word
  let titleContent;
  if (highlightedWord && title.includes(highlightedWord)) {
    const parts = title.split(highlightedWord);
    titleContent = (
      <>
        {parts[0]}
        <span className="text-decode-green">{highlightedWord}</span>
        {parts[1]}
      </>
    );
  } else {
    titleContent = title;
  }

  return (
    <section className="relative bg-decode-black py-20 md:py-32 overflow-hidden">
      {/* Consistent decorative elements across all hero sections */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-decode-green opacity-5 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-decode-blue opacity-5 rounded-full blur-3xl"></div>
        <div className="absolute top-1/4 left-1/3 w-1 h-40 bg-decode-green/20"></div>
        <div className="absolute bottom-1/3 right-1/4 w-40 h-1 bg-decode-green/20"></div>
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className={`${centered ? 'mx-auto text-center' : ''} max-w-${maxWidth}`}>
          <div className={`${centered ? 'inline-block' : ''} mb-3`}>
            <div className={`h-1 w-16 bg-decode-green mb-6 ${centered ? 'mx-auto' : ''}`}></div>
            <h1 className="decode-heading text-4xl md:text-6xl text-decode-white mb-6">
              {titleContent}
            </h1>
          </div>
          <p className={`text-lg text-gray-400 max-w-2xl ${centered ? 'mx-auto' : ''} mb-10 leading-relaxed`}>
            {description}
          </p>
          
          {children}
        </div>
      </div>
    </section>
  );
}

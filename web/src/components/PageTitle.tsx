import React from 'react';

interface PageTitleProps {
  title: string;
  subtitle?: string;
}

export default function PageTitle({ title, subtitle }: PageTitleProps) {
  return (
    <div className="text-center mb-10">
      <h1 className="text-3xl md:text-4xl font-bold text-[var(--dark-green)] mb-3 animate-fadeIn">
        {title}
      </h1>
      {subtitle && (
        <p className="text-lg md:text-xl max-w-3xl mx-auto animate-slideUp">
          {subtitle}
        </p>
      )}
    </div>
  );
} 
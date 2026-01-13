import React from 'react';

interface SectionProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

export default function Section({ title, children, className = '' }: SectionProps) {
  return (
    <div className={`mb-8 ${className}`}>
      <h2 className="text-2xl font-bold mb-4 text-gray-800">{title}</h2>
      {children}
    </div>
  );
}

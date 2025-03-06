import React from 'react';
import AnimatedBackground from './AnimatedBackground';

interface PageLayoutProps {
  children: React.ReactNode;
}

export default function PageLayout({ children }: PageLayoutProps) {
  return (
    <div className="min-h-[calc(100vh-4rem)] relative overflow-hidden bg-gradient-to-br from-[#2D1B69] to-[#1a1047]">
      <AnimatedBackground />
      <div className="relative min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        {children}
      </div>
    </div>
  );
}
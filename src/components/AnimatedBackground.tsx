import React from 'react';

export default function AnimatedBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Main gradient circles */}
      <div className="absolute -top-1/2 -left-1/4 w-96 h-96 bg-[#FF9F2D]/10 rounded-full blur-3xl animate-float-slow"></div>
      <div className="absolute top-3/4 -right-1/4 w-96 h-96 bg-[#FF9F2D]/5 rounded-full blur-3xl animate-float-reverse"></div>
      
      {/* Additional floating elements */}
      <div className="absolute top-1/4 left-1/3 w-64 h-64 bg-white/5 rounded-full blur-2xl animate-float-medium"></div>
      <div className="absolute bottom-1/4 right-1/3 w-48 h-48 bg-[#FF9F2D]/5 rounded-full blur-2xl animate-float"></div>
      
      {/* Small particles */}
      <div className="absolute top-1/2 left-1/2 w-4 h-4 bg-white/10 rounded-full blur-sm animate-ping"></div>
      <div className="absolute top-3/4 left-1/4 w-3 h-3 bg-[#FF9F2D]/20 rounded-full blur-sm animate-ping-slow"></div>
      <div className="absolute top-1/4 right-1/4 w-2 h-2 bg-white/20 rounded-full blur-sm animate-ping-slower"></div>
      
      {/* Background pattern */}
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1634655377962-e6e7b446e7e9?auto=format&fit=crop&q=80&w=2000')] opacity-[0.02] bg-repeat animate-subtle-drift"></div>
    </div>
  );
}
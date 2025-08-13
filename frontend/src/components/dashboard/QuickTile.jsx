import React from 'react';
import { ChevronRight } from 'lucide-react';

export default function QuickTile({ title, imageUrl = 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?q=80&w=1200&auto=format&fit=crop', onClick }){
  return (
    <button
      onClick={onClick}
      className="group relative w-full rounded-[var(--radius-card)] overflow-hidden text-left focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--sidebar-ring)] shadow-sm"
    >
      {/* 16:9 aspect ratio wrapper */}
      <div className="relative pb-[56.25%]">
        <img src={imageUrl} alt="" className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.02]" />
        <div className="absolute inset-0 bg-black/40 transition-colors" />
        <div className="absolute inset-0 p-4 md:p-5 flex items-end">
          <div className="flex w-full items-center justify-between gap-3">
            <div className="text-white text-base md:text-lg font-semibold drop-shadow-sm">{title}</div>
            <ChevronRight aria-hidden className="shrink-0 text-white/90 size-5 md:size-6 translate-x-0 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>
      </div>
    </button>
  );
}



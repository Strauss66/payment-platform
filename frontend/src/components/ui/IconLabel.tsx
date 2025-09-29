import React from 'react';

export default function IconLabel({ icon, label }: { icon: React.ReactNode; label: string }){
  return (
    <span className="inline-flex items-center gap-2 text-slate-700">
      <span className="text-slate-500">{icon}</span>
      <span>{label}</span>
    </span>
  );
}



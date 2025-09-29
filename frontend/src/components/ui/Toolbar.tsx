import React from 'react';

export default function Toolbar({ left, right }: { left?: React.ReactNode; right?: React.ReactNode }){
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border bg-white p-3">
      <div className="flex items-center gap-2 flex-wrap">{left}</div>
      {right && <div className="flex items-center gap-2">{right}</div>}
    </div>
  );
}



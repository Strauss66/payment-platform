import React from 'react';

export default function Badge({ children, color = 'blue' }){
  const base = 'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium';
  const map = {
    blue: 'bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-200',
    gray: 'bg-gray-100 text-gray-700 ring-1 ring-inset ring-gray-200',
    green: 'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200',
    red: 'bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-200'
  };
  return <span className={`${base} ${map[color] || map.blue}`}>{children}</span>;
}



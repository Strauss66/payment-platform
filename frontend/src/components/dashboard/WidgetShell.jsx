import React from 'react';

export default function WidgetShell({ title, children, className = '' }){
  return (
    <div className={["rounded-2xl border border-gray-200 bg-white p-4", className].filter(Boolean).join(' ')}>
      {title && <div className="text-sm font-medium mb-2 text-gray-900">{title}</div>}
      <div>{children}</div>
    </div>
  );
}



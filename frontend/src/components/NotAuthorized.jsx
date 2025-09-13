import React from 'react';

export default function NotAuthorized({ title = 'Not authorized', description = 'You do not have access to view this content.' }) {
  return (
    <div role="alert" aria-live="polite" className="rounded-lg border border-amber-200 bg-amber-50 text-amber-900 p-4">
      <div className="font-semibold">{title}</div>
      <div className="text-sm mt-1">{description}</div>
    </div>
  );
}



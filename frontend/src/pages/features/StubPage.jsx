import React from 'react';

export default function StubPage({ title = 'Coming soon' }){
  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-2">{title}</h1>
      <p className="text-gray-600">This page is a placeholder. Wire up content as needed.</p>
    </div>
  );
}



import React from 'react';

export default function NoTenantBanner({ message = 'Select a school to continue.' }) {
  return (
    <div role="status" className="mb-4 p-3 bg-yellow-50 border border-yellow-200 text-yellow-800 rounded">
      {message}
    </div>
  );
}



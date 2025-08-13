import React from 'react';
import Badge from '../ui/Badge';

export default function RecommendationItem({ label, onClick }){
  return (
    <button onClick={onClick} className="px-3 py-1 rounded-full bg-white text-sm text-blue-700 border border-blue-200 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-600">
      {label}
    </button>
  );
}



import React from 'react';
import { Search, X } from 'lucide-react';

export default function SearchInput({ value, onChange, placeholder }: { value: string; onChange: (v: string)=>void; placeholder?: string }){
  return (
    <div className="relative w-full">
      <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
      <input
        value={value}
        onChange={(e)=>onChange(e.target.value)}
        placeholder={placeholder || 'Search'}
        className="w-full pl-9 pr-8 py-2 rounded-full border bg-white focus:ring-2 focus:ring-slate-200 outline-none"
      />
      {!!value && (
        <button type="button" aria-label="Clear" className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-slate-100" onClick={()=>onChange('')}>
          <X className="h-4 w-4 text-slate-500" />
        </button>
      )}
    </div>
  );
}



import React from 'react';
import { Bell, Search } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export default function Topbar(){
  const { user } = useAuth();
  return (
    <header className="sticky top-0 z-30 h-16 bg-white/80 backdrop-blur border-b border-gray-200">
      <div className="h-full max-w-[1400px] mx-auto px-6 flex items-center justify-between gap-4">
        <div className="relative w-full max-w-xl">
          <Search className="h-5 w-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input className="w-full pl-10 pr-4 py-2 rounded-full bg-gray-100 focus:bg-white outline-none ring-1 ring-transparent focus:ring-gray-300" placeholder="Search" aria-label="Search" />
        </div>
        <div className="flex items-center gap-3">
          <button className="p-2 rounded hover:bg-gray-100" aria-label="Notifications"><Bell className="h-5 w-5 text-gray-500" /></button>
          <img className="w-9 h-9 rounded-full border" alt="avatar" src={user?.photo_url || `https://api.dicebear.com/8.x/initials/svg?seed=${encodeURIComponent(user?.username || user?.email || 'User')}`} />
        </div>
      </div>
    </header>
  );
}



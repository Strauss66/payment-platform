import React, { useEffect, useRef, useState } from 'react';
import { Bell, Search } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export default function Topbar(){
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const buttonRef = useRef(null);

  useEffect(() => {
    function onDocClick(e){
      if (!menuOpen) return;
      const t = e.target;
      if (menuRef.current && menuRef.current.contains(t)) return;
      if (buttonRef.current && buttonRef.current.contains(t)) return;
      setMenuOpen(false);
    }
    function onKey(e){
      if (e.key === 'Escape') setMenuOpen(false);
    }
    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [menuOpen]);

  function goSettings(){
    setMenuOpen(false);
    window.location.href = '/app/settings/org';
  }

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/80 backdrop-blur border-b border-gray-200">
      <div className="h-full max-w-[1400px] mx-auto px-6 flex items-center justify-between gap-4">
        <div className="relative w-full max-w-xl">
          <Search className="h-5 w-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input className="w-full pl-10 pr-4 py-2 rounded-full bg-gray-100 focus:bg-white outline-none ring-1 ring-transparent focus:ring-gray-300" placeholder="Search" aria-label="Search" />
        </div>
        <div className="flex items-center gap-3 relative">
          <button className="p-2 rounded hover:bg-gray-100" aria-label="Notifications"><Bell className="h-5 w-5 text-gray-500" /></button>
          <button
            ref={buttonRef}
            type="button"
            className="w-9 h-9 rounded-full border overflow-hidden focus:outline-none focus:ring-2 focus:ring-gray-300"
            aria-haspopup="menu"
            aria-expanded={menuOpen ? 'true' : 'false'}
            onClick={() => setMenuOpen(v => !v)}
          >
            <img
              className="w-full h-full object-cover"
              alt="User menu"
              src={user?.photo_url || `https://api.dicebear.com/8.x/initials/svg?seed=${encodeURIComponent(user?.username || user?.email || 'User')}`}
            />
          </button>

          {menuOpen && (
            <div
              ref={menuRef}
              role="menu"
              aria-label="User menu"
              className="absolute right-0 top-12 w-56 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-40"
            >
              <div className="px-4 py-2 text-sm text-gray-600">
                {user?.username || user?.email || 'Account'}
              </div>
              <hr className="my-1" />
              <button
                role="menuitem"
                className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50"
                onClick={goSettings}
              >
                Settings
              </button>
              <button
                role="menuitem"
                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50"
                onClick={() => { setMenuOpen(false); logout(); }}
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}



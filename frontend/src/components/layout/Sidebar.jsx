import React from 'react';
import { Link } from 'react-router-dom';
import SidebarItem from './SidebarItem.jsx';
import { useAuth } from '../../contexts/AuthContext';
import { ROLE_CONFIG } from '../../config/roles.js';

export default function Sidebar(){
  const { user } = useAuth();
  const role = (user?.roles || [])[0] || 'admin';
  const items = ROLE_CONFIG[role]?.sidebar || [];
  return (
    <div className="w-[240px] h-full bg-white border-r border-gray-200 shadow-sm">
      <div className="h-16 px-4 flex items-center">
        <Link to="/" className="text-gray-900 font-semibold">School Platform</Link>
      </div>
      <nav className="px-3 pb-4 space-y-1">
        {items.map(({ path, label, icon: Icon }) => (
          <SidebarItem key={path} to={path} label={label} icon={Icon} />
        ))}
      </nav>
    </div>
  );
}



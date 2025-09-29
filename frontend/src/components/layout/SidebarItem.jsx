import React from 'react';
import { NavLink } from 'react-router-dom';

export default function SidebarItem({ to, label, icon: Icon }){
  return (
    <NavLink
      to={to}
      className={({ isActive }) => [
        'flex items-center gap-3 rounded-xl px-3 py-2 transition',
        isActive ? 'bg-gray-900 text-white hover:bg-gray-900' : 'hover:bg-gray-100 text-gray-700'
      ].join(' ')}
    >
      {Icon && <Icon className="h-4 w-4" />}
      <span className="text-sm font-medium">{label}</span>
    </NavLink>
  );
}



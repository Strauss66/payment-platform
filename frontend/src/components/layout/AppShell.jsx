import React from 'react';
import Sidebar from './Sidebar.jsx';
import Topbar from './Topbar.jsx';

export default function AppShell({ children }){
  return (
    <div className="min-h-screen grid grid-cols-[240px_1fr]">
      <aside className="sticky top-0 h-screen">
        <Sidebar />
      </aside>
      <div className="min-h-screen">
        <Topbar />
        <main className="max-w-[1400px] mx-auto px-6 py-6">
          {children}
        </main>
      </div>
    </div>
  );
}



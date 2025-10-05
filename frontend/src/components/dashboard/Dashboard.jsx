import React from 'react';
import { ROLE_CONFIG } from '../../config/roles.js';
import { WIDGETS } from './registry.js';
import { useAuth } from '../../contexts/AuthContext';

export default function Dashboard(){
  const { user } = useAuth();
  const role = (user?.roles || [])[0] || 'admin';
  const cfg = ROLE_CONFIG[role]?.dashboard;
  if (!cfg) return null;

  return (
    <section className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cfg.kpis.map((key) => {
          const Cmp = WIDGETS[key];
          if (!Cmp) return null;
          return <Cmp key={key} />;
        })}
      </div>

      {cfg.rows.map((row, idx) => (
        <div key={idx} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {row.map((key) => {
            const Cmp = WIDGETS[key];
            if (!Cmp) return null;
            return <Cmp key={key} />;
          })}
        </div>
      ))}
    </section>
  );
}



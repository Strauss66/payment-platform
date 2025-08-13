import React, { useEffect, useState } from 'react';
import WidgetShell from '../../../components/dashboard/WidgetShell';
import { mockApi } from '../../../lib/api.ts';

// type ServiceHealth = { name: string; status: 'up'|'degraded'|'down'; p99ms: number; lastDeploy: string }

export default function SystemHealthWidget(){
  const [services, setServices] = useState([]);
  useEffect(() => {
    (async () => {
      const { data } = await mockApi.getSystemHealth();
      setServices(data.services || []);
    })();
  }, []);

  return (
    <WidgetShell title="System Health" to="/app/admin/system-health">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {services.map(svc => (
          <div key={svc.name} className="border rounded p-3 bg-white">
            <div className="text-sm font-medium flex items-center justify-between">
              <span>{svc.name}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full ${statusClass(svc.status)}`}>{svc.status}</span>
            </div>
            <div className="text-xs text-gray-500 mt-1">p99: {svc.p99ms} ms</div>
            <div className="text-xs text-gray-500">Last deploy: {new Date(svc.lastDeploy).toLocaleString()}</div>
          </div>
        ))}
      </div>
    </WidgetShell>
  );
}

function statusClass(status){
  switch(status){
    case 'up': return 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200';
    case 'degraded': return 'bg-amber-50 text-amber-700 ring-1 ring-amber-200';
    case 'down':
    default: return 'bg-rose-50 text-rose-700 ring-1 ring-rose-200';
  }
}


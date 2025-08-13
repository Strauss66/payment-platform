import React, { useEffect, useState } from 'react';
import WidgetShell from '../../../components/dashboard/WidgetShell';
import { mockApi } from '../../../lib/api.ts';

// type Experiment = { id: string; name: string; variantA: string; variantB: string; upliftPct?: number; status: 'running'|'planned'|'completed' }

export default function ExperimentsWidget(){
  const [experiments, setExperiments] = useState([]);
  useEffect(() => {
    (async () => {
      const { data } = await mockApi.getExperiments();
      setExperiments(data.experiments || []);
    })();
  }, []);

  return (
    <WidgetShell title="Experiments" to="/app/admin/experiments">
      <ul className="divide-y">
        {experiments.map(exp => (
          <li key={exp.id} className="py-2">
            <div className="text-sm font-medium">{exp.name}</div>
            <div className="text-xs text-gray-500">A: {exp.variantA} • B: {exp.variantB}</div>
            <div className="text-xs mt-1">
              <span className={`px-2 py-0.5 rounded-full ${statusBadge(exp.status)}`}>{exp.status}</span>
              {typeof exp.upliftPct === 'number' && (
                <span className="ml-2 text-emerald-600">+{exp.upliftPct}% uplift</span>
              )}
            </div>
          </li>
        ))}
      </ul>
    </WidgetShell>
  );
}

function statusBadge(status){
  switch(status){
    case 'completed': return 'bg-gray-100 text-gray-700';
    case 'running': return 'bg-blue-100 text-blue-700';
    case 'planned':
    default:
      return 'bg-amber-100 text-amber-700';
  }
}


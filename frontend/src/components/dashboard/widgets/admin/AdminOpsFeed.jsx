import React, { useEffect, useState } from 'react';
import { api } from '../../../../lib/apiClient';
import { listAuditEvents } from '../../../../lib/api.billing';
import { useTenant } from '../../../../contexts/TenantContext';

export default function AdminOpsFeed(){
  const { currentSchoolId } = useTenant();
  const [state, setState] = useState('idle');
  const [events, setEvents] = useState([]);
  const [unsupported, setUnsupported] = useState(false);

  async function load(){
    if (!currentSchoolId || unsupported) return;
    setState('loading');
    try {
      const ev = await listAuditEvents({ limit: 20 });
      setEvents(Array.isArray(ev) ? ev : []);
      setState('idle');
    } catch (e) {
      const status = e?.response?.status;
      if (status === 404) {
        setUnsupported(true);
        setState('idle');
        return;
      }
      setState('error');
    }
  }

  useEffect(() => {
    let timer;
    load();
    if (!unsupported) {
      timer = setInterval(load, 60000);
    }
    return () => clearInterval(timer);
  }, [currentSchoolId, unsupported]);

  if (!currentSchoolId) return <MiniBanner/>;
  if (state === 'loading') return <Skeleton/>;
  if (state === 'error') return <InlineError retry={load}/>;
  if (unsupported) {
    return (
      <div className="p-3 rounded border bg-white">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">Recent activity</div>
          <button className="text-sm underline" onClick={load} disabled>Refresh</button>
        </div>
        <div className="text-gray-500 text-sm mt-2">Activity feed not available.</div>
      </div>
    );
  }
  if (events.length === 0) return (
    <div className="p-3 rounded border bg-white">
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600">Recent activity</div>
        <button className="text-sm underline" onClick={load}>Refresh</button>
      </div>
      <div className="text-gray-500 text-sm mt-2">No recent activity.</div>
    </div>
  );

  return (
    <div className="p-3 rounded border bg-white">
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600">Recent activity</div>
        <button className="text-sm underline" onClick={load}>Refresh</button>
      </div>
      <ol className="mt-2 space-y-2">
        {events.map((e) => (
          <li key={`${e.type}:${e.id}`} className="text-sm">
            <span className="text-gray-500">{new Date(e.at).toLocaleString()} — </span>
            <span className="text-gray-500">{e.type}</span>
            <span className="mx-1">•</span>
            <span>{e.message}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}

function Skeleton(){
  return (
    <div className="p-3 rounded border bg-white animate-pulse space-y-2">
      <div className="h-4 bg-gray-200 rounded w-1/3"/>
      <div className="h-4 bg-gray-200 rounded w-2/3"/>
      <div className="h-20 bg-gray-200 rounded"/>
    </div>
  );
}

function InlineError({ retry }){
  return (
    <div className="p-3 rounded border bg-white">
      <div className="text-red-700 text-sm">Failed to load activity.</div>
      <button className="mt-1 text-sm underline" onClick={retry}>Retry</button>
    </div>
  );
}

function MiniBanner(){
  return <div className="p-3 bg-yellow-50 border border-yellow-200 text-yellow-800 rounded">Select a school to continue.</div>;
}



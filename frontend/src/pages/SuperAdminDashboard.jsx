import React, { useEffect, useMemo, useState } from 'react';
import { CalendarDays, BarChart3, Building2, Users2, Search as SearchIcon } from 'lucide-react';
import { TenantFilterProvider, useTenantFilter } from '../contexts/TenantFilterContext.jsx';
import { api } from '../lib/apiClient.js';
import WidgetShell from '../components/dashboard/WidgetShell.jsx';

export default function SuperAdminDashboard(){
  return (
    <TenantFilterProvider>
      <div className="space-y-6">
        <ControlsRow />
        <KPIRow />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RevenueArChart />
          <ActivityFeed />
        </div>
        <TopSchoolsTable />
      </div>
    </TenantFilterProvider>
  );
}

function ControlsRow(){
  const { schoolIds, setSchoolIds, from, to, setFrom, setTo } = useTenantFilter();
  const [schools, setSchools] = useState([]);

  useEffect(() => {
    api.get('/api/tenancy/schools?is_active=true&limit=200').then(({ data }) => setSchools(data.rows || []));
  }, []);

  function onToggle(id){
    const set = new Set(schoolIds || []);
    if (set.has(id)) set.delete(id); else set.add(id);
    setSchoolIds(Array.from(set));
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <button className={btn(!schoolIds)} onClick={() => setSchoolIds(null)}>All Schools</button>
        {schools.slice(0, 12).map(s => (
          <button key={s.id} className={btn(schoolIds?.includes(s.id))} onClick={() => onToggle(s.id)}>{s.name}</button>
        ))}
      </div>
      <div className="flex items-center gap-2">
        <DateInput label="From" value={from} onChange={setFrom} />
        <DateInput label="To" value={to} onChange={setTo} />
        <Preset onPick={(days) => { const now = new Date(); const d = new Date(); d.setDate(now.getDate() - days); setFrom(d.toISOString()); setTo(now.toISOString()); }} />
        <GlobalSearch />
      </div>
    </div>
  );
}

function KPIRow(){
  const { schoolIds, from, to } = useTenantFilter();
  const [data, setData] = useState(null);
  useEffect(() => {
    const params = { schoolId: schoolIds ? schoolIds.join(',') : 'all', from, to };
    api.get('/api/metrics/overview', { params }).then(({ data }) => setData(data)).catch(() => setData({}));
  }, [schoolIds, from, to]);
  const items = useMemo(() => ([
    { label: 'Total Schools', value: data?.totalSchools ?? 0, icon: Building2 },
    { label: 'Active Users (30d)', value: data?.activeUsers30d ?? 0, icon: Users2 },
    { label: 'Outstanding Invoices', value: data?.outstandingInvoices ?? 0, icon: FileIcon },
    { label: 'Payments MTD', value: currency(data?.paymentsMtd ?? 0), icon: BarChart3 },
    { label: 'New Signups 7d', value: data?.newSignups7d ?? 0, icon: Users2 },
  ]), [data]);
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {items.map((k, i) => (
        <WidgetShell key={i}>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-gray-500">{k.label}</div>
              <div className="text-xl font-semibold">{k.value}</div>
            </div>
            <k.icon className="w-5 h-5 text-gray-400" />
          </div>
        </WidgetShell>
      ))}
    </div>
  );
}

function RevenueArChart(){
  const { schoolIds, from, to } = useTenantFilter();
  const [series, setSeries] = useState({ revenue: [], ar: [] });
  useEffect(() => {
    const params = { schoolId: schoolIds ? schoolIds.join(',') : 'all', granularity: 'week', from, to };
    api.get('/api/metrics/revenue', { params }).then(({ data }) => setSeries(data || { revenue: [], ar: [] })).catch(() => setSeries({ revenue: [], ar: [] }));
  }, [schoolIds, from, to]);
  return (
    <WidgetShell title="Revenue & AR">
      <div className="text-sm text-gray-500">Chart coming soon</div>
      <pre className="text-xs text-gray-400 overflow-auto">{JSON.stringify(series).slice(0, 400)}...</pre>
    </WidgetShell>
  );
}

function ActivityFeed(){
  const { schoolIds, from, to } = useTenantFilter();
  const [items, setItems] = useState([]);
  useEffect(() => {
    const params = { scope: 'critical', schoolId: schoolIds ? schoolIds.join(',') : 'all', from, to, limit: 20 };
    api.get('/api/activity', { params }).then(({ data }) => setItems(data?.events || [])).catch(() => setItems([]));
  }, [schoolIds, from, to]);
  return (
    <WidgetShell title="Recent critical events">
      <ul className="divide-y divide-gray-100">
        {items.length === 0 && <li className="p-3 text-sm text-gray-500">No recent events</li>}
        {items.map((e) => (
          <li key={e.id} className="p-3 text-sm">
            <div className="flex items-center justify-between">
              <div className="font-medium">{e.type}</div>
              <div className="text-xs text-gray-500">{new Date(e.at).toLocaleString()}</div>
            </div>
            <div className="text-gray-600">{e.detail || e.message || ''}</div>
          </li>
        ))}
      </ul>
    </WidgetShell>
  );
}

function TopSchoolsTable(){
  const { schoolIds, from, to } = useTenantFilter();
  const [rows, setRows] = useState([]);
  useEffect(() => {
    const params = { metric: 'revenue', schoolId: schoolIds ? schoolIds.join(',') : 'all', from, to, limit: 20 };
    api.get('/api/schools/top', { params }).then(({ data }) => setRows(data?.rows || [])).catch(() => setRows([]));
  }, [schoolIds, from, to]);
  return (
    <WidgetShell title="Top schools by revenue">
      <div className="overflow-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500">
              <th className="px-3 py-2">School</th>
              <th className="px-3 py-2">Revenue</th>
              <th className="px-3 py-2">AR Aging</th>
              <th className="px-3 py-2">Growth WoW</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr><td colSpan="4" className="px-3 py-6 text-center text-gray-500">No data</td></tr>
            )}
            {rows.map(r => (
              <tr key={r.id} className="border-t">
                <td className="px-3 py-2">{r.name}</td>
                <td className="px-3 py-2">{currency(r.revenue || 0)}</td>
                <td className="px-3 py-2">{r.ar_aging || '—'}</td>
                <td className="px-3 py-2">{typeof r.growth_wow === 'number' ? `${r.growth_wow.toFixed(1)}%` : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </WidgetShell>
  );
}

function GlobalSearch(){
  const [q, setQ] = useState('');
  const [results, setResults] = useState([]);
  useEffect(() => {
    const t = setTimeout(() => {
      if (!q) { setResults([]); return; }
      api.get('/api/search', { params: { q, scope: 'all', limit: 8 } }).then(({ data }) => setResults(data?.results || [])).catch(() => setResults([]));
    }, 300);
    return () => clearTimeout(t);
  }, [q]);
  return (
    <div className="relative ml-auto">
      <div className="flex items-center gap-2 border rounded-full px-3 py-1.5">
        <SearchIcon className="w-4 h-4 text-gray-400" />
        <input value={q} onChange={(e)=>setQ(e.target.value)} className="outline-none" placeholder="Global search" />
      </div>
      {results.length > 0 && (
        <div className="absolute mt-1 w-80 bg-white border rounded-lg shadow z-10">
          {results.map((r, i) => (
            <div key={i} className="px-3 py-2 text-sm hover:bg-gray-50">
              <span className="text-gray-500">[{r.type}]</span> {r.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function DateInput({ label, value, onChange }){
  function onPick(e){
    const d = new Date(e.target.value);
    if (!isNaN(d.getTime())) onChange(new Date(d.toISOString()).toISOString());
  }
  const v = new Date(value);
  const formatted = !isNaN(v.getTime()) ? v.toISOString().slice(0, 10) : '';
  return (
    <label className="text-sm text-gray-700 inline-flex items-center gap-2">
      <CalendarDays className="w-4 h-4 text-gray-400" />
      <span>{label}</span>
      <input type="date" value={formatted} onChange={onPick} className="border rounded px-2 py-1" />
    </label>
  );
}

function Preset({ onPick }){
  return (
    <div className="flex items-center gap-1 text-sm">
      <span className="text-gray-500">Preset:</span>
      {[7,30,90].map(d => (
        <button key={d} className="px-2 py-1 rounded-full border hover:bg-gray-50" onClick={()=>onPick(d)}>{d}d</button>
      ))}
      <button className="px-2 py-1 rounded-full border hover:bg-gray-50" onClick={()=>onPick(365)}>YTD</button>
    </div>
  );
}

function currency(n){
  try { return new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD' }).format(Number(n || 0)); } catch { return String(n || 0); }
}

function FileIcon(){
  return <svg className="w-5 h-5 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeWidth="2" d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path strokeWidth="2" d="M14 2v6h6"/></svg>;
}

function btn(active){
  return ["px-3 py-1.5 rounded-full border", active ? "bg-gray-900 text-white border-gray-900" : "bg-white hover:bg-gray-50"].join(' ');
}



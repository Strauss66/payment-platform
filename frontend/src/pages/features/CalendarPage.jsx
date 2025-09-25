import React from 'react';
import { calendarsApi, eventsApi } from '../../lib/api.calendar';

export default function CalendarPage(){
  const [view, setView] = React.useState('month'); // 'month' | 'week'
  const [cursorDate, setCursorDate] = React.useState(new Date());
  const [calendars, setCalendars] = React.useState([]);
  const [selectedCalendarId, setSelectedCalendarId] = React.useState(null);
  const [events, setEvents] = React.useState([]);

  React.useEffect(()=>{ (async()=>{ try { const list = await calendarsApi.list(); setCalendars(list); if (list[0]) setSelectedCalendarId(list[0].id); } catch {} })(); }, []);

  React.useEffect(()=>{ (async()=>{
    const { from, to } = viewRange(view, cursorDate);
    try { const list = await eventsApi.list({ from: from.toISOString(), to: to.toISOString(), calendarId: selectedCalendarId || undefined }); setEvents(list || []); } catch {}
  })(); }, [view, cursorDate, selectedCalendarId]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">
      <div>
        <Toolbar view={view} setView={setView} cursorDate={cursorDate} setCursorDate={setCursorDate} />
        <div className="mt-4 bg-white rounded-lg border p-2">
          {view === 'month' ? <MonthGrid date={cursorDate} events={events} /> : <WeekGrid date={cursorDate} events={events} />}
        </div>
      </div>
      <aside>
        <MiniMonth date={cursorDate} onPick={(d)=>setCursorDate(d)} />
        <div className="mt-6 bg-white rounded-lg border p-4">
          <div className="font-semibold mb-2">Calendars</div>
          <div className="space-y-2">
            {calendars.map(c => (
              <label key={c.id} className="flex items-center gap-2">
                <input type="radio" name="cal" checked={selectedCalendarId===c.id} onChange={()=>setSelectedCalendarId(c.id)} />
                <span className="inline-block w-3 h-3 rounded" style={{ backgroundColor: c.color || '#2563EB' }} />
                <span>{c.name}</span>
              </label>
            ))}
          </div>
          <button className="mt-3 px-3 py-1.5 text-sm rounded border">+ Add Calendar</button>
        </div>
      </aside>
    </div>
  );
}

function Toolbar({ view, setView, cursorDate, setCursorDate }){
  const go = (deltaDays) => setCursorDate(new Date(cursorDate.getTime() + deltaDays*86400000));
  const fmt = new Intl.DateTimeFormat(undefined, { month: 'long', year: 'numeric' });
  return (
    <div className="flex items-center justify-between">
      <div className="text-2xl font-extrabold">{fmt.format(cursorDate)}</div>
      <div className="flex items-center gap-2">
        <button className="px-3 py-1.5 rounded border" onClick={()=>setCursorDate(new Date())}>Today</button>
        <button className="px-3 py-1.5 rounded border" onClick={()=>go(-7)}>←</button>
        <button className="px-3 py-1.5 rounded border" onClick={()=>go(7)}>→</button>
        <button className={`px-3 py-1.5 rounded border ${view==='month'?'bg-gray-900 text-white':''}`} onClick={()=>setView('month')}>Month</button>
        <button className={`px-3 py-1.5 rounded border ${view==='week'?'bg-gray-900 text-white':''}`} onClick={()=>setView('week')}>Week</button>
      </div>
    </div>
  );
}

function MonthGrid({ date, events }){
  const start = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));
  const startWeekday = (start.getUTCDay()+7)%7;
  const first = new Date(start.getTime() - startWeekday*86400000);
  const cells = Array.from({ length: 42 }, (_, i) => new Date(first.getTime() + i*86400000));
  const groups = groupEventsByDay(events);
  const dayFmt = new Intl.DateTimeFormat(undefined, { day: 'numeric' });
  const timeFmt = new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' });
  const month = date.getUTCMonth();
  return (
    <div className="grid grid-cols-7 gap-[1px] bg-gray-200 rounded overflow-hidden">
      {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(h => (
        <div key={h} className="bg-white py-2 px-2 text-xs font-medium text-gray-600">{h}</div>
      ))}
      {cells.map((d, i) => {
        const key = d.toISOString().slice(0,10);
        const evs = groups[key] || [];
        const inMonth = d.getUTCMonth() === month;
        return (
          <div key={i} className="bg-white min-h-[96px] p-2 align-top">
            <div className={`text-xs mb-1 ${inMonth? 'text-gray-700':'text-gray-400'}`}>{dayFmt.format(d)}</div>
            <div className="space-y-1">
              {evs.slice(0,3).map(ev => (
                <div key={ev.id} className="text-xs truncate px-2 py-1 rounded bg-blue-50 text-blue-700 border border-blue-200" title={ev.title}>
                  {ev.startsAt ? `${timeFmt.format(new Date(ev.startsAt))} ` : ''}{ev.title}
                </div>
              ))}
              {evs.length>3 && <div className="text-[11px] text-gray-500">+{evs.length-3} more</div>}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function WeekGrid({ date, events }){
  const start = startOfWeek(date);
  const days = Array.from({ length: 7 }, (_, i) => new Date(start.getTime() + i*86400000));
  const groups = groupEventsByDay(events);
  const timeFmt = new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' });
  return (
    <div className="grid grid-cols-7 gap-2">
      {days.map((d, i) => {
        const key = d.toISOString().slice(0,10);
        const evs = groups[key] || [];
        return (
          <div key={i} className="bg-white border rounded p-2 min-h-[360px]">
            <div className="text-sm font-semibold mb-2">{d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</div>
            <div className="space-y-1">
              {evs.map(ev => (
                <div key={ev.id} className="text-xs truncate px-2 py-1 rounded bg-blue-50 text-blue-700 border border-blue-200" title={ev.title}>
                  {ev.startsAt ? `${timeFmt.format(new Date(ev.startsAt))} ` : ''}{ev.title}
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function MiniMonth({ date, onPick }){
  const start = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));
  const startWeekday = (start.getUTCDay()+7)%7;
  const first = new Date(start.getTime() - startWeekday*86400000);
  const cells = Array.from({ length: 42 }, (_, i) => new Date(first.getTime() + i*86400000));
  const month = date.getUTCMonth();
  const fmt = new Intl.DateTimeFormat(undefined, { day: 'numeric' });
  return (
    <div className="bg-white rounded-lg border p-3">
      <div className="text-center font-semibold mb-2">{date.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}</div>
      <div className="grid grid-cols-7 gap-1 text-center text-xs text-gray-600 mb-1">
        {['S','M','T','W','T','F','S'].map((s,i)=>(<div key={i}>{s}</div>))}
      </div>
      <div className="grid grid-cols-7 gap-1 text-center">
        {cells.map((d,i)=> (
          <button key={i} onClick={()=>onPick(d)} className={`py-1 rounded ${d.getUTCMonth()===month? 'hover:bg-gray-100':'text-gray-400'}`}>{fmt.format(d)}</button>
        ))}
      </div>
    </div>
  );
}

function viewRange(view, date){
  const d = new Date(date);
  if (view === 'week') {
    const s = startOfWeek(d);
    const e = new Date(s.getTime() + 7*86400000 - 1);
    return { from: s, to: e };
  }
  const s = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1));
  const e = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth()+1, 0, 23,59,59,999));
  return { from: s, to: e };
}

function startOfWeek(date){
  const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const wd = (d.getUTCDay()+7)%7; // 0=Sun
  return new Date(d.getTime() - wd*86400000);
}

function groupEventsByDay(list){
  const map = {};
  for (const ev of list || []){
    const dt = ev.startsAt ? new Date(ev.startsAt) : null;
    const key = dt ? dt.toISOString().slice(0,10) : 'unknown';
    (map[key] ||= []).push(ev);
  }
  return map;
}



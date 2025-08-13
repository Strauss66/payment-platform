import React, { useEffect, useState } from 'react';
import WidgetShell from '../../../components/dashboard/WidgetShell';
import { mockApi } from '../../../lib/api.ts';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '../../../components/ui/Sheet';

export default function AuditLogWidget(){
  const [events, setEvents] = useState([]);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    (async () => {
      const { data } = await mockApi.getAuditLog();
      setEvents(data.events || []);
    })();
  }, []);

  return (
    <WidgetShell title="Audit Log (recent)">
      <ul className="divide-y">
        {events.map(ev => (
          <li key={ev.id} className="py-2 flex items-center justify-between">
            <div>
              <div className="text-sm">{ev.actor} {ev.action} <span className="font-mono">{ev.target}</span></div>
              <div className="text-xs text-gray-500">{new Date(ev.at).toLocaleString()}</div>
            </div>
            <button onClick={() => { setSelected(ev); setOpen(true); }} className="px-2 py-1 text-xs rounded border">View</button>
          </li>
        ))}
      </ul>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="right">
          <SheetHeader>
            <SheetTitle>Audit Event</SheetTitle>
            <SheetDescription>Details for the selected action.</SheetDescription>
          </SheetHeader>
          {!!selected && (
            <div className="text-sm space-y-1">
              <div><span className="text-gray-500">Actor:</span> {selected.actor}</div>
              <div><span className="text-gray-500">Action:</span> {selected.action}</div>
              <div><span className="text-gray-500">Target:</span> {selected.target}</div>
              <div><span className="text-gray-500">At:</span> {new Date(selected.at).toLocaleString()}</div>
              <div className="pt-2 text-gray-600">Mocked payload preview goes here.</div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </WidgetShell>
  );
}


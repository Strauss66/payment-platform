import React from 'react';
import WidgetShell from '../../../components/dashboard/WidgetShell';
import EmptyState from '../../../components/ui/EmptyState';

export default function CampusEventsWidget(){
  return (
    <WidgetShell title="Campus Events" action={<a href="#/" className="text-sm text-[var(--primary)]">Browse Events</a>} to="/app/events">
      <EmptyState title="No upcoming events" actionLabel="Explore Events" onAction={()=>{}} />
    </WidgetShell>
  );
}



import React from 'react';
import WidgetShell from '../../../components/dashboard/WidgetShell';
import EmptyState from '../../../components/ui/EmptyState';

export default function AcademicDeadlinesWidget(){
  return (
    <WidgetShell title="Academic Deadlines" action={<a href="#/" className="text-sm text-[var(--primary)]">Calendar</a>} to="/app/calendar">
      <EmptyState title="No upcoming deadlines" />
    </WidgetShell>
  );
}



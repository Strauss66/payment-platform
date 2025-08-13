import React from 'react';

import WidgetShell from '../../../components/dashboard/WidgetShell';
import EmptyState from '../../../components/ui/EmptyState';

export default function GradeReportWidget(){
  return (
    <WidgetShell title="Grade Report" action={<a href="#/" className="text-sm text-[var(--primary)]">See all</a>} to="/app/grades">
      <EmptyState title="No grades available yet" actionLabel="View Grades" onAction={()=>{}} />
    </WidgetShell>
  );
}



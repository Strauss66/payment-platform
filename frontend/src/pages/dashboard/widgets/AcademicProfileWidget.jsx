import React from 'react';
import WidgetShell from '../../../components/dashboard/WidgetShell';

export default function AcademicProfileWidget(){
  return (
    <WidgetShell title="Academic Profile" action={<a href="#/" className="text-sm text-[var(--primary)]">View Profile</a>} to="/app/profile">
      <div className="text-sm text-[var(--text)] space-y-1">
        <div><span className="text-[var(--text-muted)]">Major:</span> Undeclared</div>
        <div><span className="text-[var(--text-muted)]">Advisor:</span> Not assigned</div>
      </div>
    </WidgetShell>
  );
}



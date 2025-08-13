import React from 'react';
import WidgetShell from '../../../components/dashboard/WidgetShell';
import EmptyState from '../../../components/ui/EmptyState';

export default function EmailFilesWidget(){
  return (
    <WidgetShell title="Email & Files" action={<a href="#/" className="text-sm text-[var(--primary)]">Open</a>} to="/app/files">
      <EmptyState title="No emails or files to show" actionLabel="Go to Email" onAction={()=>{}} />
    </WidgetShell>
  );
}



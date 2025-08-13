import React from 'react';
import WidgetShell from '../../../components/dashboard/WidgetShell';
import EmptyState from '../../../components/ui/EmptyState';

export default function HoldsWidget(){
  return (
    <WidgetShell title="Holds" action={<a href="#/" className="text-sm text-[var(--primary)]">Manage</a>} to="/app/holds">
      <EmptyState title="No holds on your account" />
    </WidgetShell>
  );
}



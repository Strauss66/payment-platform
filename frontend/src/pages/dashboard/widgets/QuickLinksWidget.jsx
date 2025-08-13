import React from 'react';
import WidgetShell from '../../../components/dashboard/WidgetShell';

export default function QuickLinksWidget(){
  return (
    <WidgetShell title="Quick Links">
      <ul className="text-sm text-blue-700 space-y-1">
        <li><a href="#" className="hover:underline">View Invoices</a></li>
        <li><a href="#" className="hover:underline">Make a Payment</a></li>
        <li><a href="#" className="hover:underline">View Courses</a></li>
      </ul>
    </WidgetShell>
  );
}



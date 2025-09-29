import React from 'react';
import { Link } from 'react-router-dom';
import SidebarItem from './SidebarItem.jsx';
import { LayoutDashboard, CreditCard, FileText, Users, BarChart3, Settings, Megaphone, CalendarDays, Activity, CheckSquare } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export default function Sidebar(){
  const { user } = useAuth();
  const roles = user?.roles || [];
  const canSeePayments = roles.includes('cashier') || roles.includes('admin') || roles.includes('super_admin');
  return (
    <div className="w-[240px] h-full bg-white border-r border-gray-200 shadow-sm">
      <div className="h-16 px-4 flex items-center">
        <Link to="/" className="text-gray-900 font-semibold">School Platform</Link>
      </div>
      <nav className="px-3 pb-4 space-y-1">
        <SidebarItem to="/app/dashboard" label="Dashboard" icon={LayoutDashboard} />
        {canSeePayments && <SidebarItem to="/app/billing/payments" label="Payments" icon={CreditCard} />}
        <SidebarItem to="/app/billing/invoices" label="Invoices" icon={FileText} />
        <SidebarItem to="/app/people/students" label="Students" icon={Users} />
        <SidebarItem to="/app/billing/reports" label="Reports" icon={BarChart3} />
        <SidebarItem to="/app/settings/org" label="Settings" icon={Settings} />
        <SidebarItem to="/app/announcements" label="Announcements" icon={Megaphone} />
        <SidebarItem to="/app/events" label="Events & Calendars" icon={CalendarDays} />
        <SidebarItem to="/app/activity" label="Activity" icon={Activity} />
        <SidebarItem to="/app/tasks" label="Tasks" icon={CheckSquare} />
      </nav>
    </div>
  );
}



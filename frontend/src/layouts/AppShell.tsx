import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Bell, CreditCard, FileText, GraduationCap, LayoutDashboard, LineChart, Settings, School } from 'lucide-react';

type AppShellProps = {
  title?: string;
  subtitle?: string;
  rightSlot?: React.ReactNode;
  children: React.ReactNode;
};

const navItems = [
  { to: '/cashier/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/app/billing/payments', label: 'Payments', icon: CreditCard },
  { to: '/app/billing/invoices', label: 'Invoices', icon: FileText },
  { to: '/app/people/students', label: 'Students', icon: GraduationCap },
  { to: '/app/billing/reports', label: 'Reports', icon: LineChart },
  { to: '/app/settings/org', label: 'Settings', icon: Settings },
];

export default function AppShell({ title = 'Dashboard', subtitle, rightSlot, children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-slate-50">
      <aside className="fixed inset-y-0 left-0 w-64 bg-white border-r border-slate-100 hidden md:flex flex-col">
        <Link to="/" className="flex items-center gap-2 px-6 h-16">
          <div className="h-8 w-8 rounded-xl bg-slate-900 text-white grid place-items-center">
            <School className="h-5 w-5" />
          </div>
          <span className="text-slate-900 font-semibold">EduPay</span>
        </Link>
        <nav className="mt-4 px-2 space-y-1">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                [
                  'group flex items-center gap-3 px-4 py-2 rounded-xl text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 relative',
                  isActive ? 'bg-slate-50 text-slate-900' : '',
                ].join(' ')
              }
            >
              {({ isActive }) => (
                <>
                  <span className="absolute inset-y-0 left-0 w-1 rounded-r-xl bg-slate-900/80" style={{ opacity: isActive ? 1 : 0 }} />
                  <Icon className="h-4 w-4" />
                  {label}
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="md:pl-64">
        <header className="sticky top-0 z-10 bg-slate-50/80 backdrop-blur supports-[backdrop-filter]:bg-slate-50/70">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="min-w-0">
                <h1 className="text-xl sm:text-2xl font-semibold text-slate-900 truncate">{title}</h1>
                {subtitle ? (
                  <p className="text-sm text-slate-600">{subtitle}</p>
                ) : (
                  <p className="text-sm text-slate-600">Welcome back, Sarah! Here's a snapshot of your school's financial activity.</p>
                )}
              </div>
              <div className="flex items-center gap-3">
                {rightSlot}
                <button aria-label="Notifications" className="h-10 w-10 grid place-items-center rounded-full hover:bg-white hover:shadow-sm active:scale-[.99] transition">
                  <Bell className="h-5 w-5 text-slate-700" />
                </button>
                <div className="h-9 w-9 rounded-full bg-[url('https://i.pravatar.cc/40?img=12')] bg-cover bg-center ring-2 ring-white shadow-sm" aria-label="User avatar" />
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">{children}</main>
      </div>
    </div>
  );
}



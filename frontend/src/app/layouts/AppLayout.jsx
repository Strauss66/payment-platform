// src/app/layouts/AppLayout.jsx
import { Outlet, NavLink, Link } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { Bell, MessageSquare, Menu, Search, ChevronDown, Edit3, LogOut, User2, Settings as SettingsIcon, HelpCircle, IdCard, Users } from "lucide-react";
import { useAuth } from '../../contexts/AuthContext';
import { useTenant } from '../../contexts/TenantContext';
import NoTenantBanner from '../../components/NoTenantBanner.jsx';
import clsx from "clsx";
import TopbarSchoolSwitcher from '../../components/TopbarSchoolSwitcher.jsx';
import { ToastProvider } from '../../components/ui/Toast.jsx';

export default function AppLayout() {
  const [collapsed, setCollapsed] = useState(() => {
    try { return localStorage.getItem('ui.sidebar.collapsed') === '1'; } catch { return false; }
  });
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const { user, logout } = useAuth();
  const { currentSchoolId, needsSelection, brandingNotConfigured } = useTenant();
  const [forbidden, setForbidden] = useState(false);

  useEffect(() => {
    function onDocClick(e){
      if (!menuOpen) return;
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    }
    function onEsc(e){ if (e.key === 'Escape') setMenuOpen(false); }
    document.addEventListener('mousedown', onDocClick);
    window.addEventListener('keydown', onEsc);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      window.removeEventListener('keydown', onEsc);
    };
  }, [menuOpen]);

  useEffect(() => {
    function onForbidden(){
      setForbidden(true);
      window.setTimeout(() => setForbidden(false), 4000);
    }
    window.addEventListener('api:forbidden', onForbidden);
    return () => window.removeEventListener('api:forbidden', onForbidden);
  }, []);

  return (
    <div className="min-h-screen grid" style={{ gridTemplateColumns: collapsed ? "72px 1fr" : "280px 1fr" }}>
      {/* Sidebar */}
      <aside className="bg-white text-black">
        <div className="h-16 flex items-center gap-2 px-4">
          <button
            aria-label="Toggle navigation"
            onClick={() => {
              const next = !collapsed;
              setCollapsed(next);
              try { localStorage.setItem('ui.sidebar.collapsed', next ? '1' : '0'); } catch {}
            }}
            className="p-2 rounded hover:bg-gray-100"
          >
            <Menu className="size-5" />
          </button>
          {!collapsed && (
            <Link to="/app/dashboard" className="text-2xl font-extrabold tracking-wide focus:outline-none focus:ring-2 focus:ring-blue-200 rounded px-1">
              my <span className="opacity-90">SCHOOL</span>
            </Link>
          )}
        </div>

        {/* NAV CONTENT */}
        <nav className="px-3 pb-6 space-y-6 overflow-y-auto h-[calc(100vh-4rem)]">
          {/* Primary Navigation */}
          <Section title="Navigation" collapsed={collapsed}>
            <SidebarItem to="/app/dashboard" label="Dashboard" collapsed={collapsed} />
            <SidebarItem to="/app/activity" label="Activity" collapsed={collapsed} />
            <SidebarItem to="/app/tasks" label="Tasks" collapsed={collapsed} />
            <SidebarItem to="/app/announcements" label="Announcements" collapsed={collapsed} />
            <SidebarItem to="/app/events" label="Events & Calendars" collapsed={collapsed} />
          </Section>

          {/* Shortcuts */}
          <Section title="Shortcuts" collapsed={collapsed} action={!collapsed && <a className="text-xs underline inline-flex items-center gap-1" href="#/" aria-label="Edit shortcuts"><Edit3 className="size-3" />Edit</a>}>
            <SidebarItem to="/canvas" label="Canvas (I-Learn)" collapsed={collapsed} />
            <SidebarItem to="/email" label="Email" collapsed={collapsed} />
          </Section>

          <CollapsibleSection title="Billing" collapsed={collapsed}>
            <SidebarItem to="/app/admin/dashboard" label="Billing Dashboard (Admin)" collapsed={collapsed} />
            <SidebarItem to="/app/billing/invoices" label="Invoices" collapsed={collapsed} />
            <SidebarItem to="/app/billing/payments" label="Payments" collapsed={collapsed} />
            <SidebarItem to="/app/billing/cash-registers" label="Cash Registers" collapsed={collapsed} />
            <SidebarItem to="/app/billing/invoicing-entities" label="Invoicing Entities" collapsed={collapsed} />
            <SidebarItem to="/app/billing/reports" label="Reports" collapsed={collapsed} />
          </CollapsibleSection>

          <CollapsibleSection title="People" collapsed={collapsed}>
            <SidebarItem to="/app/people/families" label="Families" collapsed={collapsed} />
            <SidebarItem to="/app/people/students" label="Students" collapsed={collapsed} />
            <SidebarItem to="/app/people/teachers" label="Teachers" collapsed={collapsed} />
            <SidebarItem to="/app/people/employees" label="Employees" collapsed={collapsed} />
            <SidebarItem to="/app/people/roles" label="Users & Roles" collapsed={collapsed} />
          </CollapsibleSection>

          <CollapsibleSection title="Settings" collapsed={collapsed}>
            <SidebarItem to="/app/settings/org" label="Org Preferences" collapsed={collapsed} />
            <SidebarItem to="/app/settings/global" label="Global Preferences" collapsed={collapsed} />
            <SidebarItem to="/app/settings/flags" label="Audience Flags" collapsed={collapsed} />
            <SidebarItem to="/app/settings/emitter-cfdi" label="Emitter (CFDI)" collapsed={collapsed} />
          </CollapsibleSection>

          {/* Tools */}
          <CollapsibleSection title="Tools" collapsed={collapsed}>
            <SidebarItem to="/app/tools/resources" label="Resources" collapsed={collapsed} />
            <SidebarItem to="/app/tools/academic" label="Academic" collapsed={collapsed} />
            <SidebarItem to="/app/tools/student-services" label="Student Services" collapsed={collapsed} />
            <SidebarItem to="/app/tools/employee-tools" label="Employee Tools" collapsed={collapsed} />
          </CollapsibleSection>
        </nav>
      </aside>

      {/* Main */}
      <div className="min-h-screen">
        {/* Topbar */}
        <header className="h-16 sticky top-0 z-40 bg-gradient-to-b from-white/85 to-white/65 backdrop-blur border-b border-[var(--surface-muted)]">
          <div className="h-full px-6 flex items-center justify-between gap-4">
            {/* Search */}
            <div className="relative w-full max-w-xl">
              <Search className="size-5 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
              <input
                aria-label="Search"
                placeholder="Search"
                className="w-full pl-10 pr-4 py-2 rounded-full bg-[var(--surface-muted)] outline-none focus:ring-2 focus:ring-[var(--sidebar-ring)]"
              />
            </div>
            {/* Switcher + Icons */}
            <div className="flex items-center gap-3">
              {/* Hide switcher for non-superadmin */}
              {(user?.roles || []).includes('super_admin') && (
                <TopbarSchoolSwitcher />
              )}
              <button aria-label="Notifications" className="relative p-2 rounded hover:bg-[var(--surface-muted)]">
                <Bell className="size-5 text-[var(--text-muted)]" />
                <span className="absolute -top-0.5 -right-0.5 inline-flex items-center justify-center text-[10px] bg-[var(--warning)] text-white rounded-full w-4 h-4">1</span>
              </button>
              <button aria-label="Messages" className="p-2 rounded hover:bg-[var(--surface-muted)]">
                <MessageSquare className="size-5 text-[var(--text-muted)]" />
              </button>
              <div className="relative" ref={menuRef}>
                <button aria-label="User menu" onClick={() => setMenuOpen((v) => !v)} className="w-9 h-9 rounded-full bg-[var(--surface-muted)] overflow-hidden border">
                  {/* Placeholder avatar circle; replace with user.photo_url when available */}
                  <img src={user?.photo_url || `https://api.dicebear.com/8.x/initials/svg?seed=${encodeURIComponent(user?.username || user?.email || 'User')}`} alt="avatar" className="w-full h-full object-cover" />
                </button>
                {menuOpen && (
                  <div className="absolute right-0 mt-2 w-72 rounded-xl shadow-xl bg-gray-900 text-white ring-1 ring-black/5 overflow-hidden">
                    <div className="px-4 py-3">
                      <div className="text-base font-semibold">{user?.username || user?.email || 'User'}</div>
                    </div>
                    <div className="py-1 divide-y divide-white/10">
                      <div className="py-1">
                        <MenuItem icon={<User2 className="size-4" />} label="View Profile" />
                        <MenuItem icon={<Users className="size-4" />} label="My Connections" />
                        <MenuItem icon={<IdCard className="size-4" />} label="ID Card" />
                      </div>
                      <div className="py-1">
                        <MenuItem icon={<SettingsIcon className="size-4" />} label="Account Settings" />
                        <MenuItem icon={<HelpCircle className="size-4" />} label="FAQs" />
                        <MenuItem icon={<HelpCircle className="size-4" />} label="Terms and Privacy" />
                      </div>
                      <div className="py-1">
                        <button onClick={logout} className="w-full text-left px-4 py-2.5 flex items-center gap-2 hover:bg-white/10">
                          <LogOut className="size-4" />
                          <span>Logout</span>
                        </button>
                      </div>
                      <div className="px-3 py-3 flex items-center justify-between">
                        <span className="text-sm text-white/70">Light</span>
                        <div className="flex gap-2">
                          <button className="px-3 py-1.5 text-sm rounded-lg bg-white/10">Light</button>
                          <button className="px-3 py-1.5 text-sm rounded-lg bg-white text-gray-900">Dark</button>
                          <button className="px-3 py-1.5 text-sm rounded-lg bg-white/10">Auto</button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        <ToastProvider>
          <main className="px-6 py-6">
            {(!currentSchoolId || needsSelection || brandingNotConfigured) && (
              <NoTenantBanner />
            )}
            {forbidden && (
              <div role="alert" className="mb-4 p-3 bg-red-50 border border-red-200 text-red-800 rounded">
                You are not authorized to perform this action.
              </div>
            )}
            <Outlet />
          </main>
        </ToastProvider>

        {/* Floating help bubble (bottom-right) */}
        <button
          aria-label="Help"
          className="fixed right-5 bottom-5 w-12 h-12 rounded-full shadow-lg bg-[var(--primary-600)] text-white grid place-items-center"
        >?</button>
      </div>
    </div>
  );
}

function Section({ title, children, collapsed, action }) {
  return (
    <div>
      {!collapsed && (
        <div className="px-2 mb-2 flex items-center justify-between text-xs uppercase tracking-wide text-gray-500">
          <span>{title}</span>
          {action}
        </div>
      )}
      <div className="space-y-1">{children}</div>
    </div>
  );
}

function SidebarItem({ to, label, collapsed }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        clsx(
          "block px-3 py-2 rounded-md text-sm hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-200 text-black",
          isActive && "bg-gray-100 font-medium"
        )
      }
      title={collapsed ? label : undefined}
    >
      {collapsed ? <span className="sr-only">{label}</span> : label}
    </NavLink>
  );
}

function SidebarGroup({ label }) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between px-3 py-2 rounded-md hover:bg-gray-100">
        <span className="text-sm">{label}</span>
        <ChevronDown className={clsx("size-4 transition-transform", open && "rotate-180")} />
      </button>
      {open && <div className="pl-4 pt-1 pb-2 space-y-1 text-gray-700">
        <a href="#/" className="block px-2 py-1 rounded hover:bg-gray-100">Item A</a>
        <a href="#/" className="block px-2 py-1 rounded hover:bg-gray-100">Item B</a>
      </div>}
    </div>
  );
}

function CollapsibleSection({ title, children, collapsed }){
  const [open, setOpen] = useState(false);
  return (
    <div>
      {!collapsed && (
        <button onClick={()=>setOpen(!open)} className="w-full flex items-center justify-between px-2 mb-2 text-xs uppercase tracking-wide text-gray-500">
          <span>{title}</span>
          <ChevronDown className={clsx("size-4 transition-transform", open && "rotate-180")} />
        </button>
      )}
      <div className={clsx("space-y-1", !open && !collapsed && "hidden")}>{children}</div>
    </div>
  );
}

function MenuItem({ icon, label, onClick }){
  return (
    <button onClick={onClick} className="w-full text-left px-4 py-2.5 flex items-center gap-2 hover:bg-white/10">
      {icon}
      <span>{label}</span>
    </button>
  );
}
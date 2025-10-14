import React from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import PublicLayout from './layouts/PublicLayout';
import ProtectedRoute from './guards/ProtectedRoute';
import RoleGate from './guards/RoleGate';

// Pages that actually exist
import LandingPage from '../pages/LandingPage';
import SignInPage from '../pages/Auth/SignInPage';
import SignUpPage from '../pages/Auth/SignUpPage';
import TestConnection from '../pages/TestConnection';
import { useDashboard } from '../state/dashboard/DashboardContext';
import AppShell from '../components/layout/AppShell';
import Dashboard from '../components/dashboard/Dashboard';
import SuperAdminDashboard from '../pages/SuperAdminDashboard.jsx';
import CloseoutPage from '../pages/Cashier/CloseoutPage.jsx';
// no hooks inside DashboardRoute to avoid hook-order issues on initial mounts
import CoursesDashboard from '../pages/StudentParent/CoursesDashboard';
import StubPage from '../pages/features/StubPage';
import CalendarPage from '../pages/features/CalendarPage.jsx';
import AnnouncementsPage from '../pages/features/AnnouncementsPage.jsx';
import InvoicingEntitiesPage from '../pages/Admin/billing/InvoicingEntitiesPage';
import CashRegistersPage from '../pages/Admin/billing/CashRegistersPage';
import CashierPanel from '../pages/Cashier/CashierPanel.jsx';
import FamiliesPage from '../pages/people/FamiliesPage.jsx';
import StudentsPage from '../pages/people/StudentsPage.jsx';
import TeachersPage from '../pages/people/TeachersPage.jsx';
import EmployeesPage from '../pages/people/EmployeesPage.jsx';
import UsersRolesPage from '../pages/people/UsersRolesPage.jsx';
import OrgPreferencesPage from '../pages/settings/OrgPreferencesPage.jsx';
import EmitterCFDIPage from '../pages/settings/EmitterCFDIPage.jsx';
import GlobalPreferencesPage from '../pages/settings/GlobalPreferencesPage.jsx';
import AudienceFlagsPage from '../pages/settings/AudienceFlagsPage.jsx';
import InvoicesPage from '../pages/billing/InvoicesPage.jsx'
import PaymentsPage from '../pages/billing/PaymentsPage.jsx'
import PaymentsListPage from '../pages/payments/PaymentsListPage.jsx'
import PaymentDetailPage from '../pages/payments/PaymentDetailPage.jsx'
import ReportsPage from '../pages/billing/ReportsPage.jsx'

export default function AppRouter() {
  return (
    <Routes>
      {/* SuperAdmin route */}
      <Route path="/superadmin" element={
        <ProtectedRoute>
          <RoleGate allow={["super_admin"]}>
            <AppShellLayout />
          </RoleGate>
        </ProtectedRoute>
      }>
        <Route index element={<SuperAdminDashboard />} />
      </Route>
      {/* unified dashboard under /app */}
      {/* Test route for API connectivity */}
      <Route path="/test" element={<TestConnection />} />

      {/* Public routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/auth/login" element={<SignInPage />} />
      <Route path="/auth/register" element={<SignUpPage />} />

      {/* App routes - unified shell */}
      <Route path="app" element={<AppShellLayout />}>
        <Route index element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
        <Route path="dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
        <Route path="activity" element={<StubPage title="Activity" />} />
        <Route path="announcements" element={<AnnouncementsPage />} />
        <Route path="courses" element={<CoursesDashboard />} />
        <Route path="schedule" element={<StubPage title="Class Schedule" />} />
        <Route path="tasks" element={<StubPage title="Tasks" />} />
        <Route path="grades" element={<StubPage title="Grade Report" />} />
        <Route path="calendar" element={<CalendarPage />} />
        <Route path="files" element={<StubPage title="Email & Files" />} />
        <Route path="holds" element={<StubPage title="Holds" />} />
        <Route path="activity" element={<StubPage title="Activity Feed" />} />
        <Route path="alerts" element={<StubPage title="Alerts" />} />
        {/* Billing */}
        <Route path="billing">
          <Route path="invoices" element={
            <ProtectedRoute>
              <RoleGate allow={["admin","super_admin"]}>
                <InvoicesPage />
              </RoleGate>
            </ProtectedRoute>
          } />
          <Route path="payments" element={
            <ProtectedRoute>
              <RoleGate allow={["cashier","admin","super_admin"]}>
                <PaymentsListPage />
              </RoleGate>
            </ProtectedRoute>
          } />
          <Route path="payments/:invoiceId" element={
            <ProtectedRoute>
              <RoleGate allow={["cashier","admin","super_admin"]}>
                <PaymentDetailPage />
              </RoleGate>
            </ProtectedRoute>
          } />
          <Route path="cash-registers" element={
            <ProtectedRoute>
              <RoleGate allow={["admin","super_admin"]}>
                <CashRegistersPage />
              </RoleGate>
            </ProtectedRoute>
          } />
          <Route path="invoicing-entities" element={
            <ProtectedRoute>
              <RoleGate allow={["admin","super_admin"]}>
                <InvoicingEntitiesPage />
              </RoleGate>
            </ProtectedRoute>
          } />
          <Route path="reports" element={
            <ProtectedRoute>
              <RoleGate allow={["admin","super_admin"]}>
                <ReportsPage />
              </RoleGate>
            </ProtectedRoute>
          } />
        </Route>
        {/* Tools */}
        <Route path="tools">
          <Route path="resources" element={<StubPage title="Resources" />} />
          <Route path="academic" element={<StubPage title="Academic" />} />
          <Route path="student-services" element={<StubPage title="Student Services" />} />
          <Route path="employee-tools" element={<StubPage title="Employee Tools" />} />
        </Route>
        <Route path="events" element={<CalendarPage />} />
        
        <Route path="cashier/closeout" element={
          <ProtectedRoute>
            <RoleGate allow={["cashier","admin","super_admin"]}>
              <CloseoutPage />
            </RoleGate>
          </ProtectedRoute>
        } />
        {/* People */}
        <Route path="people">
          <Route path="families" element={
            <ProtectedRoute>
              <RoleGate allow={["admin","super_admin"]}>
                <FamiliesPage />
              </RoleGate>
            </ProtectedRoute>
          } />
          <Route path="students" element={
            <ProtectedRoute>
              <RoleGate allow={["admin","super_admin"]}>
                <StudentsPage />
              </RoleGate>
            </ProtectedRoute>
          } />
          <Route path="teachers" element={
            <ProtectedRoute>
              <RoleGate allow={["admin","super_admin"]}>
                <TeachersPage />
              </RoleGate>
            </ProtectedRoute>
          } />
          <Route path="employees" element={
            <ProtectedRoute>
              <RoleGate allow={["admin","super_admin"]}>
                <EmployeesPage />
              </RoleGate>
            </ProtectedRoute>
          } />
          <Route path="roles" element={
            <ProtectedRoute>
              <RoleGate allow={["admin","super_admin"]}>
                <UsersRolesPage />
              </RoleGate>
            </ProtectedRoute>
          } />
        </Route>

        {/* Settings */}
        <Route path="settings">
          <Route path="org" element={
            <ProtectedRoute>
              <RoleGate allow={["admin","super_admin"]}>
                <OrgPreferencesPage />
              </RoleGate>
            </ProtectedRoute>
          } />
          <Route path="global" element={
            <ProtectedRoute>
              <RoleGate allow={["admin","super_admin"]}>
                <GlobalPreferencesPage />
              </RoleGate>
            </ProtectedRoute>
          } />
          <Route path="emitter-cfdi" element={
            <ProtectedRoute>
              <RoleGate allow={["admin","super_admin"]}>
                <EmitterCFDIPage />
              </RoleGate>
            </ProtectedRoute>
          } />
          <Route path="flags" element={
            <ProtectedRoute>
              <RoleGate allow={["admin","super_admin"]}>
                <AudienceFlagsPage />
              </RoleGate>
            </ProtectedRoute>
          } />
        </Route>
        <Route path="cashier/panel" element={<CashierPanel />} />
        <Route path="admin/reports" element={<StubPage title="Admin Reports" />} />
        <Route path="admin/collections" element={<StubPage title="Collections" />} />
        <Route path="admin/approvals" element={<StubPage title="Approvals" />} />
        <Route path="admin/experiments" element={<StubPage title="Experiments" />} />
        <Route path="admin/system-health" element={<StubPage title="System Health" />} />
      </Route>

      {/* Catch all - redirect to home */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

function AppShellLayout(){
  return (
    <AppShell>
      <Outlet />
    </AppShell>
  );
}
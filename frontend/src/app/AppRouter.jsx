import React from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
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
import FeatureStub from '../components/ui/FeatureStub.jsx';
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
import ParentInvoicesPage from '../pages/portal/ParentInvoicesPage.jsx';
import ParentPaymentsPage from '../pages/portal/ParentPaymentsPage.jsx';

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
      <Route path="app" element={
          <ProtectedRoute>
          <AppShellLayout />
          </ProtectedRoute>
      }>
        <Route index element={<Dashboard />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="activity" element={<FeatureStub title="Activity" description="Activity feed is not available yet." />} />
        <Route path="announcements" element={<AnnouncementsPage />} />
        <Route path="courses" element={<CoursesDashboard />} />
        <Route path="schedule" element={<FeatureStub title="Class Schedule" description="Class schedule will appear here when available." />} />
        <Route path="tasks" element={<FeatureStub title="Tasks" description="Tasks management is not available yet." />} />
        <Route path="grades" element={<FeatureStub title="Grade Report" description="Grade report is not available yet." />} />
        <Route path="calendar" element={<CalendarPage />} />
        <Route path="files" element={<FeatureStub title="Email & Files" description="Email and files integration is not available yet." />} />
        <Route path="holds" element={<FeatureStub title="Holds" description="Holds visibility is not available yet." />} />
        <Route path="activity" element={<FeatureStub title="Activity Feed" description="Activity feed is not available yet." />} />
        <Route path="alerts" element={<FeatureStub title="Alerts" description="Alerts will appear here when available." />} />
        {/* Billing */}
        <Route path="billing">
          <Route path="invoices" element={
              <RoleGate allow={["admin","super_admin"]}>
                <InvoicesPage />
              </RoleGate>
          } />
          <Route path="payments" element={
              <RoleGate allow={["cashier","admin","super_admin"]}>
                <PaymentsListPage />
              </RoleGate>
          } />
          <Route path="payments/:invoiceId" element={
              <RoleGate allow={["cashier","admin","super_admin"]}>
                <PaymentDetailPage />
              </RoleGate>
          } />
          <Route path="cash-registers" element={
              <RoleGate allow={["admin","super_admin"]}>
                <CashRegistersPage />
              </RoleGate>
          } />
          <Route path="invoicing-entities" element={
              <RoleGate allow={["admin","super_admin"]}>
                <InvoicingEntitiesPage />
              </RoleGate>
          } />
          <Route path="reports" element={
              <RoleGate allow={["admin","super_admin"]}>
                <ReportsPage />
              </RoleGate>
          } />
        </Route>
        {/* Tools */}
        <Route path="tools">
          <Route path="resources" element={<FeatureStub title="Resources" description="Resources will be listed here in a future release." />} />
          <Route path="academic" element={<FeatureStub title="Academic" description="Academic tools are not available yet." />} />
          <Route path="student-services" element={<FeatureStub title="Student Services" description="Student services are not available yet." />} />
          <Route path="employee-tools" element={<FeatureStub title="Employee Tools" description="Employee tools are not available yet." />} />
        </Route>
        <Route path="events" element={<CalendarPage />} />
        
        <Route path="cashier/closeout" element={
          <RoleGate allow={["cashier","admin","super_admin"]}>
            <CloseoutPage />
          </RoleGate>
        } />
        {/* Parent/Student portal */}
        <Route path="portal/invoices" element={
          <ProtectedRoute>
            <RoleGate allow={["student_parent"]}>
              <ParentInvoicesPage />
            </RoleGate>
          </ProtectedRoute>
        } />
        <Route path="portal/payments" element={
          <ProtectedRoute>
            <RoleGate allow={["student_parent"]}>
              <ParentPaymentsPage />
            </RoleGate>
          </ProtectedRoute>
        } />
        {/* People */}
        <Route path="people">
          <Route path="families" element={
              <RoleGate allow={["admin","super_admin"]}>
                <FamiliesPage />
              </RoleGate>
          } />
          <Route path="students" element={
              <RoleGate allow={["admin","super_admin"]}>
                <StudentsPage />
              </RoleGate>
          } />
          <Route path="teachers" element={
              <RoleGate allow={["admin","super_admin"]}>
                <TeachersPage />
              </RoleGate>
          } />
          <Route path="employees" element={
              <RoleGate allow={["admin","super_admin"]}>
                <EmployeesPage />
              </RoleGate>
          } />
          <Route path="roles" element={
              <RoleGate allow={["admin","super_admin"]}>
                <UsersRolesPage />
              </RoleGate>
          } />
        </Route>

        {/* Settings */}
        <Route path="settings">
          <Route path="org" element={
              <RoleGate allow={["admin","super_admin"]}>
                <OrgPreferencesPage />
              </RoleGate>
          } />
          <Route path="global" element={
              <RoleGate allow={["admin","super_admin"]}>
                <GlobalPreferencesPage />
              </RoleGate>
          } />
          <Route path="emitter-cfdi" element={
              <RoleGate allow={["admin","super_admin"]}>
                <EmitterCFDIPage />
              </RoleGate>
          } />
          <Route path="flags" element={
              <RoleGate allow={["admin","super_admin"]}>
                <AudienceFlagsPage />
              </RoleGate>
          } />
        </Route>
        <Route path="cashier/panel" element={<CashierPanel />} />
        {/** Admin experimental routes hidden for MVP */}
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
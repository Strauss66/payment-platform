import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import PublicLayout from './layouts/PublicLayout';
import AppLayout from './layouts/AppLayout';

// Pages that actually exist
import LandingPage from '../pages/LandingPage';
import SignInPage from '../pages/Auth/SignInPage';
import SignUpPage from '../pages/Auth/SignUpPage';
import TestConnection from '../pages/TestConnection';
import PortalDashboardPage from '../pages/features/dashboard/PortalDashboardPage';
import BaseDashboard from '../pages/dashboard/BaseDashboard';
import { useDashboard } from '../state/dashboard/DashboardContext';
import AdminDashboard from '../pages/Admin/AdminDashboard';
import CoursesDashboard from '../pages/StudentParent/CoursesDashboard';
import StubPage from '../pages/features/StubPage';

export default function AppRouter() {
  return (
    <Routes>
      {/* Test route for API connectivity */}
      <Route path="/test" element={<TestConnection />} />

      {/* Public routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/auth/login" element={<SignInPage />} />
      <Route path="/auth/register" element={<SignUpPage />} />

      {/* App routes - only including what exists */}
      <Route path="app" element={<AppLayout />}>
        <Route index element={<DashboardRoute />} />
        <Route path="dashboard" element={<DashboardRoute />} />
        <Route path="portal" element={<PortalDashboardPage />} />
        <Route path="courses" element={<CoursesDashboard />} />
        <Route path="schedule" element={<StubPage title="Class Schedule" />} />
        <Route path="tasks" element={<StubPage title="Tasks" />} />
        <Route path="grades" element={<StubPage title="Grade Report" />} />
        <Route path="calendar" element={<StubPage title="Academic Calendar" />} />
        <Route path="files" element={<StubPage title="Email & Files" />} />
        <Route path="holds" element={<StubPage title="Holds" />} />
        <Route path="activity" element={<StubPage title="Activity Feed" />} />
        <Route path="alerts" element={<StubPage title="Alerts" />} />
        <Route path="billing">
          <Route path="payments" element={<StubPage title="Payments" />} />
          <Route path="late-fees" element={<StubPage title="Late Fees" />} />
        </Route>
        <Route path="events" element={<StubPage title="Campus Events" />} />
        <Route path="admin" element={<AdminDashboard />} />
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

function DashboardRoute(){
  const { layout, widgets } = useDashboard();
  const tiles = [
    { title: 'Student Quick Links' },
    { title: 'Registration Links' },
    { title: 'Quick Help' }
  ];
  const renderWidget = (key) => {
    const found = widgets.find(w => w.key === key);
    if (!found) return null;
    const C = found.component;
    return <C />;
  };
  return <BaseDashboard tiles={tiles} layout={layout} renderWidget={renderWidget} recommendations={[{label:'Invite guardian'}, {label:'Complete profile'}]} />;
}
import React, { useContext } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthContext, ROLES } from "../context/AuthContext";


// Authentication pages
import Login from "../pages/Auth/Login";
import Register from "../pages/Auth/Register";
import ForgotPassword from "../pages/Auth/ForgotPassword";

// Admin pages
import AdminDashboard from "../pages/Admin/AdminDashboard";
import ManageUsers from "../pages/Admin/ManageUsers";
import Payments from "../pages/Admin/Payments";
import Reports from "../pages/Admin/Reports";
import LateFeePayers from "../pages/Admin/LateFeePayers";

// Cashier pages
import CashierDashboard from "../pages/Cashier/CashierDashboard";
import ProcessPayments from "../pages/Cashier/ProcessPayment.jsx";
import ViewTransactions from "../pages/Cashier/ViewTransaction.jsx";

// Student/Parent pages
import PortalDashboard from "../pages/StudentParent/PortalDashboard";
import ViewFees from "../pages/StudentParent/ViewFees";
import MakePayment from "../pages/StudentParent/MakePayment";
import DownloadInvoices from "../pages/StudentParent/DownloadInvoices";

// Teacher pages
import TeacherDashboard from "../pages/Teacher/TeacherDashboard";
import EnterGrades from "../pages/Teacher/EnterGrades";
import ViewAttendance from "../pages/Teacher/ViewAttendance";

// Layout
import Navigation from "../components/layout/Navigation";

import ViewInvoices from "../pages/StudentParent/DownloadInvoices";

// Student/Parent Routes
<Route
  path="/portal/download-invoices"
  element={
    <PrivateRoute roles={[ROLES.STUDENT_PARENT]}>
      <ViewInvoices />
    </PrivateRoute>
  }
/>

// Higher Order Component to protect routes
function PrivateRoute({ children, roles = [] }) {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    console.log("Auth is still loading...");
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  console.log("User:", user); // Debug log

  if (!user) {
    console.log("Redirecting to login...");
    return <Navigate to="/login" replace />;
  }

  if (roles.length && !roles.includes(user.role)) {
    
    return <div className="p-4 text-red-500">You do not have permission to view this page.</div>;
  }

  return children;
}

export default function AppRoutes() {
  return (
    <>
      {/* The Navigation can be shown on most pages, except for maybe auth pages */}
      <Navigation />
      <Routes>
        {/* Auth Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* Admin Routes */}
        <Route
          path="/admin/dashboard"
          element={
            <PrivateRoute roles={[ROLES.ADMIN]}>
              <AdminDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/manage-users"
          element={
            <PrivateRoute roles={[ROLES.ADMIN]}>
              <ManageUsers />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/payments"
          element={
            <PrivateRoute roles={[ROLES.ADMIN]}>
              <Payments />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/reports"
          element={
            <PrivateRoute roles={[ROLES.ADMIN]}>
              <Reports />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/late-fee-payers"
          element={
            <PrivateRoute roles={[ROLES.ADMIN]}>
              <LateFeePayers />
            </PrivateRoute>
          }
        /> 

        {/* Cashier Routes */}
        <Route
          path="/cashier/dashboard"
          element={
            <PrivateRoute roles={[ROLES.CASHIER]}>
              <CashierDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/cashier/process-payments"
          element={
            <PrivateRoute roles={[ROLES.CASHIER]}>
              <ProcessPayments />
            </PrivateRoute>
          }
        />
        <Route
          path="/cashier/view-transactions"
          element={
            <PrivateRoute roles={[ROLES.CASHIER]}>
              <ViewTransactions />
            </PrivateRoute>
          }
        />

        {/* Student/Parent Routes */}
        <Route
          path="/portal/dashboard"
          element={
            <PrivateRoute roles={[ROLES.STUDENT_PARENT]}>
              <PortalDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/portal/view-fees"
          element={
            <PrivateRoute roles={[ROLES.STUDENT_PARENT]}>
              <ViewFees />
            </PrivateRoute>
          }
        />
        <Route
          path="/portal/make-payment"
          element={
            <PrivateRoute roles={[ROLES.STUDENT_PARENT]}>
              <MakePayment />
            </PrivateRoute>
          }
        />
        <Route
          path="/portal/download-invoices"
          element={
            <PrivateRoute roles={[ROLES.STUDENT_PARENT]}>
              <DownloadInvoices />
            </PrivateRoute>
          }
        />

        {/* Teacher Routes */}
        <Route
          path="/teacher/dashboard"
          element={
            <PrivateRoute roles={[ROLES.TEACHER]}>
              <TeacherDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/teacher/enter-grades"
          element={
            <PrivateRoute roles={[ROLES.TEACHER]}>
              <EnterGrades />
            </PrivateRoute>
          }
        />
        <Route
          path="/teacher/view-attendance"
          element={
            <PrivateRoute roles={[ROLES.TEACHER]}>
              <ViewAttendance />
            </PrivateRoute>
          }
        />

        {/* Default route */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
      
    </>
  );
}
import React, { useContext } from "react";
import { Routes, Route, Navigate } from "react-router-dom"; // Removed BrowserRouter
import { AuthContext, ROLES } from "../context/AuthContext";

// Authentication Pages
import Login from "../pages/Auth/Login";
import Register from "../pages/Auth/Register";
import ForgotPassword from "../pages/Auth/ForgotPassword";

// Admin Pages
import AdminDashboard from "../pages/Admin/AdminDashboard";
import AdminUsers from "../pages/Admin/AdminUsers"; 
import AdminRoles from "../pages/Admin/AdminRoles"; 
import AdminPermissions from "../pages/Admin/AdminPermission"; // Fixed incorrect import name
import LateFeePayers from "../pages/Admin/LateFeePayers";

// Cashier Pages
import CashierDashboard from "../pages/Cashier/CashierDashboard";
import ProcessPayments from "../pages/Cashier/ProcessPayment"; // Fixed incorrect import name
import ViewTransactions from "../pages/Cashier/ViewTransaction"; // Fixed incorrect import name

// Student/Parent Pages
import PortalDashboard from "../pages/StudentParent/PortalDashboard";
import ViewFees from "../pages/StudentParent/ViewFees";
import MakePayment from "../pages/StudentParent/MakePayment";
import DownloadInvoices from "../pages/StudentParent/DownloadInvoices";

// Teacher Pages
import TeacherDashboard from "../pages/Teacher/TeacherDashboard";
import EnterGrades from "../pages/Teacher/EnterGrades";
import ViewAttendance from "../pages/Teacher/ViewAttendance";

// Layout
import Navigation from "../components/layout/Navigation";

// Higher Order Component to Protect Routes
function PrivateRoute({ children, roles = [] }) {
  const { user, loading } = useContext(AuthContext);

  if (loading) return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (roles.length && !roles.includes(user.role)) return <div className="p-4 text-red-500">Access Denied</div>;

  return children;
}

export default function AppRoutes() {
  return (
    <>
      <Navigation />
      <Routes>
        {/* Auth Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* Admin Routes */}
        <Route path="/admin/dashboard" element={<PrivateRoute roles={[ROLES.ADMIN]}><AdminDashboard /></PrivateRoute>} />
        <Route path="/admin/users" element={<PrivateRoute roles={[ROLES.ADMIN]}><AdminUsers /></PrivateRoute>} />
        <Route path="/admin/roles" element={<PrivateRoute roles={[ROLES.ADMIN]}><AdminRoles /></PrivateRoute>} />
        <Route path="/admin/permissions" element={<PrivateRoute roles={[ROLES.ADMIN]}><AdminPermissions /></PrivateRoute>} />
        <Route path="/admin/late-fee-payers" element={<PrivateRoute roles={[ROLES.ADMIN]}><LateFeePayers /></PrivateRoute>} />

        {/* Cashier Routes */}
        <Route path="/cashier/dashboard" element={<PrivateRoute roles={[ROLES.CASHIER]}><CashierDashboard /></PrivateRoute>} />
        <Route path="/cashier/process-payments" element={<PrivateRoute roles={[ROLES.CASHIER]}><ProcessPayments /></PrivateRoute>} />
        <Route path="/cashier/view-transactions" element={<PrivateRoute roles={[ROLES.CASHIER]}><ViewTransactions /></PrivateRoute>} />

        {/* Student/Parent Routes */}
        <Route path="/portal/dashboard" element={<PrivateRoute roles={[ROLES.STUDENT_PARENT]}><PortalDashboard /></PrivateRoute>} />
        <Route path="/portal/view-fees" element={<PrivateRoute roles={[ROLES.STUDENT_PARENT]}><ViewFees /></PrivateRoute>} />
        <Route path="/portal/make-payment" element={<PrivateRoute roles={[ROLES.STUDENT_PARENT]}><MakePayment /></PrivateRoute>} />
        <Route path="/portal/download-invoices" element={<PrivateRoute roles={[ROLES.STUDENT_PARENT]}><DownloadInvoices /></PrivateRoute>} />

        {/* Teacher Routes */}
        <Route path="/teacher/dashboard" element={<PrivateRoute roles={[ROLES.TEACHER]}><TeacherDashboard /></PrivateRoute>} />
        <Route path="/teacher/enter-grades" element={<PrivateRoute roles={[ROLES.TEACHER]}><EnterGrades /></PrivateRoute>} />
        <Route path="/teacher/view-attendance" element={<PrivateRoute roles={[ROLES.TEACHER]}><ViewAttendance /></PrivateRoute>} />

        {/* Default Route */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </>
  );
}
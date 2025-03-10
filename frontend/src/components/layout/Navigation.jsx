import React from "react";
import { Link } from "react-router-dom";
import { useAuth, ROLES } from "../../context/AuthContext"; // ✅ Import correctly

export default function Navigation() {
  const { user, logout } = useAuth(); // ✅ Use `useAuth()` instead of raw `AuthContext`

  if (!user) {
    return null;
  }

  return (
    <nav className="bg-white shadow-md px-4 py-2 flex justify-between items-center">
      <div className="text-xl font-bold">
        <Link to="/">School Payment Platform</Link>
      </div>
      <ul className="flex space-x-4">
        {user.role === ROLES.ADMIN && (
          <>
            <li><Link to="/admin/dashboard">Admin Dashboard</Link></li>
            <li><Link to="/admin/manage-users">Manage Users</Link></li>
            <li><Link to="/admin/payments">Payments</Link></li>
            <li><Link to="/admin/reports">Reports</Link></li>
          </>
        )}
        {user.role === ROLES.CASHIER && (
          <>
            <li><Link to="/cashier/dashboard">Cashier Dashboard</Link></li>
            <li><Link to="/cashier/process-payments">Process Payments</Link></li>
            <li><Link to="/cashier/view-transactions">View Transactions</Link></li>
          </>
        )}
        {user.role === ROLES.STUDENT_PARENT && (
          <>
            <li><Link to="/portal/dashboard">Portal</Link></li>
            <li><Link to="/portal/view-fees">View Fees</Link></li>
            <li><Link to="/portal/make-payment">Make Payment</Link></li>
            <li><Link to="/portal/download-invoices">Download Invoices</Link></li>
          </>
        )}
        {user.role === ROLES.TEACHER && (
          <>
            <li><Link to="/teacher/dashboard">Teacher Dashboard</Link></li>
            <li><Link to="/teacher/enter-grades">Enter Grades</Link></li>
            <li><Link to="/teacher/view-attendance">View Attendance</Link></li>
          </>
        )}
      </ul>
      <button
        onClick={logout}
        className="bg-gray-200 px-3 py-1 rounded hover:bg-gray-300 text-sm"
      >
        Logout
      </button>
    </nav>
  );
}
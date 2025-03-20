import React from "react";
import { Link } from "react-router-dom";

export default function AdminNav() {
  return (
    <nav className="bg-gray-800 text-white p-4">
      <ul className="flex gap-4">
        <li><Link to="/admin/dashboard">Dashboard</Link></li>
        <li><Link to="/admin/users">Manage Users</Link></li>
        <li><Link to="/admin/roles">Manage Roles</Link></li>
        <li><Link to="/admin/permissions">Manage Permissions</Link></li>
        <li><Link to="/admin/late-fee-payers">Late Fee Payers</Link></li>
      </ul>
    </nav>
  );
}
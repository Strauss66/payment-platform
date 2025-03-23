import React from "react";
import { Link } from "react-router-dom";

export default function AdminNav() {
  return (
    <nav className="bg-gray-800 text-white p-4">
      <ul className="flex justify-center gap-6">
        <li><Link to="/admin/users" className="hover:underline">Manage Users</Link></li>
        <li><Link to="/admin/roles" className="hover:underline">Manage Roles</Link></li>
        <li><Link to="/admin/permissions" className="hover:underline">Manage Permissions</Link></li>
        <li><Link to="/admin/late-fee-payers" className="hover:underline">Late Fee Payers</Link></li>
      </ul>
    </nav>
  );
}
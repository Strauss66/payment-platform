import React from "react";
import { Link } from "react-router-dom";

export default function AdminNav() {
  return (
    <nav className="bg-gray-900 text-white p-4">
      <div className="container mx-auto flex justify-between">
        <h2 className="text-lg font-bold">Admin Panel</h2>
        <ul className="flex gap-4">
          <li><Link to="/admin/users" className="hover:text-gray-300">Users</Link></li>
          <li><Link to="/admin/roles" className="hover:text-gray-300">Roles</Link></li>
          <li><Link to="/admin/permissions" className="hover:text-gray-300">Permissions</Link></li>
        </ul>
      </div>
    </nav>
  );
}
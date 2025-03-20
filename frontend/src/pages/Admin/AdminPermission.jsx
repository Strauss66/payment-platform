import React, { useEffect, useState } from "react";
import axios from "axios";
import { Table } from "react-bootstrap";
import { Link } from "react-router-dom";
import AdminNav from "../Admin/AdminNav.jsx";  // Ensure path is correct

export default function AdminPermissions() {
  const [permissions, setPermissions] = useState([]);

  useEffect(() => {
    axios.get("/api/admin/permissions")
      .then(response => setPermissions(response.data))
      .catch(error => console.error("Error fetching permissions:", error));
  }, []);

  return (
    <div className="min-h-screen bg-gray-100">
      <AdminNav />
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Permission Management</h1>

        {/* Permission List */}
        <ul className="bg-white p-4 shadow-md rounded-lg">
          {permissions.map(permission => (
            <li key={permission.id} className="border-b p-2">{permission.name}</li>
          ))}
        </ul>
        <Link to="/admin/dashboard" className="btn btn-secondary mt-4">Back to Dashboard</Link>
      </div>
    </div>
  );
}
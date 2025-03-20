import React, { useEffect, useState } from "react";
import axios from "axios";
import AdminNav from "../Admin/AdminNav.jsx";  // Ensure path is correct

export default function AdminRoles() {
  const [roles, setRoles] = useState([]);

  useEffect(() => {
    axios.get("/api/admin/roles")
      .then(response => setRoles(response.data))
      .catch(error => console.error("Error fetching roles:", error));
  }, []);

  return (
    <div className="min-h-screen bg-gray-100">
      <AdminNav />
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Role Management</h1>

        {/* Role List */}
        <ul className="bg-white p-4 shadow-md rounded-lg">
          {roles.map(role => (
            <li key={role.id} className="border-b p-2">{role.name}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
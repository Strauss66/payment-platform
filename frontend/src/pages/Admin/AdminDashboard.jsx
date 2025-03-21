import React from "react";
import { useNavigate } from "react-router-dom";

export default function AdminDashboard() {
  const navigate = useNavigate();

  const panels = [
    { title: "Manage Users", link: "/admin/users", description: "View and manage all users." },
    { title: "Manage Roles", link: "/admin/roles", description: "Assign and edit roles." },
    { title: "Manage Permissions", link: "/admin/permissions", description: "Control user access levels." },
    { title: "Late Fee Payers", link: "/admin/late-fee-payers", description: "Check overdue payments." },
  ];

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {panels.map((panel, index) => (
          <div
            key={index}
            onClick={() => navigate(panel.link)}
            className="cursor-pointer block bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition"
          >
            <h2 className="text-xl font-semibold mb-2">{panel.title}</h2>
            <p className="text-gray-600">{panel.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

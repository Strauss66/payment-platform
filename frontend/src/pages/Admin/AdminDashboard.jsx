import React from "react";
import { useNavigate } from "react-router-dom";
import { FaUsers, FaUserShield, FaKey, FaExclamationCircle } from "react-icons/fa";

export default function AdminDashboard() {
  const navigate = useNavigate();

  const panels = [
    { title: "Manage Users", link: "/admin/users", description: "View and manage all users.", icon: <FaUsers className="text-blue-500 text-3xl" /> },
    { title: "Manage Roles", link: "/admin/roles", description: "Assign and edit roles.", icon: <FaUserShield className="text-green-500 text-3xl" /> },
    { title: "Manage Permissions", link: "/admin/permissions", description: "Control user access levels.", icon: <FaKey className="text-yellow-500 text-3xl" /> },
    { title: "Late Fee Payers", link: "/admin/late-fee-payers", description: "Check overdue payments.", icon: <FaExclamationCircle className="text-red-500 text-3xl" /> },
  ];

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-semibold mb-8 text-gray-800">Admin Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {panels.map((panel, index) => (
          <AdminPanelCard key={index} panel={panel} navigate={navigate} />
        ))}
      </div>
    </div>
  );
}

const AdminPanelCard = ({ panel, navigate }) => (
  <div
    onClick={() => navigate(panel.link)}
    className="cursor-pointer bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-transform transform hover:scale-105 flex flex-col items-start"
  >
    {panel.icon}
    <h2 className="text-lg font-semibold text-gray-700 mt-2">{panel.title}</h2>
    <p className="text-gray-600">{panel.description}</p>
  </div>
);

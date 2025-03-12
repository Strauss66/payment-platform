import React, { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import Card from "../../components/common/Card";

export default function AdminDashboard() {
  const { user } = useContext(AuthContext);

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">Welcome, {user?.email} 👋</h1>
      <h2 className="text-xl text-gray-500 mb-6">Role: {user?.role}</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card title="Total Users" content="50" />
        <Card title="Pending Fees" content="$3,200" />
        <Card title="Reports Generated" content="12" />
      </div>
    </div>
  );
}

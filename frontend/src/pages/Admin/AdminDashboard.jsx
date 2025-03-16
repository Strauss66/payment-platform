import React from "react";
import Card from "../../components/common/Card";
import { Link } from "react-router-dom";

export default function AdminDashboard() {
  const totalUsers = 50; // Placeholder, can be fetched from API
  const pendingFees = 3200; // Placeholder for now
  const reportsGenerated = 12; // Placeholder

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">Admin Dashboard</h1>

      {/* Dashboard Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card title="Total Users" content={totalUsers} />
        <Card title="Pending Fees" content={`$${pendingFees}`} />
        <Card title="Reports Generated" content={reportsGenerated} />
      </div>

      {/* View Late Payers Button */}
      <div className="mt-6">
        <Link to="/admin/late-fee-payers" className="btn btn-danger">
          View Late Payers
        </Link>
      </div>
    </div>
  );
}

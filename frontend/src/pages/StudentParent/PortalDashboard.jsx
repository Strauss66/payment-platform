import React from "react";
import { useNavigate } from "react-router-dom";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";

export default function PortalDashboard() {
  const navigate = useNavigate();

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">Student/Parent Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card title="Outstanding Balance" content="$500" />
        <Card title="Upcoming Due Dates" content="3" />
        <Card title="Last Payment" content="$200 on 03/05/2025" />
        <Card title="Latest Grades" content="A, B, A-" />

        {/* Clickable Card for Viewing Invoices */}
        <div onClick={() => navigate("/portal/download-invoices")} className="cursor-pointer">
          <Card title="Total Invoices" content="2" />
        </div>
      </div>
    </div>
  );
}
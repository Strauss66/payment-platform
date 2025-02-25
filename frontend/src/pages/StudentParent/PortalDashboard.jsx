import React from "react";
import Card from "../../components/common/Card";

export default function PortalDashboard() {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">Student/Parent Portal</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card title="Outstanding Fees" content="$500" />
        <Card title="Upcoming Due Dates" content="3" />
        <Card title="Latest Grades" content="A, B, A-" />
      </div>
    </div>
  );
}
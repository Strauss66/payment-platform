import React from "react";
import Card from "../../components/common/Card";

export default function CashierDashboard() {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">Cashier Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card title="Daily Collections" content="$1,250" />
        <Card title="Pending Transactions" content="3" />
        <Card title="Invoices Generated" content="15" />
      </div>
    </div>
  );
}
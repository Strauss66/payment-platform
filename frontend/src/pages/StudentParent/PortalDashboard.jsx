import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";

export default function PortalDashboard() {
  const navigate = useNavigate();
  const [balance, setBalance] = useState(500); // Initial balance (mock)
  const [lateFee, setLateFee] = useState(0);
  const dueDate = new Date("2025-03-01"); // Example due date (mock)

  useEffect(() => {
    const today = new Date();
    
    if (today > dueDate) {
      const daysLate = Math.floor((today - dueDate) / (1000 * 60 * 60 * 24)); // Get late days
      const penalty = daysLate * 5; // Example: $5 per day late fee

      setLateFee(penalty);
      setBalance((prevBalance) => prevBalance + penalty);
    }
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">Student/Parent Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card title="Outstanding Balance" content={`$${balance}`} />
        <Card title="Upcoming Due Dates" content="3" />
        <Card title="Last Payment" content="$200 on 03/05/2025" />
        <Card title="Latest Grades" content="A, B, A-" />

        {/* Display Late Fees if applicable */}
        {lateFee > 0 && (
          <Card
            title="Late Fees Applied"
            content={`$${lateFee} (Due Date: 03/01/2025)`}
          />
        )}

        {/* Clickable Card for Viewing Invoices */}
        <div onClick={() => navigate("/portal/download-invoices")} className="cursor-pointer">
          <Card title="Total Invoices" content="2" />
        </div>
      </div>
    </div>
  );
}
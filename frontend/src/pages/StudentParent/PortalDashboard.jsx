import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Card from "../../components/common/Card";


export default function PortalDashboard() {
  const navigate = useNavigate();
  const [balance, setBalance] = useState(0); // Default to 0
  const [lateFee, setLateFee] = useState(0);
  const [lastPayment, setLastPayment] = useState("No payments made");
  const dueDate = new Date("2025-03-01"); // Mock due date

  useEffect(() => {
    const fetchBalance = async () => {
      try {
        const response = await axios.get("http://localhost:5001/api/student/balance/1"); // Replace with dynamic studentId
        const { balance, invoices, lateFee } = response.data;

        setBalance(balance ?? 0);
        setLateFee(lateFee ?? 0); // Ensure lateFee is always a number

        if (invoices.length > 0) {
          const latestInvoice = invoices[invoices.length - 1];
          setLastPayment(`$${latestInvoice.total_amount} on ${new Date(latestInvoice.invoice_date).toLocaleDateString()}`);
        }
      } catch (error) {
        console.error("Error fetching balance:", error);
      }
    };

    fetchBalance();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">Student/Parent Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card title="Outstanding Balance" content={`$${balance}`} />
        <Card title="Upcoming Due Date" content={dueDate.toLocaleDateString()} />
        <Card title="Last Payment" content={lastPayment} />

        {/* Late Fee Card - Always Displayed */}
        <Card
          title="Late Fees Applied"
          content={lateFee > 0 ? `$${lateFee} (Due Date: ${dueDate.toLocaleDateString()})` : "No Late Fees"}
        />

        {/* Clickable Card for Viewing Invoices */}
        <div onClick={() => navigate("/portal/download-invoices")} className="cursor-pointer">
          <Card title="Total Invoices" content="2" />
        </div>
      </div>
    </div>
  );
}
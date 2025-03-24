import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FaDollarSign, FaCalendarAlt, FaHistory, FaFileInvoiceDollar, FaExclamationTriangle } from "react-icons/fa";

export default function PortalDashboard() {
  const navigate = useNavigate();
  const [balance, setBalance] = useState(null);
  const [lateFee, setLateFee] = useState(null);
  const [lastPayment, setLastPayment] = useState("No payments made");
  const dueDate = new Date("2025-03-01");

  useEffect(() => {
    const fetchBalance = async () => {
      try {
        const { data } = await axios.get("http://localhost:5001/api/student/balance/1");
        const { balance, invoices, lateFee } = data;

        setBalance(balance ?? "No balance due");
        setLateFee(lateFee ?? "None");

        if (Array.isArray(invoices) && invoices.length > 0) {
          const latestInvoice = invoices.sort((a, b) => new Date(b.invoice_date) - new Date(a.invoice_date))[0];
          setLastPayment(`$${latestInvoice.total_amount} on ${new Date(latestInvoice.invoice_date).toLocaleDateString()}`);
        }
      } catch (error) {
        console.error("Error fetching balance:", error);
      }
    };

    fetchBalance();
  }, []);

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-semibold mb-8 text-gray-800">Student Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <DashboardCard icon={<FaDollarSign className="text-2xl text-blue-500" />} title="Balance" content={balance} />
        <DashboardCard icon={<FaCalendarAlt className="text-2xl text-green-500" />} title="Payment Due Date" content={dueDate.toLocaleDateString()} />
        <DashboardCard icon={<FaHistory className="text-2xl text-yellow-500" />} title="Your Last Payment" content={lastPayment} />
        <DashboardCard
          icon={<FaExclamationTriangle className="text-2xl text-red-500" />}
          title="Late Fees"
          content={lateFee > 0 ? `$${lateFee} (Due: ${dueDate.toLocaleDateString()})` : "No late fees"}
        />

        <div
          onClick={() => navigate("/portal/download-invoices")}
          className="bg-blue-100 rounded-lg shadow p-6 flex flex-col items-start cursor-pointer hover:bg-blue-200 transition-transform transform hover:scale-105"
        >
          <FaFileInvoiceDollar className="text-2xl text-blue-600 mb-2" />
          <h2 className="text-lg font-semibold text-blue-800">View Invoices</h2>
          <p className="text-xl text-blue-700">Manage invoices here.</p>
        </div>
      </div>
    </div>
  );
}

const DashboardCard = ({ icon, title, content }) => (
  <div className="bg-white rounded-lg shadow p-6 flex flex-col items-start hover:shadow-lg transition-transform transform hover:scale-105">
    {icon}
    <h2 className="text-lg font-semibold text-gray-700 mt-2">{title}</h2>
    <p className="text-2xl font-bold text-gray-900">{content}</p>
  </div>
);

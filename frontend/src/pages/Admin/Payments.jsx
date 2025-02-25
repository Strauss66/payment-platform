import React, { useEffect, useState } from "react";
import axios from "axios";
import Table from "../../components/common/Table";

export default function Payments() {
  const [paymentData, setPaymentData] = useState([]);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const res = await axios.get("/api/admin/payments");
        setPaymentData(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchPayments();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">All Payments</h1>
      <Table
        data={paymentData}
        columns={[
          { key: "invoiceId", label: "Invoice ID" },
          { key: "amount", label: "Amount" },
          { key: "status", label: "Status" },
        ]}
      />
    </div>
  );
}
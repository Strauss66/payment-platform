import React, { useEffect, useState } from "react";
import axios from "axios";
import Table from "../../components/common/Table";

export default function ViewTransactions() {
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const { data } = await axios.get("/api/cashier/transactions");
        setTransactions(data);
      } catch (error) {
        console.error("Error fetching transactions: ", error);
      }
    };
    fetchTransactions();
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">All Transactions</h2>
      <Table
        data={transactions}
        columns={[
          { key: "transactionId", label: "Transaction ID" },
          { key: "invoiceId", label: "Invoice ID" },
          { key: "amount", label: "Amount" },
          { key: "date", label: "Date" },
        ]}
      />
    </div>
  );
}
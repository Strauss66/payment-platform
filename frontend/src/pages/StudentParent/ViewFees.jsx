import React, { useEffect, useState } from "react";
import axios from "axios";
import Table from "../../components/common/Table";

export default function ViewFees() {
  const [fees, setFees] = useState([]);

  useEffect(() => {
    const fetchFees = async () => {
      try {
        const { data } = await axios.get("/api/portal/fees");
        setFees(data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchFees();
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Your Fees</h2>
      <Table
        data={fees}
        columns={[
          { key: "feeId", label: "Fee ID" },
          { key: "description", label: "Description" },
          { key: "amount", label: "Amount" },
          { key: "dueDate", label: "Due Date" },
        ]}
      />
    </div>
  );
}
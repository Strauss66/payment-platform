import React, { useState } from "react";
import axios from "axios";
import Button from "../../components/common/Button";

export default function ProcessPayments() {
  const [invoiceId, setInvoiceId] = useState("");
  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState("");

  const handlePayment = async () => {
    try {
      await axios.post("/api/cashier/process-payment", { invoiceId, amount });
      setMessage("Payment processed successfully");
    } catch (error) {
      setMessage("Failed to process payment");
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Process Payment</h2>
      <div className="mb-4">
        <label className="block mb-2">Invoice ID</label>
        <input
          className="border p-2 w-full"
          value={invoiceId}
          onChange={(e) => setInvoiceId(e.target.value)}
        />
      </div>
      <div className="mb-4">
        <label className="block mb-2">Amount</label>
        <input
          className="border p-2 w-full"
          type="number"
          step="0.01"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
      </div>
      <Button text="Process Payment" onClick={handlePayment} />
      {message && <div className="mt-2">{message}</div>}
    </div>
  );
}
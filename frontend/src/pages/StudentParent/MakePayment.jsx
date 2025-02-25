import React, { useState } from "react";
import axios from "axios";
import Button from "../../components/common/Button";

export default function MakePayment() {
  const [feeId, setFeeId] = useState("");
  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState("");

  const handlePayment = async () => {
    try {
      await axios.post("/api/portal/pay", { feeId, amount });
      setMessage("Payment successful!");
    } catch (error) {
      setMessage("Payment failed.");
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Make a Payment</h2>
      <div className="mb-4">
        <label className="block mb-2">Fee ID</label>
        <input
          className="border p-2 w-full"
          value={feeId}
          onChange={(e) => setFeeId(e.target.value)}
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
      <Button text="Pay Now" onClick={handlePayment} />
      {message && <div className="mt-2">{message}</div>}
    </div>
  );
}
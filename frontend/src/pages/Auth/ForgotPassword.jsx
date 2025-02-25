import React, { useState } from "react";
import axios from "axios";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("/api/auth/forgot-password", { email });
      setMessage("Password reset email sent, please check your inbox.");
    } catch (error) {
      setMessage("Failed to send password reset email.");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded shadow-md w-full max-w-md"
      >
        <h1 className="text-2xl font-bold mb-6">Forgot Password</h1>
        {message && <div className="mb-4 text-blue-500">{message}</div>}
        <div className="mb-4">
          <label htmlFor="email" className="block mb-2 font-medium">
            Email
          </label>
          <input
            className="w-full p-2 border border-gray-300 rounded"
            type="email"
            name="email"
            id="email"
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <button
          className="bg-blue-600 text-white font-bold py-2 px-4 rounded hover:bg-blue-700 w-full"
          type="submit"
        >
          Reset Password
        </button>
      </form>
    </div>
  );
}
import React, { useEffect, useState } from "react";
import axios from "axios";
import { Table } from "react-bootstrap";
import { Link } from "react-router-dom";

export default function LateFeePayers() {
  const [studentBalances, setStudentBalances] = useState([]); // Ensure it's an array
  const [latePayers, setLatePayers] = useState([]);

  useEffect(() => {
    const fetchBalances = async () => {
      try { 
        const token = localStorage.getItem("token");

        const response = await axios.get("http://localhost:5001/api/admin/all-balances", {
          headers: { Authorization: `Bearer ${token}` },
        });

        console.log("Fetched student balances:", response.data);
        setStudentBalances(Array.isArray(response.data) ? response.data : []); // Ensure it's an array
      } catch (error) {
        console.error("Error fetching balances:", error.response?.data || error.message);
        setStudentBalances([]); // Set empty array if error
      }
    };

    const fetchLatePayers = async () => {
      try {
        const token = localStorage.getItem("token");

        const response = await axios.get("http://localhost:5001/api/admin/late-payers", {
          headers: { Authorization: `Bearer ${token}` },
        });

        console.log("Fetched late payers:", response.data);
        setLatePayers(Array.isArray(response.data) ? response.data : []); // Ensure it's an array
      } catch (error) {
        console.error("Error fetching late payers:", error.response?.data || error.message);
        setLatePayers([]); // Set empty array if error
      }
    };

    fetchBalances();
    fetchLatePayers();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">Late Fee Payers</h1>

      {/* Student Balances */}
      <h2 className="text-2xl font-bold mt-6">Student Balances</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        {studentBalances.length > 0 ? (
          studentBalances.map((student) => (
            <div key={student.id} className="p-4 border rounded-lg shadow bg-white">
              <h3 className="text-lg font-semibold">{student.name}</h3>
              <p>Total Balance: <span className="font-bold text-red-500">${student.balance?.toFixed(2)}</span></p>
              <p>Late Fees Applied: <span className="font-bold">${student.lateFee?.toFixed(2)}</span></p>
            </div>
          ))
        ) : (
          <p className="text-gray-600">No student balances found.</p>
        )}
      </div>

      {/* Late Payers Table */}
      <h2 className="text-2xl font-bold mt-6">Late Payers</h2>
      {latePayers.length === 0 ? (
        <p>No late payers found.</p>
      ) : (
        <Table striped bordered hover className="mt-4">
          <thead>
            <tr>
              <th>Student Name</th>
              <th>Parent Name</th>
              <th>Amount Due</th>
              <th>Due Date</th>
              <th>Late Fee</th>
              <th>Final Amount</th>
            </tr>
          </thead>
          <tbody>
            {latePayers.map((payer, index) => (
              <tr key={index}>
                <td>{payer.studentFirstName} {payer.studentLastName}</td>
                <td>{payer.parentFirstName} {payer.parentLastName}</td>
                <td>${payer.amountDue}</td>
                <td>{new Date(payer.dueDate).toLocaleDateString()}</td>
                <td>${payer.lateFee}</td>
                <td>${payer.finalAmount}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      <Link to="/admin/dashboard" className="btn btn-secondary mt-4">Back to Dashboard</Link>
    </div>
  );
}
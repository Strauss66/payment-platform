import React, { useEffect, useState } from "react";
import axios from "axios";
import { Table } from "react-bootstrap";
import { Link } from "react-router-dom";
import AdminNav from "../Admin/AdminNav.jsx";  // Ensure path is correct

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    axios.get("/api/admin/users")
      .then(response => setUsers(response.data))
      .catch(error => console.error("Error fetching users:", error));
  }, []);

  return (
    <div className="min-h-screen bg-gray-100">
      <AdminNav />
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">User Management</h1>

        {/* Search Bar */}
        <input
          type="text"
          placeholder="Search users..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border p-2 mb-4 w-full"
        />

        {/* User Table */}
        <table className="w-full bg-white shadow-md rounded-lg">
          <thead>
            <tr className="bg-gray-800 text-white">
              <th className="p-2">Username</th>
              <th className="p-2">Email</th>
              <th className="p-2">Role</th>
              <th className="p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.filter(user => user.username.includes(search)).map(user => (
              <tr key={user.id} className="border-t">
                <td className="p-2">{user.username}</td>
                <td className="p-2">{user.email}</td>
                <td className="p-2">{user.role}</td>
                <td className="p-2">
                  <button className="bg-blue-500 text-white px-2 py-1 rounded">Edit</button>
                  <button className="bg-red-500 text-white px-2 py-1 rounded ml-2">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <Link to="/admin/dashboard" className="btn btn-secondary mt-4">Back to Dashboard</Link>
      </div>
    </div>
  );
}
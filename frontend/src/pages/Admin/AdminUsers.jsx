
import React, { useEffect, useState } from "react";
import axios from "axios";
import { Modal, Button, Form } from "react-bootstrap";
import { Link } from "react-router-dom";
import AdminNav from "../Admin/AdminNav.jsx"; // Ensure path is correct
import { FaEdit, FaTrash, FaSearch } from "react-icons/fa";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [editData, setEditData] = useState({ username: "", email: "", role: "" });

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get("http://localhost:5001/api/admin/users");
        console.log("API Response:", response.data); // Debug API response

        setUsers(Array.isArray(response.data) ? response.data : []);
      } catch (error) {
        console.error("Error fetching users:", error.response?.data || error.message);
        setUsers([]); // Ensure users is always an array
      }
    };

    fetchUsers();
  }, []);

  const fetchUsers = () => {
    axios
      .get("http://localhost:5001/api/admin/users")
      .then((response) => setUsers(Array.isArray(response.data) ? response.data : []))
      .catch((error) => console.error("Error fetching users:", error));
  };

  // Handle Delete User
  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      axios
        .delete(`http://localhost:5001/api/admin/users/${id}`)
        .then(() => {
          alert("User deleted successfully.");
          fetchUsers(); // Refresh user list
        })
        .catch((error) => console.error("Error deleting user:", error));
    }
  };

  // Open Edit Modal
  const handleEdit = (user) => {
    setSelectedUser(user);
    setEditData({ username: user.username, email: user.email, role: user.role });
    setShowModal(true);
  };

  // Handle Edit Form Submission
  const handleEditSubmit = () => {
    axios
      .put(`http://localhost:5001/api/admin/users/${selectedUser.id}`, editData)
      .then(() => {
        alert("User updated successfully.");
        setShowModal(false);
        fetchUsers(); // Refresh user list
      })
      .catch((error) => console.error("Error updating user:", error));
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <AdminNav />
      <div className="p-6">
        <h1 className="text-3xl font-semibold mb-6 text-gray-800">User Management</h1>

        {/* Search Bar */}
        <div className="flex items-center mb-4 bg-white rounded-lg shadow p-3">
          <FaSearch className="text-gray-500 mr-2" />
          <input
            type="text"
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="outline-none w-full"
          />
        </div>

        {/* User Table */}
        <div className="overflow-x-auto">
          <table className="w-full bg-white shadow-lg rounded-lg">
            <thead>
              <tr className="bg-gray-800 text-white">
                <th className="p-3">Username</th>
                <th className="p-3">Email</th>
                <th className="p-3">Role</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.filter(user => user.username.toLowerCase().includes(search.toLowerCase())).map(user => (
                <tr key={user.id} className="border-t hover:bg-gray-100 transition">
                  <td className="p-3">{user.username}</td>
                  <td className="p-3">{user.email}</td>
                  <td className="p-3">{user.role}</td>
                  <td className="p-3 flex gap-2">
                    <button onClick={() => handleEdit(user)} className="bg-blue-500 text-white px-3 py-1 rounded flex items-center gap-1 hover:bg-blue-600 transition">
                      <FaEdit /> Edit
                    </button>
                    <button onClick={() => handleDelete(user.id)} className="bg-red-500 text-white px-3 py-1 rounded flex items-center gap-1 hover:bg-red-600 transition">
                      <FaTrash /> Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <Link to="/admin/dashboard" className="inline-block bg-gray-600 text-white px-4 py-2 rounded mt-4 hover:bg-gray-700 transition">
          Back to Dashboard
        </Link>

        {/* Edit User Modal */}
        <Modal show={showModal} onHide={() => setShowModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Edit User</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Username</Form.Label>
                <Form.Control
                  type="text"
                  value={editData.username}
                  onChange={(e) => setEditData({ ...editData, username: e.target.value })}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Email</Form.Label>
                <Form.Control
                  type="email"
                  value={editData.email}
                  onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Role</Form.Label>
                <Form.Select
                  value={editData.role}
                  onChange={(e) => setEditData({ ...editData, role: e.target.value })}
                >
                  <option value="admin">Admin</option>
                  <option value="cashier">Cashier</option>
                  <option value="teacher">Teacher</option>
                  <option value="student">Student</option>
                  <option value="parent">Parent</option>
                </Form.Select>
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>Close</Button>
            <Button variant="primary" onClick={handleEditSubmit}>Save Changes</Button>
          </Modal.Footer>
        </Modal>
      </div>
    </div>
  );
}

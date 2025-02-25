import React, { useEffect, useState } from "react";
import axios from "axios";
import Table from "../../components/common/Table";

export default function ManageUsers() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axios.get("/api/users");
        setUsers(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchUsers();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Manage Users</h1>
      <Table
        data={users}
        columns={[
          { key: "id", label: "ID" },
          { key: "email", label: "Email" },
          { key: "role", label: "Role" },
        ]}
      />
    </div>
  );
}
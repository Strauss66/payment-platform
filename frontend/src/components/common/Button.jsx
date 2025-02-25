import React, { useEffect, useState } from "react";
import axios from "axios";
import Table from "../../components/common/Table";

export default function ViewAttendance() {
  const [attendance, setAttendance] = useState([]);

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const { data } = await axios.get("/api/teacher/attendance");
        setAttendance(data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchAttendance();
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Attendance Records</h2>
      <Table
        data={attendance}
        columns={[
          { key: "studentId", label: "Student ID" },
          { key: "date", label: "Date" },
          { key: "status", label: "Status" },
        ]}
      />
    </div>
  );
}
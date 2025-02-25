import React from "react";
import Card from "../../components/common/Card";

export default function TeacherDashboard() {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">Teacher Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card title="Classes Taught" content="5" />
        <Card title="Pending Assignments" content="10" />
        <Card title="Attendance to Review" content="2" />
      </div>
    </div>
  );
}
import React from "react";
import PageHeader from "../../components/ui/PageHeader";
import StatCard from "../../components/ui/StatCard";

export default function TeacherDashboard() {
  return (
    <div className="p-6">
      <div className="max-w-[1400px] mx-auto">
        <PageHeader title="Teacher Dashboard" />
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard title="Classes Taught" value={5} />
          <StatCard title="Pending Assignments" value={10} />
          <StatCard title="Attendance to Review" value={2} />
        </div>
      </div>
    </div>
  );
}
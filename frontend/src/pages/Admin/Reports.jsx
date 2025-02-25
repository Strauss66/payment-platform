import React, { useState } from "react";
import Button from "../../components/common/Button";

export default function Reports() {
  const [report, setReport] = useState(null);

  const generateReport = () => {
    // Some mock function
    setReport("Report Content: [Financial Data, Attendance, Grades...]");
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Generate Reports</h1>
      <Button onClick={generateReport} text="Generate Report" />
      {report && <div className="mt-4 border p-4">{report}</div>}
    </div>
  );
}
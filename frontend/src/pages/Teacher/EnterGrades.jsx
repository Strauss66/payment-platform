import React, { useState } from "react";
import axios from "axios";
import Button from "../../components/common/Button";

export default function EnterGrades() {
  const [studentId, setStudentId] = useState("");
  const [grade, setGrade] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async () => {
    try {
      await axios.post("/api/teacher/grades", { studentId, grade });
      setMessage("Grade submitted successfully");
    } catch (error) {
      setMessage("Failed to submit grade");
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Enter Grades</h2>
      <div className="mb-4">
        <label className="block mb-2">Student ID</label>
        <input
          className="border p-2 w-full"
          value={studentId}
          onChange={(e) => setStudentId(e.target.value)}
        />
      </div>
      <div className="mb-4">
        <label className="block mb-2">Grade</label>
        <input
          className="border p-2 w-full"
          value={grade}
          onChange={(e) => setGrade(e.target.value)}
        />
      </div>
      <Button text="Submit" onClick={handleSubmit} />
      {message && <div className="mt-2">{message}</div>}
    </div>
  );
}
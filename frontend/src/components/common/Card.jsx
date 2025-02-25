import React from "react";

export default function Card({ title, content }) {
  return (
    <div className="bg-white p-4 shadow rounded">
      <h3 className="font-bold text-lg mb-2">{title}</h3>
      <p className="text-gray-700">{content}</p>
    </div>
  );
}
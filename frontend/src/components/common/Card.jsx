import React from "react";

export default function Card({ title, content }) {
  return (
    <div className="bg-white p-6 shadow-lg rounded-lg border border-gray-200">
      <h3 className="font-bold text-xl mb-2 text-gray-800">{title}</h3>
      <p className="text-gray-600">{content}</p>
    </div>
  );
}
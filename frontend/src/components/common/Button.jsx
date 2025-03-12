import React from "react";

export default function Button({ label, onClick }) {
  return (
    <button
      onClick={onClick}
      className="bg-blue-500 text-white font-bold py-2 px-4 rounded transition duration-300 ease-in-out hover:bg-blue-700 hover:shadow-lg"
    >
      {label}
    </button>
  );
}
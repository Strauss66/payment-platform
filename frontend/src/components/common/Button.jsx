import React from "react";

export default function Button({ label, onClick }) {
  return (
    <button
      onClick={onClick}
      className="bg-white text-blue-500 font-bold py-2 px-4 rounded transition duration-300 ease-in-out hover:bg-blue-500 hover:text-white hover:shadow-lg"
    >
      {label}
    </button>
  );
}
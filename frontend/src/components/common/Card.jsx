import React from "react";

export default function Card({ title, content, style, onMouseEnter, onMouseLeave }) {
  return (
    <div 
      className="p-4 border rounded shadow-md transition duration-300 ease-in-out"
      style={style}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <h2 className="text-xl font-bold mb-2">{title}</h2>
      <p>{content}</p>
    </div>
  );
}
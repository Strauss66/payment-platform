import React from "react";
export default function Card({ title, children, footer }) {
  return (
    <div className="border rounded-xl p-4 bg-white shadow-sm">
      {title && <div className="mb-2 font-semibold">{title}</div>}
      <div>{children}</div>
      {footer && <div className="mt-3 text-sm text-gray-500">{footer}</div>}
    </div>
  );
}
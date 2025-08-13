import React from "react";
import { cls } from "../../lib/formatters";
export default function Button({ children, className="", ...props }) {
  return (
    <button
      className={cls("px-3 py-2 rounded-lg bg-gray-900 text-white hover:opacity-90 disabled:opacity-50", className)}
      {...props}
    >
      {children}
    </button>
  );
}
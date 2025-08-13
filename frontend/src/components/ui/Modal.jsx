import React from "react";
export default function Modal({ open, onClose, title, children, footer }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 grid place-items-center bg-black/40 z-50">
      <div className="w-full max-w-lg bg-white rounded-xl shadow-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="font-semibold">{title}</div>
          <button onClick={onClose} className="text-gray-500">✕</button>
        </div>
        <div>{children}</div>
        {footer && <div className="mt-3">{footer}</div>}
      </div>
    </div>
  );
}
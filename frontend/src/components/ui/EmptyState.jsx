import React from "react";
import Button from "./Button";
export default function EmptyState({ title="Nothing here yet", actionLabel, onAction }) {
  return (
    <div className="rounded border p-6 text-center text-gray-600 bg-gray-50">
      <div className="font-medium mb-2">{title}</div>
      {actionLabel && <Button onClick={onAction}>{actionLabel}</Button>}
    </div>
  );
}
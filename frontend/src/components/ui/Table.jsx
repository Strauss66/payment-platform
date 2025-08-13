import React from "react";
export function Table({ head, children }) {
  return (
    <div className="overflow-auto border rounded">
      <table className="min-w-full text-sm">
        {head}
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}
export function THead({ columns=[] }) {
  return (
    <thead className="bg-gray-50">
      <tr>{columns.map((c,i)=>(<th key={i} className={`p-2 ${c.right?'text-right':''}`}>{c.label}</th>))}</tr>
    </thead>
  );
}
export const TR = ({ children }) => <tr className="border-t hover:bg-gray-50">{children}</tr>;
export const TD = ({ children, right }) => <td className={`p-2 ${right?'text-right':''}`}>{children}</td>;

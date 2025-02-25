import React from "react";

export default function Table({ data, columns }) {
  return (
    <table className="min-w-full bg-white shadow">
      <thead>
        <tr>
          {columns.map((col) => (
            <th key={col.key} className="py-2 px-4 border-b border-gray-200 text-left">
              {col.label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((item) => (
          <tr key={item.id || Math.random()}>
            {columns.map((col) => (
              <td key={col.key} className="py-2 px-4 border-b border-gray-200">
                {item[col.key]}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
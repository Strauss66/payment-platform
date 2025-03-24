import React from "react";
import { Link, useLocation } from "react-router-dom";

export default function AdminNav() {
  const location = useLocation();

  const navLinks = [
    { name: "Manage Users", path: "/admin/users" },
    { name: "Late Fee Payers", path: "/admin/late-fee-payers" },
    { name: "Dashboard", path: "/admin/dashboard" },
  ];

  return (
    <nav className="bg-gray-800 text-white p-4 shadow-md">
      <ul className="flex justify-center gap-6 md:gap-8">
        {navLinks.map((link, index) => (
          <li key={index}>
            <Link
              to={link.path}
              className={`px-4 py-2 rounded transition ${
                location.pathname === link.path ? "bg-gray-700" : "hover:bg-gray-700"
              }`}
            >
              {link.name}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

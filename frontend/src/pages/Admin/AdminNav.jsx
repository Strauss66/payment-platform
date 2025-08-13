// src/components/layout/AdminNav.jsx
import React from "react";
import { NavLink } from "react-router-dom";
export default function AdminNav(){
  return (
    <nav className="flex flex-col gap-2">
      <NavLink to="/app" end>Dashboard</NavLink>
      <div className="mt-2 text-xs uppercase text-gray-500">Billing</div>
      <NavLink to="/app/billing/invoices">Invoices</NavLink>
      <NavLink to="/app/billing/payments">Payments</NavLink>
      <NavLink to="/app/billing/late-fees">Late Fees</NavLink>
      <div className="mt-2 text-xs uppercase text-gray-500">People</div>
      <NavLink to="/app/people/users">Users</NavLink>
      <NavLink to="/app/people/roles">Roles</NavLink>
      <NavLink to="/app/people/students">Students</NavLink>
    </nav>
  );
}
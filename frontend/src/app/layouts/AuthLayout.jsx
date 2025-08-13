import React from "react";
import { Outlet } from "react-router-dom";

export default function AuthLayout() {
  return (
    <div className="min-h-screen grid place-items-center bg-gray-50">
      <div className="w-full max-w-md bg-white border rounded-xl p-6 shadow-sm">
        <Outlet />
      </div>
    </div>
  );
}
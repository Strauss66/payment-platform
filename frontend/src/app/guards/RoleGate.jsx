import React from "react";
import { useAuth } from "../../contexts/AuthContext";

export default function RoleGate({ roles, children }) {
  const { user } = useAuth();
  const allowed = roles?.some((r) => user?.roles?.includes(r));
  if (!allowed) return <div className="p-6">You do not have access.</div>;
  return children;
}
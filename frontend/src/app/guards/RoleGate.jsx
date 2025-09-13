import React from "react";
import { useAuth } from "../../contexts/AuthContext";
import NotAuthorized from "../../components/NotAuthorized";

export default function RoleGate({ roles, allow, children }) {
  const { user } = useAuth();
  const list = allow || roles;
  const allowed = list?.some((r) => user?.roles?.includes(r));
  if (!allowed) return <div className="p-6"><NotAuthorized /></div>;
  return children;
}
import React from "react";
import { useAuth } from "../../contexts/AuthContext";

export default function RoleGate({ roles, children }: { roles: string[]; children: React.ReactNode }) {
  const { user } = useAuth();
  if (!user) return null;
  const hasRole = user.roles.some((r) => roles.includes(r));
  return hasRole ? <>{children}</> : null;
}
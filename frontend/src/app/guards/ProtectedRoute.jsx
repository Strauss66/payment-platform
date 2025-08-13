import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { ROUTES } from "../../lib/routes";

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="p-6">Loading…</div>;
  if (!user) return <Navigate to={ROUTES.LOGIN} replace />;
  return children;
}
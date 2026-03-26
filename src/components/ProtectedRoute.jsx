import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { getUserFromToken } from "../services/api.js";

export default function ProtectedRoute({ requiredRole }) {
  const user = getUserFromToken();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}


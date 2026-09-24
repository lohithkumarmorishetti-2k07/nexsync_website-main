import { Fragment } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { canViewAdmin } from "@/utils/rbac";

function RouteGuard({ authenticated, user, element }) {
  const location = useLocation();
  const path = location.pathname;

  // 1. Always allow public routes without authentication
  const isPublicRoute =
    path === "/" ||
    path === "/events" ||
    path === "/team" ||
    path === "/projects" ||
    path.startsWith("/events") ||
    path.startsWith("/team") ||
    path.startsWith("/projects") ||
    path === "/auth";

  // 2. Admin routes require authentication and appropriate role/permissions
  if (path.startsWith("/admin")) {
    if (!authenticated) {
      return <Navigate to="/auth" state={{ from: location }} replace />;
    }
    if (!canViewAdmin(user)) {
      return <Navigate to="/" replace />;
    }
    return <Fragment>{element}</Fragment>;
  }

  // 3. For public routes, render directly
  if (isPublicRoute) {
    return <Fragment>{element}</Fragment>;
  }

  // 4. Default fallback: allow element
  return <Fragment>{element}</Fragment>;
}

export default RouteGuard;

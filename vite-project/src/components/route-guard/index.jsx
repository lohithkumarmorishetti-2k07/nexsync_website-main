import { Fragment } from "react";
import { Navigate, useLocation } from "react-router-dom";

function RouteGuard({ authenticated, user, element }) {
  const location = useLocation();

  console.log("🛡️ RouteGuard checking route:", location.pathname);
  console.log("   authenticated:", authenticated);
  console.log("   user role:", user?.role);

  // Allow access to /auth page regardless of authentication status
  if (location.pathname === "/auth" || location.pathname.includes("/auth")) {
    console.log("   ✓ Allowing /auth access");
    return <Fragment>{element}</Fragment>;
  }

  // Redirect to /auth if not authenticated and trying to access protected routes
  if (!authenticated) {
    console.log("   ⛔ Redirecting to /auth (not authenticated)");
    return <Navigate to="/auth" />;
  }

  // If authenticated and not admin, redirect away from admin routes
  if (
    authenticated &&
    user?.role !== "admin" &&
    location.pathname.includes("/admin")
  ) {
    console.log("   ⛔ Redirecting to / (not admin)");
    return <Navigate to="/" />;
  }

  // If authenticated admin, redirect to /admin if trying to access student routes
  if (
    authenticated &&
    user?.role === "admin" &&
    (location.pathname === "/" || location.pathname.includes("/apply"))
  ) {
    console.log("   ⛔ Redirecting to /admin (admin accessing student routes)");
    return <Navigate to="/admin" />;
  }

  console.log("   ✓ Allowing access to route");
  return <Fragment>{element}</Fragment>;
}

export default RouteGuard;

import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../auth/AuthContext.jsx";

export function ProtectedRoute({ role }) {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) return <Navigate to="/login" replace />;

  if (
    user.role === "voluntario" &&
    user.mustChangePassword &&
    location.pathname !== "/trocar-senha"
  )
    return <Navigate to="/trocar-senha" replace />;

  if (role && user.role !== role)
    return (
      <Navigate to={user.role === "admin" ? "/app" : "/portal"} replace />
    );

  return <Outlet />;
}

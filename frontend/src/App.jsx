import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./auth/AuthContext.jsx";
import { ProtectedRoute } from "./components/ProtectedRoute.jsx";
import { Layout } from "./components/Layout.jsx";
import { Login } from "./pages/Login.jsx";
import { Dashboard } from "./pages/admin/Dashboard.jsx";
import { Volunteers } from "./pages/admin/Volunteers.jsx";
import { Workshops } from "./pages/admin/Workshops.jsx";
import { Documents } from "./pages/admin/Documents.jsx";
import { History } from "./pages/admin/History.jsx";
import { VolunteerPortal } from "./pages/volunteer/VolunteerPortal.jsx";
import { ChangePassword } from "./pages/volunteer/ChangePassword.jsx";

function Home() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={user.role === "admin" ? "/app" : "/portal"} replace />;
}

export function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route element={<ProtectedRoute role="admin" />}>
        <Route path="/app" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="voluntarios" element={<Volunteers />} />
          <Route path="oficinas" element={<Workshops />} />
          <Route path="documentos" element={<Documents />} />
          <Route path="historico" element={<History />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute role="voluntario" />}>
        <Route path="/portal" element={<VolunteerPortal />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route path="/trocar-senha" element={<ChangePassword />} />
      </Route>

      <Route path="*" element={<Home />} />
    </Routes>
  );
}

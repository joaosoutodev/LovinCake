// src/components/ProtectedRoute.jsx
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children, requireRole }) {
  const { user, profile, loading } = useAuth();
  const location = useLocation();

  // Evita "flicker" enquanto auth ainda carrega
  if (loading) {
    return (
      <div className="d-flex justify-content-center py-5">
        <div className="spinner-border" role="status" aria-label="Loading…" />
      </div>
    );
  }

  // Não autenticado → manda para login guardando destino
  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // Se precisa de role específica (ex.: "admin")
  if (requireRole && profile?.role !== requireRole) {
    return <Navigate to="/" replace />;
  }

  return children;
}

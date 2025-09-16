import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";

export default function DemoBanner() {
  const { user, profile } = useAuth();
  const isDemo =
    profile?.role?.toLowerCase?.() === "demo" ||
    (import.meta.env.VITE_DEMO_EMAIL &&
      user?.email === import.meta.env.VITE_DEMO_EMAIL);

  if (!isDemo) return null;

  return (
    <div className="alert alert-warning d-flex align-items-center justify-content-between mb-4">
      <div>
        <strong>Demo mode:</strong> Read-only in Demo-mode. You can still look
        into the{" "}
        <Link to="/dashboard" className="alert-link">
          Dashboard
        </Link>{" "}
        &{" "}
        <Link to="/orders" className="alert-link">
          Last Orders
        </Link>
        .
      </div>
      <span className="badge text-bg-dark">READ-ONLY</span>
    </div>
  );
}

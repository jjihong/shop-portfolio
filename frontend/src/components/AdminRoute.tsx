import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function AdminRoute({ children }: { children: React.ReactNode }) {
  const { isLoggedIn, role } = useAuth();

  if (!isLoggedIn || role !== "admin") {
    return <Navigate to="/products" replace />;
  }

  return <>{children}</>;
}

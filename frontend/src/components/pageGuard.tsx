
import { Navigate } from "react-router-dom";

export function PageGuard({ children }: { children: React.ReactElement }) {
  const token = localStorage.getItem("token");
  if (!token) return <Navigate to="/login" replace />;
  return children;
}
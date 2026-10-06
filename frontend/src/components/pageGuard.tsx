
import { Navigate } from "react-router-dom";

export function PageGuard({ children }: { children: React.ReactElement }) {
  // must match what login.tsx / signup.tsx actually write
  const token = sessionStorage.getItem("token");
  if (!token) return <Navigate to="/login" replace />;
  return children;
}
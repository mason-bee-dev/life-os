import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "./AuthProvider";

function LoadingScreen() {
  return (
    <div className="grid h-screen place-items-center bg-background text-sm text-muted-foreground">
      Đang tải…
    </div>
  );
}

/** Blocks all child routes until the user is authenticated. */
export function RequireAuth() {
  const { session, loading } = useAuth();

  if (loading) return <LoadingScreen />;
  if (!session) return <Navigate to="/login" replace />;

  return <Outlet />;
}

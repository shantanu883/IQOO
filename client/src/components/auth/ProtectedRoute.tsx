import { type ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Spinner } from "@/components/common/Spinner";

interface ProtectedRouteProps {
  children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, loading, user } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // Redirect to onboarding if user hasn't completed it
  if (user && !user.onboarded && location.pathname !== "/onboarding") {
    return <Navigate to="/onboarding" replace />;
  }

  // Redirect to home if user is on onboarding but already completed it
  if (user && user.onboarded && location.pathname === "/onboarding") {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

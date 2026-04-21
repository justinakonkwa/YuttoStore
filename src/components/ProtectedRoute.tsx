import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/store/auth";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

/**
 * Redirige vers /login si l'utilisateur n'est pas connecté.
 * Mémorise la page demandée pour y revenir après connexion.
 */
export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, initialized } = useAuth();
  const location = useLocation();

  // Attendre l'initialisation Firebase avant de décider
  if (!initialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-8 w-8 rounded-full border-2 border-accent border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

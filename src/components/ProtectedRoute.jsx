import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }) {

  const storedUser = localStorage.getItem("user");

  // Si pas connecté: redirection vers /login
  if (!storedUser) {
    return <Navigate to="/login" replace />;
  }

  // Sinon: afficher la page protégée
  return children;
}


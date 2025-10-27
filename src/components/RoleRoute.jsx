import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { getUserById } from "../api/userService";

export default function RoleRoute({ allowedRoles, children }) {
  const [authorized, setAuthorized] = useState(null);

  useEffect(() => {
    const checkRole = async () => {
      try {
        // Récupération de l'utilisateur depuis sessionStorage ou localStorage
        const userId =
          sessionStorage.getItem("userId") ||
          (() => {
            try {
              const stored = localStorage.getItem("user");
              if (stored) {
                const parsed = JSON.parse(stored);
                return parsed?.user?.id || parsed?.id || null;
              }
            } catch (err) {
              console.error("Erreur lecture user localStorage :", err);
            }
            return null;
          })();

        if (!userId) {
          setAuthorized(false);
          return;
        }

        // Vérifie le vrai rôle depuis la BDD
        const res = await getUserById(userId);
        const realRole = res.data?.role?.name?.toLowerCase() || "employee";

        // Autorisation
        setAuthorized(allowedRoles.includes(realRole));
      } catch (err) {
        console.error("Erreur vérification du rôle :", err);
        setAuthorized(false);
      }
    };

    checkRole();
  }, [allowedRoles]);

  if (authorized === null) {
    return (
      <div className="flex justify-center items-center h-screen text-gray-500">
        Vérification des droits...
      </div>
    );
  }

  if (!authorized) {
    // Redirige vers le dashboard si pas autorisé
    return <Navigate to="/" replace />;
  }

  return children;
}

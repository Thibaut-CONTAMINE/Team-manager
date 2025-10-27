import { useState, useEffect } from "react";
import { logoutUser } from "../api/authService"; // import de ton service d'API

export default function useAuth() {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("user");
    return saved ? JSON.parse(saved) : null;
  });

  const [token, setToken] = useState(() => localStorage.getItem("token"));

  // Login : enregistre token + user
  const login = (tokenValue, userData) => {
    localStorage.setItem("token", tokenValue);
    sessionStorage.setItem("userId", userData.user.id);
    localStorage.setItem("user", JSON.stringify(userData));
    setToken(tokenValue);
    setUser(userData);
  };

  // Logout : appelle l’API puis supprime localement
  const logout = async () => {
    try {
      await logoutUser(); // Appel API /logout
    } catch (error) {
      console.warn("Erreur lors de la déconnexion API :", error);
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setToken(null);
      setUser(null);
    }
  };

  // Sync automatique avec le localStorage
  useEffect(() => {
    const handleStorageChange = () => {
      const savedUser = localStorage.getItem("user");
      const savedToken = localStorage.getItem("token");
      setUser(savedUser ? JSON.parse(savedUser) : null);
      setToken(savedToken);
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // Retourne les infos essentielles
  return {
    isAuthenticated: !!token,
    user,
    role: user?.role?.name?.toLowerCase() || "employe", // rôle normalisé
    token,
    login,
    logout,
  };
}

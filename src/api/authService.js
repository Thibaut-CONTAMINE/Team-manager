import api from "./apiClient";

// Connexion classique via email/mot de passe
export const loginUser = (email, password) => {
  return api.post("/token", { email, password });
};

// Déconnexion via API
export const logoutUser = () => {
  return api.post("/logout");
};

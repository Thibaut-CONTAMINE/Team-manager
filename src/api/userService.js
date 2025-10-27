// src/api/userService.js
import api from "./apiClient";

// Fonction utilitaire pour récupérer le token
const getAuthHeader = () => {
  const token =
    sessionStorage.getItem("token") || localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const getAllUsers = () => api.get("/users", { headers: getAuthHeader() });
export const createUser = (data) => api.post("/users", data, { headers: getAuthHeader() });
export const updateUser = (id, data) => api.put(`/users/${id}`, data, { headers: getAuthHeader() });
export const deleteUser = (id) => api.delete(`/users/${id}`, { headers: getAuthHeader() });

// Récupère un utilisateur + ses relations (tâches, équipe…)
export const getUserById = (id) => api.get(`/users/${id}`, { headers: getAuthHeader() });

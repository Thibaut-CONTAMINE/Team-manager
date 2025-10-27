import axios from "axios";

// En local : Laravel tourne sur http://localhost:8000
// En Docker : remplace par http://backend:8000 si ton service s’appelle "backend"
const API_BASE_URL = import.meta.env.API_URL || "http://10.127.86.164:8000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Ajoute automatiquement le token JWT s’il existe
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Gère les erreurs globales
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn("Token expiré ou invalide — redirection vers login");
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;

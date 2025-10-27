import api from "./apiClient";

export const getAllRoles = () => api.get("/roles");
export const createRole = (data) => api.post("/roles", data);
export const deleteRole = (id) => api.delete(`/roles/${id}`);

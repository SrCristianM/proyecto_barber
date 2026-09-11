import { apiRequest } from "../../../../shared/api/apiClient.js";

const API_URL = "/api/users";

export async function getUsers(filters = {}) {
  const query = new URLSearchParams();
  if (filters.search) query.append("search", filters.search);
  if (filters.status && filters.status !== "all") query.append("status", filters.status);
  if (filters.role && filters.role !== "all") query.append("role", filters.role);
  const qs = query.toString() ? `?${query.toString()}` : "";
  return await apiRequest(`${API_URL}${qs}`);
}

export async function createUser(data) {
  return await apiRequest(API_URL, {
    method: "POST",
    body: JSON.stringify(data)
  });
}

export async function updateUser(id, data) {
  return await apiRequest(`${API_URL}/${id}`, {
    method: "PUT",
    body: JSON.stringify(data)
  });
}

export async function toggleUserStatus(id, estado) {
  return await apiRequest(`${API_URL}/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ estado })
  });
}

export async function deleteUser(id) {
  return await apiRequest(`${API_URL}/${id}`, {
    method: "DELETE"
  });
}

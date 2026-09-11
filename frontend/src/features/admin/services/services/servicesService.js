import { apiRequest } from "../../../../shared/api/apiClient.js";

const API_URL = "/api/services";

export async function getServices(filters = {}) {
  const query = new URLSearchParams();
  if (filters.search) query.append("search", filters.search);
  if (filters.status && filters.status !== "all") query.append("status", filters.status);
  if (filters.category && filters.category !== "all") query.append("category", filters.category);
  const qs = query.toString() ? `?${query.toString()}` : "";
  return await apiRequest(`${API_URL}${qs}`);
}

export async function getServiceCategories() {
  return await apiRequest(`${API_URL}/categories`);
}

export async function createService(data) {
  return await apiRequest(API_URL, {
    method: "POST",
    body: JSON.stringify(data)
  });
}

export async function updateService(id, data) {
  return await apiRequest(`${API_URL}/${id}`, {
    method: "PUT",
    body: JSON.stringify(data)
  });
}

export async function toggleServiceStatus(id) {
  return await apiRequest(`${API_URL}/${id}/status`, {
    method: "PATCH"
  });
}

export async function deleteService(id) {
  return await apiRequest(`${API_URL}/${id}`, {
    method: "DELETE"
  });
}

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

export async function getServiceCategories(filters = {}) {
  const query = new URLSearchParams();
  if (filters.status && filters.status !== "all") query.append("status", filters.status);
  const qs = query.toString() ? `?${query.toString()}` : "";
  return await apiRequest(`${API_URL}/categories${qs}`);
}

export async function createServiceCategory(data) {
  return await apiRequest(`${API_URL}/categories`, {
    method: "POST",
    body: JSON.stringify(data)
  });
}

export async function updateServiceCategory(id, data) {
  return await apiRequest(`${API_URL}/categories/${id}`, {
    method: "PUT",
    body: JSON.stringify(data)
  });
}

export async function toggleServiceCategoryStatus(id) {
  return await apiRequest(`${API_URL}/categories/${id}/status`, {
    method: "PATCH"
  });
}

export async function deleteServiceCategory(id) {
  return await apiRequest(`${API_URL}/categories/${id}`, {
    method: "DELETE"
  });
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

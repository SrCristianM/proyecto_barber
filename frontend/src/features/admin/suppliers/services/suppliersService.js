import { apiRequest } from "../../../../shared/api/apiClient.js";

const API_URL = "/api/suppliers";

export async function getSuppliers(filters = {}) {
  const query = new URLSearchParams();
  if (filters.search) query.append("search", filters.search);
  if (filters.status && filters.status !== "all") query.append("status", filters.status);
  const qs = query.toString() ? `?${query.toString()}` : "";
  return await apiRequest(`${API_URL}${qs}`);
}

export async function createSupplier(data) {
  return await apiRequest(API_URL, {
    method: "POST",
    body: JSON.stringify(data)
  });
}

export async function updateSupplier(id, data) {
  return await apiRequest(`${API_URL}/${id}`, {
    method: "PUT",
    body: JSON.stringify(data)
  });
}

export async function toggleSupplierStatus(id) {
  return await apiRequest(`${API_URL}/${id}/status`, {
    method: "PATCH"
  });
}

export async function deleteSupplier(id) {
  return await apiRequest(`${API_URL}/${id}`, {
    method: "DELETE"
  });
}

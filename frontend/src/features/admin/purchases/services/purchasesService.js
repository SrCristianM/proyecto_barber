import { apiRequest } from "../../../../shared/api/apiClient.js";

const API_URL = "/api/purchases";

export async function getPurchases(filters = {}) {
  const query = new URLSearchParams();
  if (filters.proveedor && filters.proveedor !== "all") query.append("proveedor", filters.proveedor);
  if (filters.estado && filters.estado !== "all") query.append("estado", filters.estado);
  if (filters.startDate) query.append("startDate", filters.startDate);
  if (filters.endDate) query.append("endDate", filters.endDate);
  const qs = query.toString() ? `?${query.toString()}` : "";
  return await apiRequest(`${API_URL}${qs}`);
}

export async function getPurchaseById(id) {
  return await apiRequest(`${API_URL}/${id}`);
}

export async function createPurchase(data) {
  return await apiRequest(API_URL, {
    method: "POST",
    body: JSON.stringify(data)
  });
}

export async function cancelPurchase(id) {
  return await apiRequest(`${API_URL}/${id}/cancel`, {
    method: "PATCH"
  });
}

export async function deletePurchase(id) {
  return await apiRequest(`${API_URL}/${id}`, {
    method: "DELETE"
  });
}

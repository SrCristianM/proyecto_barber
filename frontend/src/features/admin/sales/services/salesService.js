import { apiRequest } from "../../../../shared/api/apiClient.js";

const API_URL = "/api/sales";

export async function getSales(filters = {}) {
  const query = new URLSearchParams();
  if (filters.cliente && filters.cliente !== "all") query.append("cliente", filters.cliente);
  if (filters.estado && filters.estado !== "all") query.append("estado", filters.estado);
  if (filters.startDate) query.append("startDate", filters.startDate);
  if (filters.endDate) query.append("endDate", filters.endDate);
  const qs = query.toString() ? `?${query.toString()}` : "";
  return await apiRequest(`${API_URL}${qs}`);
}

export async function getSaleById(id) {
  return await apiRequest(`${API_URL}/${id}`);
}

export async function createSale(data) {
  return await apiRequest(API_URL, {
    method: "POST",
    body: JSON.stringify(data)
  });
}

export async function cancelSale(id) {
  return await apiRequest(`${API_URL}/${id}/cancel`, {
    method: "PATCH"
  });
}

export async function deleteSale(id) {
  return await apiRequest(`${API_URL}/${id}`, {
    method: "DELETE"
  });
}

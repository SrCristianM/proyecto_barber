import { apiRequest } from "../../../../shared/api/apiClient.js";

const API_URL = "/api/supplies";

export async function getSupplies(filters = {}) {
  const query = new URLSearchParams();
  if (filters.barberId && filters.barberId !== "all") query.append("barberId", filters.barberId);
  if (filters.status && filters.status !== "all") query.append("status", filters.status);
  if (filters.startDate) query.append("startDate", filters.startDate);
  if (filters.endDate) query.append("endDate", filters.endDate);
  const qs = query.toString() ? `?${query.toString()}` : "";
  return await apiRequest(`${API_URL}${qs}`);
}

export async function getSupplyById(id) {
  return await apiRequest(`${API_URL}/${id}`);
}

export async function createSupply(data) {
  return await apiRequest(API_URL, {
    method: "POST",
    body: JSON.stringify(data)
  });
}

export async function cancelSupply(id) {
  return await apiRequest(`${API_URL}/${id}/anular`, {
    method: "PATCH"
  });
}

export async function deleteSupply(id) {
  return await apiRequest(`${API_URL}/${id}`, {
    method: "DELETE"
  });
}

export async function getSuppliesMetrics(params = {}) {
  const query = new URLSearchParams();
  if (params.barberId) query.append("barberId", params.barberId);
  if (params.period) query.append("period", params.period);
  const qs = query.toString() ? `?${query.toString()}` : "";
  return await apiRequest(`${API_URL}/metrics${qs}`);
}

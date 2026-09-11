import { apiRequest } from "../../../../shared/api/apiClient.js";

const API_URL = "/api/clients";

export async function getClients(filters = {}) {
  const query = new URLSearchParams();
  if (filters.search) query.append("search", filters.search);
  if (filters.status && filters.status !== "all") query.append("status", filters.status);
  if (filters.fidelity && filters.fidelity !== "all") query.append("fidelity", filters.fidelity);
  const qs = query.toString() ? `?${query.toString()}` : "";
  return await apiRequest(`${API_URL}${qs}`);
}

export async function createClient(data) {
  return await apiRequest(API_URL, {
    method: "POST",
    body: JSON.stringify(data)
  });
}

export async function updateClient(id, data) {
  return await apiRequest(`${API_URL}/${id}`, {
    method: "PUT",
    body: JSON.stringify(data)
  });
}

export async function toggleClientStatus(id) {
  return await apiRequest(`${API_URL}/${id}/status`, {
    method: "PATCH"
  });
}

export async function deleteClient(id) {
  return await apiRequest(`${API_URL}/${id}`, {
    method: "DELETE"
  });
}

import { apiRequest } from "../../../../shared/api/apiClient.js";

const API_URL = "/api/appointments";

export async function getAppointments(filters = {}) {
  const query = new URLSearchParams();
  if (filters.fecha) query.append("fecha", filters.fecha);
  if (filters.barbero && filters.barbero !== "all") query.append("barbero", filters.barbero);
  if (filters.cliente && filters.cliente !== "all") query.append("cliente", filters.cliente);
  if (filters.estado && filters.estado !== "all") query.append("estado", filters.estado);
  const qs = query.toString() ? `?${query.toString()}` : "";
  return await apiRequest(`${API_URL}${qs}`);
}

export async function createAppointment(data) {
  return await apiRequest(API_URL, {
    method: "POST",
    body: JSON.stringify(data)
  });
}

export async function updateAppointment(id, data) {
  return await apiRequest(`${API_URL}/${id}`, {
    method: "PUT",
    body: JSON.stringify(data)
  });
}

export async function updateAppointmentStatus(id, estado) {
  return await apiRequest(`${API_URL}/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ estado })
  });
}

export async function deleteAppointment(id) {
  return await apiRequest(`${API_URL}/${id}`, {
    method: "DELETE"
  });
}

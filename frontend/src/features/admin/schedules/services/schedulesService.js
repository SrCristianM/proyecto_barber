import { apiRequest } from "../../../../shared/api/apiClient.js";

const API_URL = "/api/schedules";

export async function getSchedules(barberId = null) {
  const qs = barberId ? `?barbero=${barberId}` : "";
  return await apiRequest(`${API_URL}${qs}`);
}

export async function getBarberAvailability(barberId, date) {
  return await apiRequest(`${API_URL}/availability?id_barbero=${barberId}&fecha=${date}`);
}

export async function createSchedule(data) {
  return await apiRequest(API_URL, {
    method: "POST",
    body: JSON.stringify(data)
  });
}

export async function updateSchedule(id, data) {
  return await apiRequest(`${API_URL}/${id}`, {
    method: "PUT",
    body: JSON.stringify(data)
  });
}

export async function toggleScheduleStatus(id) {
  return await apiRequest(`${API_URL}/${id}/status`, {
    method: "PATCH"
  });
}

export async function deleteSchedule(id) {
  return await apiRequest(`${API_URL}/${id}`, {
    method: "DELETE"
  });
}

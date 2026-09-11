import { apiRequest } from "../../../../shared/api/apiClient.js";

const API_URL = "/api/roles";

export async function getRoles() {
  return await apiRequest(API_URL);
}

export async function getRoleById(id) {
  return await apiRequest(`${API_URL}/${id}`);
}

export async function getPermissionMatrix() {
  return await apiRequest(`${API_URL}/modules/matrix`);
}

export async function updateRolePermissions(id, permisos) {
  return await apiRequest(`${API_URL}/${id}/permissions`, {
    method: "PUT",
    body: JSON.stringify({ permisos })
  });
}

export async function createRole(data) {
  return await apiRequest(API_URL, {
    method: "POST",
    body: JSON.stringify(data)
  });
}

export async function updateRole(id, data) {
  return await apiRequest(`${API_URL}/${id}`, {
    method: "PUT",
    body: JSON.stringify(data)
  });
}

export async function deleteRole(id) {
  return await apiRequest(`${API_URL}/${id}`, {
    method: "DELETE"
  });
}

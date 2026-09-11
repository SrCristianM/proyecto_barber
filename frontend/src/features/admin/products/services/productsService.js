import { apiRequest } from "../../../../shared/api/apiClient.js";

const API_URL = "/api/products";

export async function getProducts(filters = {}) {
  const query = new URLSearchParams();
  if (filters.search) query.append("search", filters.search);
  if (filters.status && filters.status !== "all") query.append("status", filters.status);
  if (filters.category && filters.category !== "all") query.append("category", filters.category);
  const qs = query.toString() ? `?${query.toString()}` : "";
  return await apiRequest(`${API_URL}${qs}`);
}

export async function getProductCategories() {
  return await apiRequest(`${API_URL}/categories`);
}

export async function createProduct(data) {
  return await apiRequest(API_URL, {
    method: "POST",
    body: JSON.stringify(data)
  });
}

export async function updateProduct(id, data) {
  return await apiRequest(`${API_URL}/${id}`, {
    method: "PUT",
    body: JSON.stringify(data)
  });
}

export async function toggleProductStatus(id) {
  return await apiRequest(`${API_URL}/${id}/status`, {
    method: "PATCH"
  });
}

export async function deleteProduct(id) {
  return await apiRequest(`${API_URL}/${id}`, {
    method: "DELETE"
  });
}

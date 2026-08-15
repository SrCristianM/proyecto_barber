/**
 * Servicio de acceso a datos para el módulo de clients.
 *
 * Actualmente el hook useClients (en ../hooks) consume datos mock
 * directamente porque el proyecto todavía no está conectado a un backend.
 * Cuando exista la API real, las funciones de este archivo deben
 * reemplazar los mocks del hook, manteniendo la misma forma de datos
 * que ya consumen los componentes de este módulo.
 */

const API_URL = "/api/clients";

export async function getClients() {
  const res = await fetch(API_URL);
  if (!res.ok) throw new Error("Error al obtener clients");
  return res.json();
}

export async function createClient(data) {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error("Error al crear Client");
  return res.json();
}

export async function updateClient(id, data) {
  const res = await fetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error("Error al actualizar Client");
  return res.json();
}

export async function deleteClient(id) {
  const res = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Error al eliminar Client");
  return true;
}

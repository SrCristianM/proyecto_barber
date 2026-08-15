/**
 * Servicio de acceso a datos para el módulo de roles.
 *
 * Actualmente el hook useRoles (en ../hooks) consume datos mock
 * directamente porque el proyecto todavía no está conectado a un backend.
 * Cuando exista la API real, las funciones de este archivo deben
 * reemplazar los mocks del hook, manteniendo la misma forma de datos
 * que ya consumen los componentes de este módulo.
 */

const API_URL = "/api/roles";

export async function getRoles() {
  const res = await fetch(API_URL);
  if (!res.ok) throw new Error("Error al obtener roles");
  return res.json();
}

export async function createRole(data) {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error("Error al crear Role");
  return res.json();
}

export async function updateRole(id, data) {
  const res = await fetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error("Error al actualizar Role");
  return res.json();
}

export async function deleteRole(id) {
  const res = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Error al eliminar Role");
  return true;
}

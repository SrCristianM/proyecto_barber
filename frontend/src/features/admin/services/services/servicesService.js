/**
 * Servicio de acceso a datos para el módulo de services.
 *
 * Actualmente el hook useServices (en ../hooks) consume datos mock
 * directamente porque el proyecto todavía no está conectado a un backend.
 * Cuando exista la API real, las funciones de este archivo deben
 * reemplazar los mocks del hook, manteniendo la misma forma de datos
 * que ya consumen los componentes de este módulo.
 */

const API_URL = "/api/services";

export async function getServices() {
  const res = await fetch(API_URL);
  if (!res.ok) throw new Error("Error al obtener services");
  return res.json();
}

export async function createService(data) {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error("Error al crear Service");
  return res.json();
}

export async function updateService(id, data) {
  const res = await fetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error("Error al actualizar Service");
  return res.json();
}

export async function deleteService(id) {
  const res = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Error al eliminar Service");
  return true;
}

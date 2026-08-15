/**
 * Servicio de acceso a datos para el módulo de barbers.
 *
 * Actualmente el hook useBarbers (en ../hooks) consume datos mock
 * directamente porque el proyecto todavía no está conectado a un backend.
 * Cuando exista la API real, las funciones de este archivo deben
 * reemplazar los mocks del hook, manteniendo la misma forma de datos
 * que ya consumen los componentes de este módulo.
 */

const API_URL = "/api/barbers";

export async function getBarbers() {
  const res = await fetch(API_URL);
  if (!res.ok) throw new Error("Error al obtener barbers");
  return res.json();
}

export async function createBarber(data) {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error("Error al crear Barber");
  return res.json();
}

export async function updateBarber(id, data) {
  const res = await fetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error("Error al actualizar Barber");
  return res.json();
}

export async function deleteBarber(id) {
  const res = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Error al eliminar Barber");
  return true;
}

/**
 * Servicio de acceso a datos para el módulo de schedules.
 *
 * Actualmente el hook useSchedules (en ../hooks) consume datos mock
 * directamente porque el proyecto todavía no está conectado a un backend.
 * Cuando exista la API real, las funciones de este archivo deben
 * reemplazar los mocks del hook, manteniendo la misma forma de datos
 * que ya consumen los componentes de este módulo.
 */

const API_URL = "/api/schedules";

export async function getSchedules() {
  const res = await fetch(API_URL);
  if (!res.ok) throw new Error("Error al obtener schedules");
  return res.json();
}

export async function createSchedule(data) {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error("Error al crear Schedule");
  return res.json();
}

export async function updateSchedule(id, data) {
  const res = await fetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error("Error al actualizar Schedule");
  return res.json();
}

export async function deleteSchedule(id) {
  const res = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Error al eliminar Schedule");
  return true;
}

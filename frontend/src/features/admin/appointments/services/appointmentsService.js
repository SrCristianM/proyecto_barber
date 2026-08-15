/**
 * Servicio de acceso a datos para el módulo de appointments.
 *
 * Actualmente el hook useAppointments (en ../hooks) consume datos mock
 * directamente porque el proyecto todavía no está conectado a un backend.
 * Cuando exista la API real, las funciones de este archivo deben
 * reemplazar los mocks del hook, manteniendo la misma forma de datos
 * que ya consumen los componentes de este módulo.
 */

const API_URL = "/api/appointments";

export async function getAppointments() {
  const res = await fetch(API_URL);
  if (!res.ok) throw new Error("Error al obtener appointments");
  return res.json();
}

export async function createAppointment(data) {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error("Error al crear Appointment");
  return res.json();
}

export async function updateAppointment(id, data) {
  const res = await fetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error("Error al actualizar Appointment");
  return res.json();
}

export async function deleteAppointment(id) {
  const res = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Error al eliminar Appointment");
  return true;
}

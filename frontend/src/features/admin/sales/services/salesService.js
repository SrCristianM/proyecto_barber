/**
 * Servicio de acceso a datos para el módulo de sales.
 *
 * Actualmente el hook useSales (en ../hooks) consume datos mock
 * directamente porque el proyecto todavía no está conectado a un backend.
 * Cuando exista la API real, las funciones de este archivo deben
 * reemplazar los mocks del hook, manteniendo la misma forma de datos
 * que ya consumen los componentes de este módulo.
 */

const API_URL = "/api/sales";

export async function getSales() {
  const res = await fetch(API_URL);
  if (!res.ok) throw new Error("Error al obtener sales");
  return res.json();
}

export async function createSale(data) {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error("Error al crear Sale");
  return res.json();
}

export async function updateSale(id, data) {
  const res = await fetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error("Error al actualizar Sale");
  return res.json();
}

export async function deleteSale(id) {
  const res = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Error al eliminar Sale");
  return true;
}

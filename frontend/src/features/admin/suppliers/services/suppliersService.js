/**
 * Servicio de acceso a datos para el módulo de Proveedores.
 * Estructura basada en la tabla `proveedor` de barberia_db.
 */

const API_URL = "/api/suppliers";

export async function getSuppliers() {
  const res = await fetch(API_URL);
  if (!res.ok) throw new Error("Error al obtener proveedores");
  return res.json();
}

export async function createSupplier(data) {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error("Error al crear proveedor");
  return res.json();
}

export async function updateSupplier(id, data) {
  const res = await fetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error("Error al actualizar proveedor");
  return res.json();
}

export async function deleteSupplier(id) {
  const res = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Error al eliminar proveedor");
  return true;
}

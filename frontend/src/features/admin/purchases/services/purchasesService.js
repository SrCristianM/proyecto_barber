/**
 * Servicio de acceso a datos para el módulo de Compras.
 * Estructura basada en las tablas `compra` y `detalle_compra` de barberia_db.
 */

const API_URL = "/api/purchases";

export async function getPurchases() {
  const res = await fetch(API_URL);
  if (!res.ok) throw new Error("Error al obtener compras");
  return res.json();
}

export async function createPurchase(data) {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error("Error al crear compra");
  return res.json();
}

export async function updatePurchase(id, data) {
  const res = await fetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error("Error al actualizar compra");
  return res.json();
}

export async function deletePurchase(id) {
  const res = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Error al eliminar compra");
  return true;
}

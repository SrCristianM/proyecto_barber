import { apiRequest } from "../../../../shared/api/apiClient.js";
import { notifyDataChange, SYNC_ENTITIES } from "../../../../shared/services/dataSyncService.js";

const BASE_URL = "/api/inventory-stations";

// ==========================================
// ESTACIONES Y MODELO SEMÁFORO
// ==========================================
export async function getAllStations(filters = {}) {
  const query = new URLSearchParams();
  if (filters.barberId && filters.barberId !== "all") query.append("barbero_id", filters.barberId);
  if (filters.status && filters.status !== "all") query.append("estado_semaforo", filters.status);
  if (filters.search) query.append("search", filters.search);
  const qs = query.toString() ? `?${query.toString()}` : "";
  return await apiRequest(`${BASE_URL}/stations${qs}`);
}

export async function getMyStation(barberId = null) {
  let id = barberId;
  if (!id && typeof window !== "undefined") {
    try {
      const rawUser = localStorage.getItem("barber_current_user");
      if (rawUser) {
        const u = JSON.parse(rawUser);
        id = u.id_barbero || (Number(u.id_rol) === 3 ? (Number(u.id_usuario) === 4 ? 1 : (Number(u.id_usuario) === 12 ? 2 : (Number(u.id_usuario) === 13 ? 3 : null))) : null);
      }
    } catch {}
  }
  const qs = id ? `?barbero_id=${id}` : "";
  try {
    const res = await apiRequest(`${BASE_URL}/my-station${qs}`);
    const list = Array.isArray(res) ? res : res?.data;
    if (Array.isArray(list) && list.length > 0 && typeof window !== "undefined") {
      try {
        localStorage.setItem(`station_supplies_cache_${id || "default"}`, JSON.stringify(list));
      } catch {}
    }
    return res;
  } catch (err) {
    if (typeof window !== "undefined") {
      try {
        const cached = localStorage.getItem(`station_supplies_cache_${id || "default"}`) || localStorage.getItem("station_supplies_cache_default");
        if (cached) {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length > 0) {
            console.warn("[StationService] Servidor inaccesible temporalmente, usando caché local:", err.message);
            return parsed;
          }
        }
      } catch {}
    }
    throw err;
  }
}

export async function assignStationItem(data) {
  const res = await apiRequest(`${BASE_URL}/stations`, {
    method: "POST",
    body: JSON.stringify(data)
  });
  notifyDataChange(SYNC_ENTITIES.STATION_SUPPLIES, res);
  return res;
}

export async function updateStationItemStatus(idEstacionInsumo, estado_semaforo, notas = "", cantidad_asignada = undefined) {
  const payload = { estado_semaforo, notas };
  if (cantidad_asignada !== undefined) {
    payload.cantidad_asignada = cantidad_asignada;
    payload.cantidad_actual = cantidad_asignada;
  }
  const res = await apiRequest(`${BASE_URL}/stations/${idEstacionInsumo}/status`, {
    method: "PATCH",
    body: JSON.stringify(payload)
  });
  notifyDataChange(SYNC_ENTITIES.STATION_SUPPLIES, res);
  return res;
}

export async function requestRestockBatch(items, observaciones = "") {
  const res = await apiRequest(`${BASE_URL}/stations/request-restock`, {
    method: "POST",
    body: JSON.stringify({ items, observaciones })
  });
  notifyDataChange(SYNC_ENTITIES.STATION_SUPPLIES, res);
  return res;
}

export async function approveRestock(idEstacionInsumo, cantidad_entregada = 1, observaciones = "") {
  const res = await apiRequest(`${BASE_URL}/stations/${idEstacionInsumo}/reponer`, {
    method: "POST",
    body: JSON.stringify({ cantidad_entregada, observaciones })
  });
  notifyDataChange(SYNC_ENTITIES.STATION_SUPPLIES, res);
  notifyDataChange(SYNC_ENTITIES.WAREHOUSE_ITEMS, res);
  notifyDataChange(SYNC_ENTITIES.SUPPLIES, res);
  return res;
}

export async function removeStationItem(idEstacionInsumo) {
  const res = await apiRequest(`${BASE_URL}/stations/${idEstacionInsumo}`, {
    method: "DELETE"
  });
  notifyDataChange(SYNC_ENTITIES.STATION_SUPPLIES, res);
  return res;
}

// ==========================================
// BODEGA GENERAL
// ==========================================
export async function getWarehouseItems(filters = {}) {
  const query = new URLSearchParams();
  if (filters.search) query.append("search", filters.search);
  if (filters.categoria && filters.categoria !== "all") query.append("categoria", filters.categoria);
  if (filters.proveedor_id) query.append("proveedor_id", filters.proveedor_id);
  if (filters.lowStockOnly) query.append("lowStockOnly", "true");
  const qs = query.toString() ? `?${query.toString()}` : "";
  return await apiRequest(`${BASE_URL}/warehouse${qs}`);
}

export async function createWarehouseItem(data) {
  const res = await apiRequest(`${BASE_URL}/warehouse`, {
    method: "POST",
    body: JSON.stringify(data)
  });
  notifyDataChange(SYNC_ENTITIES.WAREHOUSE_ITEMS, res);
  return res;
}

export async function updateWarehouseItem(id, data) {
  const res = await apiRequest(`${BASE_URL}/warehouse/${id}`, {
    method: "PUT",
    body: JSON.stringify(data)
  });
  notifyDataChange(SYNC_ENTITIES.WAREHOUSE_ITEMS, res);
  return res;
}

export async function deleteWarehouseItem(id) {
  const res = await apiRequest(`${BASE_URL}/warehouse/${id}`, {
    method: "DELETE"
  });
  notifyDataChange(SYNC_ENTITIES.WAREHOUSE_ITEMS, res);
  return res;
}

export async function getWarehouseMovements(params = {}) {
  const query = new URLSearchParams();
  if (params.idInsumo && params.idInsumo !== "all") query.append("id_insumo", params.idInsumo);
  if (params.tipoMovimiento && params.tipoMovimiento !== "all") query.append("tipo_movimiento", params.tipoMovimiento);
  if (params.search) query.append("search", params.search);
  if (params.limit) query.append("limit", params.limit);

  const url = `${BASE_URL}/warehouse/movements${query.toString() ? `?${query.toString()}` : ""}`;
  return await apiRequest(url);
}

// ==========================================
// ENTRADAS DE MERCANCÍA (PROVEEDORES -> BODEGA)
// ==========================================
export async function registerStockEntry(data) {
  const res = await apiRequest(`${BASE_URL}/warehouse/entries`, {
    method: "POST",
    body: JSON.stringify(data)
  });
  notifyDataChange(SYNC_ENTITIES.WAREHOUSE_ITEMS, res);
  return res;
}

export async function getStockEntries(filters = {}) {
  const query = new URLSearchParams();
  if (filters.insumo_id) query.append("insumo_id", filters.insumo_id);
  if (filters.proveedor_id) query.append("proveedor_id", filters.proveedor_id);
  const qs = query.toString() ? `?${query.toString()}` : "";
  return await apiRequest(`${BASE_URL}/warehouse/entries${qs}`);
}

export async function cancelStockEntry(idEntrada, motivo) {
  const res = await apiRequest(`${BASE_URL}/warehouse/entries/${idEntrada}/cancel`, {
    method: "POST",
    body: JSON.stringify({ motivo })
  });
  notifyDataChange(SYNC_ENTITIES.WAREHOUSE_ITEMS, res);
  return res;
}


// ==========================================
// PROVEEDORES
// ==========================================
export async function getStationSuppliers(filters = {}) {
  const query = new URLSearchParams();
  if (filters.search) query.append("search", filters.search);
  const qs = query.toString() ? `?${query.toString()}` : "";
  return await apiRequest(`${BASE_URL}/suppliers${qs}`);
}

// ==========================================
// HISTORIAL Y MÉTRICAS
// ==========================================
export async function getPerformanceMetrics(barberId = null) {
  const qs = barberId && barberId !== "all" ? `?barbero_id=${barberId}` : "";
  return await apiRequest(`${BASE_URL}/metrics${qs}`);
}

export async function getRestockHistory(filters = {}) {
  const query = new URLSearchParams();
  if (filters.barberId && filters.barberId !== "all") query.append("barbero_id", filters.barberId);
  if (filters.insumoId && filters.insumoId !== "all") query.append("insumo_id", filters.insumoId);
  const qs = query.toString() ? `?${query.toString()}` : "";
  return await apiRequest(`${BASE_URL}/history${qs}`);
}

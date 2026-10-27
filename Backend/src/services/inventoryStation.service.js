import { InventoryStationRepository } from "../models/inventoryStation.model.js";
import { ApiError } from "../errors/apiError.js";
import { logger } from "../utils/logger.js";

export class InventoryStationService {
  // ==========================================
  // GESTIÓN DE PROVEEDORES
  // ==========================================
  static async getSuppliers(filters = {}) {
    return await InventoryStationRepository.getSuppliers(filters);
  }

  static async getSupplierById(id) {
    const supplier = await InventoryStationRepository.findSupplierById(id);
    if (!supplier) {
      throw ApiError.notFound("Proveedor no encontrado.");
    }
    return supplier;
  }

  static async createSupplier(data) {
    if (!data.nombre || !data.nombre.trim()) {
      throw ApiError.badRequest("El nombre del proveedor es obligatorio.");
    }
    const newId = await InventoryStationRepository.createSupplier(data);
    return await InventoryStationRepository.findSupplierById(newId);
  }

  static async updateSupplier(id, data) {
    const existing = await InventoryStationRepository.findSupplierById(id);
    if (!existing) {
      throw ApiError.notFound("Proveedor no encontrado.");
    }
    await InventoryStationRepository.updateSupplier(id, data);
    return await InventoryStationRepository.findSupplierById(id);
  }

  static async deleteSupplier(id) {
    const existing = await InventoryStationRepository.findSupplierById(id);
    if (!existing) {
      throw ApiError.notFound("Proveedor no encontrado.");
    }
    await InventoryStationRepository.deleteSupplier(id);
    return { success: true, message: "Proveedor eliminado exitosamente." };
  }

  // ==========================================
  // BODEGA GENERAL (STOCK E INSUMOS)
  // ==========================================
  static async getWarehouseItems(filters = {}) {
    return await InventoryStationRepository.getWarehouseItems({
      search: filters.search || "",
      category: filters.categoria || "all",
      lowStockOnly: Boolean(filters.lowStockOnly)
    });
  }

  static async getWarehouseItemById(id) {
    const item = await InventoryStationRepository.findWarehouseItemById(id);
    if (!item) {
      throw ApiError.notFound("Insumo de bodega no encontrado.");
    }
    return item;
  }

  static async createWarehouseItem(data) {
    if (!data.nombre || !data.nombre.trim()) {
      throw ApiError.badRequest("El nombre del insumo es obligatorio.");
    }
    const newId = await InventoryStationRepository.createWarehouseItem({
      nombre: data.nombre.trim(),
      categoria: data.categoria || "General",
      stock_actual: Number(data.stock_actual || 0),
      stock_minimo: Number(data.stock_minimo || 5),
      unidad_medida: data.unidad_medida || "Unidad",
      id_proveedor: data.proveedor_id || data.id_proveedor || null,
      costo_unitario: Number(data.costo_unitario || 0)
    });
    return await InventoryStationRepository.findWarehouseItemById(newId);
  }

  static async updateWarehouseItem(id, data) {
    const existing = await InventoryStationRepository.findWarehouseItemById(id);
    if (!existing) {
      throw ApiError.notFound("Insumo de bodega no encontrado.");
    }
    return await InventoryStationRepository.updateWarehouseItem(id, {
      nombre: data.nombre,
      categoria: data.categoria,
      stock_minimo: data.stock_minimo,
      unidad_medida: data.unidad_medida,
      id_proveedor: data.proveedor_id || data.id_proveedor,
      costo_unitario: data.costo_unitario,
      tipo_movimiento: data.tipo_movimiento,
      cantidad_ajuste: data.cantidad_ajuste,
      observaciones: data.observaciones
    });
  }

  static async getWarehouseMovements(filters = {}) {
    return await InventoryStationRepository.getWarehouseMovements(filters);
  }

  static async deleteWarehouseItem(id) {
    const existing = await InventoryStationRepository.findWarehouseItemById(id);
    if (!existing) {
      throw ApiError.notFound("Insumo de bodega no encontrado.");
    }
    await InventoryStationRepository.deleteWarehouseItem(id);
    return { success: true, message: "Insumo de bodega eliminado." };
  }

  // ==========================================
  // ENTRADAS DE MERCANCÍA (COMPRAS DE PROVEEDOR)
  // ==========================================
  static async registerStockEntry(data) {
    const insumoId = data.insumo_id || data.id_insumo;
    const provId = data.proveedor_id || data.id_proveedor;
    const qty = Number(data.cantidad_ingresada);
    const cost = Number(data.costo_unitario || 0);

    if (!insumoId || !qty || qty <= 0) {
      throw ApiError.badRequest("Debe indicar un insumo válido y una cantidad mayor a 0.");
    }

    const item = await InventoryStationRepository.findWarehouseItemById(insumoId);
    if (!item) {
      throw ApiError.notFound("El insumo de bodega especificado no existe.");
    }

    const newEntryId = await InventoryStationRepository.registerStockEntry({
      id_insumo: insumoId,
      id_proveedor: provId || item.id_proveedor || 1,
      cantidad_ingresada: qty,
      costo_unitario: cost,
      observaciones: data.observaciones || "Ingreso de mercancía por proveedor"
    });

    const updatedItem = await InventoryStationRepository.findWarehouseItemById(insumoId);

    return {
      id_entrada: newEntryId,
      id_insumo: insumoId,
      insumo_nombre: item.nombre,
      cantidad_ingresada: qty,
      costo_unitario: cost,
      nuevo_stock_actual: updatedItem?.stock_actual ?? (Number(item.stock_actual) + qty)
    };
  }

  static async getStockEntries(filters = {}) {
    return await InventoryStationRepository.getStockEntries({
      insumoId: filters.insumo_id || filters.id_insumo || "all",
      limit: filters.limit || 50
    });
  }

  static async cancelStockEntry(idEntrada, motivo) {
    if (!motivo || String(motivo).trim() === "") {
      throw ApiError.badRequest("Debes ingresar obligatoriamente el motivo de la anulación.");
    }
    return await InventoryStationRepository.cancelStockEntry(idEntrada, motivo);
  }


  // ==========================================
  // ESTACIONES DE BARBEROS (MODELO SEMÁFORO)
  // ==========================================
  static async getStationItems(filters = {}) {
    return await InventoryStationRepository.getAllStations({
      barberId: filters.barbero_id || "all",
      status: filters.estado_semaforo || "all"
    });
  }

  static async getBarberStation(barberoId) {
    if (!barberoId) {
      throw ApiError.badRequest("Identificador de barbero no especificado.");
    }
    return await InventoryStationRepository.getBarberStation(barberoId);
  }

  static async assignStationItem(data) {
    const barberoId = data.barbero_id || data.id_barbero;
    const insumoId = data.insumo_id || data.id_insumo;

    if (!barberoId || !insumoId) {
      throw ApiError.badRequest("Debe indicar el barbero y el insumo de bodega a asignar.");
    }

    const item = await InventoryStationRepository.findWarehouseItemById(insumoId);
    if (!item) {
      throw ApiError.notFound("El insumo seleccionado no existe en bodega.");
    }

    const newId = await InventoryStationRepository.assignItemToStation({
      id_barbero: barberoId,
      id_insumo: insumoId,
      cantidad_asignada: data.cantidad_asignada || 1,
      notas: data.notas || ""
    });

    const stations = await InventoryStationRepository.getAllStations({ barberId: barberoId });
    const assigned = stations.find((s) => Number(s.id_estacion_insumo) === Number(newId));
    return assigned || { id_estacion_insumo: newId, id_barbero: barberoId, id_insumo: insumoId };
  }

  static async updateStationItemStatus(idEstacionItem, nuevoEstado, requestedByBarberId = null, notas = "", cantidadAsignada = undefined) {
    const validStates = ["VERDE", "AMARILLO", "ROJO"];
    const estadoUpper = String(nuevoEstado).toUpperCase().trim();

    if (!validStates.includes(estadoUpper)) {
      throw ApiError.badRequest(`Estado inválido. Debe ser uno de: ${validStates.join(", ")}`);
    }

    const stations = await InventoryStationRepository.getAllStations();
    const stationItem = stations.find((s) => Number(s.id_estacion_insumo) === Number(idEstacionItem));
    if (!stationItem) {
      throw ApiError.notFound("Elemento de estación no encontrado.");
    }

    // Si es un barbero quien actualiza, asegurar que pertenece a su estación
    if (requestedByBarberId && Number(stationItem.id_barbero) !== Number(requestedByBarberId)) {
      throw ApiError.forbidden("No tienes permisos para modificar insumos de otra estación de trabajo.");
    }

    const updated = await InventoryStationRepository.updateStationItemStatus(idEstacionItem, estadoUpper, notas, cantidadAsignada);
    return updated;
  }

  static async requestRestockBatch(items = [], requestedByBarberId = null, generalNotes = "") {
    if (!Array.isArray(items) || items.length === 0) {
      throw ApiError.badRequest("Debe seleccionar al menos un insumo para reponer.");
    }

    const updatedList = [];
    for (const item of items) {
      const idEstacion = item.id_estacion_insumo || item.id_estacion_item || item.id;
      const cantidad = Number(item.cantidad || 1);
      const specificNotes = item.notas ? ` - ${item.notas}` : "";
      const notas = `Solicitud de reposición: ${cantidad} unidad(es)${specificNotes}${generalNotes ? ` | Nota: ${generalNotes}` : ""}`.trim();

      const updated = await this.updateStationItemStatus(idEstacion, "ROJO", requestedByBarberId, notas);
      updatedList.push({
        ...updated,
        cantidad_solicitada: cantidad
      });
    }

    return updatedList;
  }

  static async approveRestock(idEstacionItem, cantidadEntregada = 1, observaciones = "", idUsuario = 1) {
    const cantidad = Number(cantidadEntregada) > 0 ? Number(cantidadEntregada) : 1;
    const result = await InventoryStationRepository.approveRestock(idEstacionItem, {
      cantidad,
      observaciones,
      id_usuario: idUsuario
    });
    return result;
  }

  static async removeStationItem(idEstacionItem) {
    const stations = await InventoryStationRepository.getAllStations();
    const existing = stations.find((s) => Number(s.id_estacion_insumo) === Number(idEstacionItem));
    if (!existing) {
      throw ApiError.notFound("Elemento de estación no encontrado.");
    }
    await InventoryStationRepository.deleteStationItem(idEstacionItem);
    return { success: true, message: "Insumo retirado de la estación correctamente." };
  }

  // ==========================================
  // HISTORIAL Y MÉTRICAS DE RENDIMIENTO
  // ==========================================
  static async getRestockHistory(filters = {}) {
    return await InventoryStationRepository.getRestockHistory({
      barberId: filters.barbero_id || filters.id_barbero || "all",
      insumoId: filters.insumo_id || filters.id_insumo || "all",
      limit: filters.limit || 100
    });
  }

  static async getPerformanceMetrics(barberoId = null) {
    return await InventoryStationRepository.getPerformanceMetrics({
      barberId: barberoId || "all"
    });
  }
}

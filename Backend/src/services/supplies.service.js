import { SuppliesRepository } from "../models/supplies.model.js";
import { BarbersRepository } from "../models/barbers.model.js";
import { ProductsRepository } from "../models/products.model.js";
import { InventoryStationRepository } from "../models/inventoryStation.model.js";
import { ApiError } from "../errors/apiError.js";

export class SuppliesService {
  static async getAllSupplies(filters) {
    return await SuppliesRepository.findAll(filters);
  }

  static async getSupplyById(id) {
    const supply = await SuppliesRepository.findById(id);
    if (!supply) {
      throw ApiError.notFound("Registro de abastecimiento no encontrado.");
    }
    return supply;
  }

  static async createSupply(supplyData, userId) {
    // 1. Validar barbero destinatario
    if (!supplyData.id_barbero) {
      throw ApiError.badRequest("El ID del barbero es obligatorio.");
    }

    const barber = await BarbersRepository.findById(supplyData.id_barbero);
    if (!barber) {
      throw ApiError.notFound("El barbero seleccionado no existe.");
    }

    if (Number(barber.estado) === 0) {
      throw ApiError.badRequest(`El barbero '${barber.nombre || "seleccionado"}' no se encuentra activo.`);
    }

    // 2. Validar lista de detalles / insumos
    if (!Array.isArray(supplyData.detalles) || supplyData.detalles.length === 0) {
      throw ApiError.badRequest("Debe incluir al menos un producto o insumo para el abastecimiento.");
    }

    const detailsWithSubtotals = [];
    let totalEstimated = 0;

    for (const item of supplyData.detalles) {
      const rawId = item.id_insumo || item.id_producto;
      if (!rawId) {
        throw ApiError.badRequest("Cada ítem debe tener un insumo válido.");
      }

      const qty = Number(item.cantidad);
      if (isNaN(qty) || qty <= 0) {
        throw ApiError.badRequest("La cantidad de cada insumo debe ser mayor a cero.");
      }

      // 1. Buscar primero en insumos de bodega general (insumo_bodega)
      let itemRecord = await InventoryStationRepository.findWarehouseItemById(rawId);
      let isWarehouseItem = true;

      // 2. Si no está en bodega, buscar en catálogo de productos regular
      if (!itemRecord) {
        itemRecord = await ProductsRepository.findById(rawId);
        isWarehouseItem = false;
      }

      if (!itemRecord) {
        throw ApiError.notFound(`Insumo con ID ${rawId} no encontrado en almacén ni catálogo.`);
      }

      if (itemRecord.estado !== undefined && Number(itemRecord.estado) === 0) {
        throw ApiError.badRequest(`El insumo '${itemRecord.nombre}' se encuentra inactivo.`);
      }

      // Verificación estricta de stock disponible en bodega o inventario
      const availableStock = Number(isWarehouseItem ? itemRecord.stock_actual : itemRecord.stock);
      if (availableStock < qty) {
        throw ApiError.conflict(
          `Stock insuficiente para el insumo '${itemRecord.nombre}'. Stock disponible en bodega: ${availableStock}, solicitado: ${qty}.`
        );
      }

      const unitPrice = item.precio_unitario !== undefined
        ? Number(item.precio_unitario)
        : Number(isWarehouseItem ? (itemRecord.costo_unitario || 0) : (itemRecord.precio || 0));
      const subtotal = qty * unitPrice;
      totalEstimated += subtotal;

      detailsWithSubtotals.push({
        id_producto: Number(isWarehouseItem ? itemRecord.id_insumo : itemRecord.id_producto),
        id_insumo: Number(isWarehouseItem ? itemRecord.id_insumo : 0),
        nombre_insumo: itemRecord.nombre,
        isWarehouseItem,
        cantidad: qty,
        precio_unitario: unitPrice,
        subtotal
      });
    }

    const payload = {
      id_barbero: Number(supplyData.id_barbero),
      id_usuario: Number(userId || supplyData.id_usuario || 1),
      observaciones: supplyData.observaciones || "Despacho de consumibles e insumos para servicios"
    };

    const supplyId = await SuppliesRepository.createWithDetails(payload, detailsWithSubtotals, totalEstimated);
    return await SuppliesRepository.findById(supplyId);
  }

  static async cancelSupply(id) {
    const supply = await SuppliesRepository.findById(id);
    if (!supply) {
      throw ApiError.notFound("Registro de abastecimiento no encontrado.");
    }

    if (supply.estado === "Anulado") {
      throw ApiError.conflict("Este abastecimiento ya se encuentra anulado.");
    }

    const ok = await SuppliesRepository.cancelSupply(id);
    if (!ok) {
      throw ApiError.internal("Error al anular el abastecimiento y restituir el inventario.");
    }

    return await SuppliesRepository.findById(id);
  }

  static async deleteSupply(id) {
    const supply = await SuppliesRepository.findById(id);
    if (!supply) {
      throw ApiError.notFound("Registro de abastecimiento no encontrado.");
    }

    // Si aún está registrado y no anulado, restaurar stock antes de eliminar
    if (supply.estado !== "Anulado") {
      await SuppliesRepository.cancelSupply(id);
    }

    return await SuppliesRepository.delete(id);
  }

  static async getMetrics({ barberId = "all", period = "week" } = {}) {
    return await SuppliesRepository.getBarberSuppliesMetrics({ barberId, period });
  }
}

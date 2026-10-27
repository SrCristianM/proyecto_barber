import { InventoryStationService } from "../services/inventoryStation.service.js";
import { BarbersRepository } from "../models/barbers.model.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { ROLES } from "../config/constants.js";

async function resolveBarberId(user) {
  if (!user) return null;
  if (user.id_barbero) return user.id_barbero;
  const barbers = await BarbersRepository.findAll();
  const b = barbers.find((barb) => Number(barb.id_usuario) === Number(user.id_usuario));
  return b ? b.id_barbero : null;
}

export class InventoryStationController {
  // ==========================================
  // PROVEEDORES
  // ==========================================
  static async getSuppliers(req, res, next) {
    try {
      const filters = {
        search: req.query.search || "",
        estado: req.query.estado !== undefined ? req.query.estado : ""
      };
      const suppliers = await InventoryStationService.getSuppliers(filters);
      return ApiResponse.success(res, suppliers, "Proveedores obtenidos exitosamente");
    } catch (error) {
      next(error);
    }
  }

  static async getSupplierById(req, res, next) {
    try {
      const supplier = await InventoryStationService.getSupplierById(req.params.id);
      return ApiResponse.success(res, supplier, "Proveedor obtenido exitosamente");
    } catch (error) {
      next(error);
    }
  }

  static async createSupplier(req, res, next) {
    try {
      const newSupplier = await InventoryStationService.createSupplier(req.body);
      return ApiResponse.created(res, newSupplier, "Proveedor registrado exitosamente");
    } catch (error) {
      next(error);
    }
  }

  static async updateSupplier(req, res, next) {
    try {
      const updated = await InventoryStationService.updateSupplier(req.params.id, req.body);
      return ApiResponse.success(res, updated, "Proveedor actualizado exitosamente");
    } catch (error) {
      next(error);
    }
  }

  static async deleteSupplier(req, res, next) {
    try {
      const result = await InventoryStationService.deleteSupplier(req.params.id);
      return ApiResponse.success(res, result, "Proveedor eliminado correctamente");
    } catch (error) {
      next(error);
    }
  }

  // ==========================================
  // BODEGA GENERAL (STOCK E INSUMOS)
  // ==========================================
  static async getWarehouseItems(req, res, next) {
    try {
      const filters = {
        search: req.query.search || "",
        categoria: req.query.categoria || "",
        proveedor_id: req.query.proveedor_id || "",
        lowStockOnly: req.query.lowStockOnly === "true" || req.query.lowStockOnly === true
      };
      const items = await InventoryStationService.getWarehouseItems(filters);
      return ApiResponse.success(res, items, "Insumos de bodega obtenidos exitosamente");
    } catch (error) {
      next(error);
    }
  }

  static async getWarehouseItemById(req, res, next) {
    try {
      const item = await InventoryStationService.getWarehouseItemById(req.params.id);
      return ApiResponse.success(res, item, "Insumo de bodega obtenido");
    } catch (error) {
      next(error);
    }
  }

  static async createWarehouseItem(req, res, next) {
    try {
      const newItem = await InventoryStationService.createWarehouseItem(req.body);
      return ApiResponse.created(res, newItem, "Insumo registrado en bodega general");
    } catch (error) {
      next(error);
    }
  }

  static async updateWarehouseItem(req, res, next) {
    try {
      const updated = await InventoryStationService.updateWarehouseItem(req.params.id, req.body);
      return ApiResponse.success(res, updated, "Insumo actualizado exitosamente");
    } catch (error) {
      next(error);
    }
  }

  static async getWarehouseMovements(req, res, next) {
    try {
      const filters = {
        idInsumo: req.query.id_insumo || req.query.idInsumo || "all",
        tipoMovimiento: req.query.tipo_movimiento || req.query.tipoMovimiento || "all",
        search: req.query.search || "",
        limit: Number(req.query.limit) || 100
      };
      const movements = await InventoryStationService.getWarehouseMovements(filters);
      return ApiResponse.success(res, movements, "Historial de movimientos de bodega obtenido");
    } catch (error) {
      next(error);
    }
  }

  static async deleteWarehouseItem(req, res, next) {
    try {
      const result = await InventoryStationService.deleteWarehouseItem(req.params.id);
      return ApiResponse.success(res, result, "Insumo eliminado de la bodega");
    } catch (error) {
      next(error);
    }
  }

  // ==========================================
  // ENTRADAS DE MERCANCÍA (COMPRA / INGRESO DE PROVEEDOR)
  // ==========================================
  static async registerStockEntry(req, res, next) {
    try {
      const entry = await InventoryStationService.registerStockEntry(req.body);
      return ApiResponse.created(
        res,
        entry,
        "Entrada de mercancía registrada con éxito y stock incrementado en bodega general"
      );
    } catch (error) {
      next(error);
    }
  }

  static async getStockEntries(req, res, next) {
    try {
      const filters = {
        insumo_id: req.query.insumo_id || "",
        proveedor_id: req.query.proveedor_id || ""
      };
      const entries = await InventoryStationService.getStockEntries(filters);
      return ApiResponse.success(res, entries, "Historial de entradas de mercancía obtenido");
    } catch (error) {
      next(error);
    }
  }

  static async cancelStockEntry(req, res, next) {
    try {
      const { id } = req.params;
      const { motivo } = req.body;
      const result = await InventoryStationService.cancelStockEntry(id, motivo);
      return ApiResponse.success(
        res,
        result,
        "Entrada de mercancía anulada correctamente. Stock descontado de la bodega central."
      );
    } catch (error) {
      next(error);
    }
  }


  // ==========================================
  // ESTACIONES Y SEMÁFOROS
  // ==========================================
  static async getAllStationItems(req, res, next) {
    try {
      const filters = {
        barbero_id: req.query.barbero_id || "",
        estado_semaforo: req.query.estado_semaforo || "",
        search: req.query.search || ""
      };

      // Si el usuario autenticado es un barbero, restringir automáticamente a su puesto
      if (req.user && Number(req.user.id_rol) === ROLES.BARBERO) {
        const barberId = await resolveBarberId(req.user);
        if (barberId) {
          filters.barbero_id = barberId;
        }
      }

      const items = await InventoryStationService.getStationItems(filters);
      return ApiResponse.success(res, items, "Insumos de estaciones obtenidos exitosamente");
    } catch (error) {
      next(error);
    }
  }

  static async getMyStation(req, res, next) {
    try {
      let barberId = req.query.barbero_id;
      if (req.user && Number(req.user.id_rol) === ROLES.BARBERO) {
        barberId = await resolveBarberId(req.user);
      } else if (!barberId && req.user) {
        barberId = await resolveBarberId(req.user);
      }

      if (!barberId) {
        barberId = 1; // Fallback al barbero principal para pruebas
      }

      const items = await InventoryStationService.getBarberStation(barberId);
      return ApiResponse.success(res, items, "Insumos asignados a tu estación de trabajo");
    } catch (error) {
      next(error);
    }
  }

  static async assignItem(req, res, next) {
    try {
      const assigned = await InventoryStationService.assignStationItem(req.body);
      return ApiResponse.created(res, assigned, "Insumo asignado a la estación del barbero exitosamente");
    } catch (error) {
      next(error);
    }
  }

  static async updateStatus(req, res, next) {
    try {
      const { id } = req.params;
      const { estado_semaforo, notas, cantidad_asignada, cantidad_actual } = req.body;

      let barberId = null;
      if (req.user && Number(req.user.id_rol) === ROLES.BARBERO) {
        barberId = await resolveBarberId(req.user);
      }

      const qty = cantidad_actual !== undefined ? cantidad_actual : cantidad_asignada;

      const updated = await InventoryStationService.updateStationItemStatus(
        id,
        estado_semaforo,
        barberId,
        notas || "",
        qty !== undefined ? Number(qty) : undefined
      );

      return ApiResponse.success(res, updated, `Semáforo actualizado a ${updated.estado_semaforo}`);
    } catch (error) {
      next(error);
    }
  }

  static async requestRestockBatch(req, res, next) {
    try {
      const { items, observaciones } = req.body;
      if (!Array.isArray(items) || items.length === 0) {
        throw ApiError.badRequest("Debe seleccionar al menos un insumo para solicitar reposición.");
      }

      let barberId = null;
      if (req.user && Number(req.user.id_rol) === ROLES.BARBERO) {
        barberId = await resolveBarberId(req.user);
      }

      const results = await InventoryStationService.requestRestockBatch(items, barberId, observaciones);
      return ApiResponse.success(
        res,
        results,
        `Solicitud de reposición enviada con éxito para ${results.length} insumo(s).`
      );
    } catch (error) {
      next(error);
    }
  }

  static async approveRestock(req, res, next) {
    try {
      const { id } = req.params;
      const cantidad = req.body.cantidad_entregada || req.body.cantidad || 1;
      const observaciones = req.body.observaciones || "";
      const idUsuario = req.user?.id_usuario || 1;

      const result = await InventoryStationService.approveRestock(id, cantidad, observaciones, idUsuario);
      return ApiResponse.success(
        res,
        result,
        "Reposición aprobada: Stock de bodega general descontado y semáforo reiniciado a VERDE"
      );
    } catch (error) {
      next(error);
    }
  }

  static async removeStationItem(req, res, next) {
    try {
      const result = await InventoryStationService.removeStationItem(req.params.id);
      return ApiResponse.success(res, result, "Insumo retirado de la estación");
    } catch (error) {
      next(error);
    }
  }

  // ==========================================
  // HISTORIAL Y MÉTRICAS
  // ==========================================
  static async getRestockHistory(req, res, next) {
    try {
      const filters = {
        barbero_id: req.query.barbero_id || "",
        insumo_id: req.query.insumo_id || ""
      };

      if (req.user && Number(req.user.id_rol) === ROLES.BARBERO) {
        const barberId = await resolveBarberId(req.user);
        if (barberId) filters.barbero_id = barberId;
      }

      const history = await InventoryStationService.getRestockHistory(filters);
      return ApiResponse.success(res, history, "Historial de reposiciones obtenido exitosamente");
    } catch (error) {
      next(error);
    }
  }

  static async getPerformanceMetrics(req, res, next) {
    try {
      let barberId = req.query.barbero_id || null;
      if (req.user && Number(req.user.id_rol) === ROLES.BARBERO) {
        barberId = await resolveBarberId(req.user);
      }
      const metrics = await InventoryStationService.getPerformanceMetrics(barberId);
      return ApiResponse.success(res, metrics, "Métricas de rendimiento e insumos por barbero");
    } catch (error) {
      next(error);
    }
  }
}

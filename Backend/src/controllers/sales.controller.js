import { SalesService } from "../services/sales.service.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { ROLES } from "../config/constants.js";

export class SalesController {
  static async getAll(req, res, next) {
    try {
      const filters = {
        client: req.query.client || "all",
        status: req.query.status || "all",
        startDate: req.query.startDate || "",
        endDate: req.query.endDate || ""
      };

      // Si es un cliente en su propio portal (mis-compras)
      if (req.user && Number(req.user.id_rol) === ROLES.CLIENTE) {
        const clients = await (await import("../models/clients.model.js")).ClientsRepository.findAll();
        const cl = clients.find((c) => c.id_usuario === req.user.id_usuario);
        if (cl) filters.client = cl.id_cliente;
      }

      const sales = await SalesService.getAllSales(filters);
      return ApiResponse.success(res, sales, "Ventas obtenidas exitosamente");
    } catch (error) {
      next(error);
    }
  }

  static async getById(req, res, next) {
    try {
      const sale = await SalesService.getSaleById(req.params.id);
      return ApiResponse.success(res, sale, "Venta obtenida exitosamente");
    } catch (error) {
      next(error);
    }
  }

  static async create(req, res, next) {
    try {
      const newSale = await SalesService.createSale(req.body, req.user.id_usuario);
      return ApiResponse.created(res, newSale, "Venta registrada exitosamente y stock debitado");
    } catch (error) {
      next(error);
    }
  }

  static async cancel(req, res, next) {
    try {
      const result = await SalesService.cancelSale(req.params.id);
      return ApiResponse.success(res, result, "Venta anulada y stock restaurado exitosamente");
    } catch (error) {
      next(error);
    }
  }

  static async delete(req, res, next) {
    try {
      const result = await SalesService.deleteSale(req.params.id);
      return ApiResponse.success(res, result, "Venta eliminada exitosamente");
    } catch (error) {
      next(error);
    }
  }
}

import { PurchasesService } from "../services/purchases.service.js";
import { ApiResponse } from "../utils/apiResponse.js";

export class PurchasesController {
  static async getAll(req, res, next) {
    try {
      const filters = {
        supplier: req.query.supplier || req.query.id_proveedor || "all",
        status: req.query.status || "all",
        startDate: req.query.startDate || "",
        endDate: req.query.endDate || ""
      };
      const purchases = await PurchasesService.getAllPurchases(filters);
      return ApiResponse.success(res, purchases, "Compras obtenidas exitosamente");
    } catch (error) {
      next(error);
    }
  }

  static async getById(req, res, next) {
    try {
      const purchase = await PurchasesService.getPurchaseById(req.params.id);
      return ApiResponse.success(res, purchase, "Compra obtenida exitosamente");
    } catch (error) {
      next(error);
    }
  }

  static async create(req, res, next) {
    try {
      const newPurchase = await PurchasesService.createPurchase(req.body, req.user.id_usuario);
      return ApiResponse.created(res, newPurchase, "Compra registrada exitosamente y stock incrementado");
    } catch (error) {
      next(error);
    }
  }

  static async cancel(req, res, next) {
    try {
      const result = await PurchasesService.cancelPurchase(req.params.id);
      return ApiResponse.success(res, result, "Compra anulada exitosamente y stock ajustado");
    } catch (error) {
      next(error);
    }
  }
}

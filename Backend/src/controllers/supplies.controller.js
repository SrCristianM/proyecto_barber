import { SuppliesService } from "../services/supplies.service.js";
import { ApiResponse } from "../utils/apiResponse.js";

export class SuppliesController {
  static async getAll(req, res, next) {
    try {
      const filters = {
        barberId: req.query.barberId || req.query.barber || "all",
        status: req.query.status || "all",
        startDate: req.query.startDate || "",
        endDate: req.query.endDate || ""
      };

      const supplies = await SuppliesService.getAllSupplies(filters);
      return ApiResponse.success(res, supplies, "Abastecimientos obtenidos exitosamente");
    } catch (error) {
      next(error);
    }
  }

  static async getById(req, res, next) {
    try {
      const supply = await SuppliesService.getSupplyById(req.params.id);
      return ApiResponse.success(res, supply, "Abastecimiento obtenido exitosamente");
    } catch (error) {
      next(error);
    }
  }

  static async create(req, res, next) {
    try {
      const userId = req.user?.id_usuario || req.body.id_usuario || 1;
      const newSupply = await SuppliesService.createSupply(req.body, userId);
      return ApiResponse.created(
        res,
        newSupply,
        "Abastecimiento registrado con éxito y stock descontado del inventario"
      );
    } catch (error) {
      next(error);
    }
  }

  static async cancel(req, res, next) {
    try {
      const result = await SuppliesService.cancelSupply(req.params.id);
      return ApiResponse.success(
        res,
        result,
        "Abastecimiento anulado y stock restaurado en el inventario exitosamente"
      );
    } catch (error) {
      next(error);
    }
  }

  static async delete(req, res, next) {
    try {
      const result = await SuppliesService.deleteSupply(req.params.id);
      return ApiResponse.success(res, result, "Registro de abastecimiento eliminado");
    } catch (error) {
      next(error);
    }
  }

  static async getMetrics(req, res, next) {
    try {
      const { barberId = "all", period = "week" } = req.query;
      const metrics = await SuppliesService.getMetrics({ barberId, period });
      return ApiResponse.success(res, metrics, "Métricas de insumos consumidos por barbero");
    } catch (error) {
      next(error);
    }
  }
}

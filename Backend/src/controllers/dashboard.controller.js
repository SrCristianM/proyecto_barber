import { DashboardService } from "../services/dashboard.service.js";
import { ApiResponse } from "../utils/apiResponse.js";

export class DashboardController {
  static async getAdminStats(req, res, next) {
    try {
      const stats = await DashboardService.getAdminStats();
      return ApiResponse.success(res, stats, "Métricas administrativas obtenidas");
    } catch (error) {
      next(error);
    }
  }

  static async getBarberStats(req, res, next) {
    try {
      const stats = await DashboardService.getBarberStats(req.user.id_usuario);
      return ApiResponse.success(res, stats, "Métricas del barbero obtenidas");
    } catch (error) {
      next(error);
    }
  }
}

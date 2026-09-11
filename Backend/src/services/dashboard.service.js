import { DashboardRepository } from "../models/dashboard.model.js";
import { BarbersRepository } from "../models/barbers.model.js";

export class DashboardService {
  static async getAdminStats() {
    return await DashboardRepository.getAdminMetrics();
  }

  static async getBarberStats(userId) {
    const barbers = await BarbersRepository.findAll();
    const barber = barbers.find((b) => b.id_usuario === Number(userId));
    if (!barber) {
      return {
        citas_hoy: 0,
        citas_completadas: 0,
        citas_pendientes: 0,
        ganancias_hoy: 0
      };
    }
    return await DashboardRepository.getBarberMetrics(barber.id_barbero);
  }
}

import { BarbersService } from "../services/barbers.service.js";
import { ApiResponse } from "../utils/apiResponse.js";

export class BarbersController {
  static async getAll(req, res, next) {
    try {
      const filters = {
        search: req.query.search,
        status: req.query.status || "all",
        specialty: req.query.specialty
      };
      const barbers = await BarbersService.getAllBarbers(filters);
      return ApiResponse.success(res, barbers, "Barberos obtenidos exitosamente");
    } catch (error) {
      next(error);
    }
  }

  static async getById(req, res, next) {
    try {
      const barber = await BarbersService.getBarberById(req.params.id);
      return ApiResponse.success(res, barber, "Barbero obtenido exitosamente");
    } catch (error) {
      next(error);
    }
  }

  static async create(req, res, next) {
    try {
      const newBarber = await BarbersService.createBarber(req.body);
      return ApiResponse.created(res, newBarber, "Barbero creado exitosamente");
    } catch (error) {
      next(error);
    }
  }

  static async update(req, res, next) {
    try {
      const updatedBarber = await BarbersService.updateBarber(req.params.id, req.body);
      return ApiResponse.success(res, updatedBarber, "Barbero actualizado exitosamente");
    } catch (error) {
      next(error);
    }
  }

  static async toggleStatus(req, res, next) {
    try {
      const result = await BarbersService.toggleBarberStatus(req.params.id);
      return ApiResponse.success(res, result, "Estado del barbero actualizado");
    } catch (error) {
      next(error);
    }
  }
}

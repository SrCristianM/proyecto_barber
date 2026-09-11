import { SchedulesService } from "../services/schedules.service.js";
import { ApiResponse } from "../utils/apiResponse.js";

export class SchedulesController {
  static async getAll(req, res, next) {
    try {
      const filters = {
        barber: req.query.barber || req.query.id_barbero || req.query.barbero || "all",
        status: req.query.status || "all",
        day: req.query.day || "all"
      };
      const schedules = await SchedulesService.getAllSchedules(filters);
      return ApiResponse.success(res, schedules, "Horarios obtenidos exitosamente");
    } catch (error) {
      next(error);
    }
  }

  static async getById(req, res, next) {
    try {
      const schedule = await SchedulesService.getScheduleById(req.params.id);
      return ApiResponse.success(res, schedule, "Horario obtenido exitosamente");
    } catch (error) {
      next(error);
    }
  }

  static async create(req, res, next) {
    try {
      const result = await SchedulesService.saveMultipleDays(req.body);
      return ApiResponse.created(res, result, "Horarios registrados exitosamente");
    } catch (error) {
      next(error);
    }
  }

  static async update(req, res, next) {
    try {
      const updated = await SchedulesService.updateSchedule(req.params.id, req.body);
      return ApiResponse.success(res, updated, "Horario actualizado exitosamente");
    } catch (error) {
      next(error);
    }
  }

  static async delete(req, res, next) {
    try {
      await SchedulesService.deleteSchedule(req.params.id);
      return ApiResponse.success(res, null, "Horario eliminado exitosamente");
    } catch (error) {
      next(error);
    }
  }

  static async getAvailability(req, res, next) {
    try {
      const id_barbero = req.query.id_barbero || req.query.barbero;
      const { fecha } = req.query;
      const availability = await SchedulesService.getAvailability(id_barbero, fecha);
      return ApiResponse.success(res, availability, "Disponibilidad calculada");
    } catch (error) {
      next(error);
    }
  }

  static async getAllNovelties(req, res, next) {
    try {
      const filters = {
        barber: req.query.barber || "all",
        status: req.query.status || "all"
      };
      const novelties = await SchedulesService.getAllNovelties(filters);
      return ApiResponse.success(res, novelties, "Novedades de horario obtenidas");
    } catch (error) {
      next(error);
    }
  }

  static async createNovelty(req, res, next) {
    try {
      const newNovelty = await SchedulesService.createNovelty(req.body);
      return ApiResponse.created(res, newNovelty, "Novedad registrada exitosamente");
    } catch (error) {
      next(error);
    }
  }

  static async updateNoveltyStatus(req, res, next) {
    try {
      const result = await SchedulesService.updateNoveltyStatus(req.params.id, req.body.estado);
      return ApiResponse.success(res, result, "Estado de novedad actualizado");
    } catch (error) {
      next(error);
    }
  }
}

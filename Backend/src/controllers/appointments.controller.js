import { AppointmentsService } from "../services/appointments.service.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { ROLES } from "../config/constants.js";

export class AppointmentsController {
  static async getAll(req, res, next) {
    try {
      const filters = {
        barber: req.query.barber || "all",
        client: req.query.client || "all",
        date: req.query.date || "",
        startDate: req.query.startDate || "",
        endDate: req.query.endDate || "",
        status: req.query.status || "all"
      };

      // Si es un barbero autenticado, restringir a sus propias citas
      if (req.user && Number(req.user.id_rol) === ROLES.BARBERO && !req.query.override) {
        // Encontrar barbero por id_usuario
        const barbers = await (await import("../models/barbers.model.js")).BarbersRepository.findAll();
        const b = barbers.find((barb) => barb.id_usuario === req.user.id_usuario);
        if (b) filters.barber = b.id_barbero;
      }

      // Si es un cliente autenticado en portal cliente
      if (req.user && Number(req.user.id_rol) === ROLES.CLIENTE) {
        const clients = await (await import("../models/clients.model.js")).ClientsRepository.findAll();
        const cl = clients.find((c) => c.id_usuario === req.user.id_usuario);
        if (cl) filters.client = cl.id_cliente;
      }

      const appointments = await AppointmentsService.getAllAppointments(filters);
      return ApiResponse.success(res, appointments, "Citas obtenidas exitosamente");
    } catch (error) {
      next(error);
    }
  }

  static async getById(req, res, next) {
    try {
      const appointment = await AppointmentsService.getAppointmentById(req.params.id);
      return ApiResponse.success(res, appointment, "Cita obtenida exitosamente");
    } catch (error) {
      next(error);
    }
  }

  static async create(req, res, next) {
    try {
      const appointmentData = { ...req.body };

      // Si es un cliente autenticado agendando su propia cita
      if (req.user && Number(req.user.id_rol) === ROLES.CLIENTE && !appointmentData.id_cliente) {
        const client = await (await import("../models/clients.model.js")).ClientsRepository.findByUserId(req.user.id_usuario);
        if (client) appointmentData.id_cliente = client.id_cliente;
      }

      const newAppointment = await AppointmentsService.createAppointment(appointmentData);
      return ApiResponse.created(res, newAppointment, "Cita agendada exitosamente");
    } catch (error) {
      next(error);
    }
  }

  static async update(req, res, next) {
    try {
      const updated = await AppointmentsService.updateAppointment(req.params.id, req.body);
      return ApiResponse.success(res, updated, "Cita actualizada exitosamente");
    } catch (error) {
      next(error);
    }
  }

  static async updateStatus(req, res, next) {
    try {
      const result = await AppointmentsService.updateAppointmentStatus(req.params.id, req.body.estado);
      return ApiResponse.success(res, result, "Estado de la cita modificado");
    } catch (error) {
      next(error);
    }
  }

  static async cancel(req, res, next) {
    try {
      const result = await AppointmentsService.cancelAppointment(req.params.id);
      return ApiResponse.success(res, result, "Cita cancelada exitosamente");
    } catch (error) {
      next(error);
    }
  }
}

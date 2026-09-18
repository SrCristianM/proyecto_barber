import { AppointmentsRepository } from "../models/appointments.model.js";
import { BarbersRepository } from "../models/barbers.model.js";
import { ClientsRepository } from "../models/clients.model.js";
import { ServicesRepository } from "../models/services.model.js";
import { SchedulesService } from "./schedules.service.js";
import { NotificationsService } from "./notifications.service.js";
import { ROLES } from "../config/constants.js";
import { ApiError } from "../errors/apiError.js";

export class AppointmentsService {
  static async getAllAppointments(filters) {
    return await AppointmentsRepository.findAll(filters);
  }

  static async getAppointmentById(id) {
    const appointment = await AppointmentsRepository.findById(id);
    if (!appointment) {
      throw ApiError.notFound("Cita no encontrada");
    }
    return appointment;
  }

  static async createAppointment(appointmentData) {
    const { id_cliente, id_barbero, fecha, hora } = appointmentData;

    // 1. Validar cliente
    const client = await ClientsRepository.findById(id_cliente);
    if (!client) {
      throw ApiError.notFound("Cliente no encontrado.");
    }
    if (client.estado === 0) {
      throw ApiError.forbidden("El cliente se encuentra inactivo.");
    }

    // 2. Validar barbero
    const barber = await BarbersRepository.findById(id_barbero);
    if (!barber) {
      throw ApiError.notFound("Barbero no encontrado.");
    }
    if (barber.estado === 0) {
      throw ApiError.badRequest("El barbero seleccionado no se encuentra activo.");
    }

    // 3. Validar disponibilidad general del barbero
    const availability = await SchedulesService.getAvailability(id_barbero, fecha);
    if (!availability.disponible) {
      throw ApiError.conflict(`El barbero no está disponible en la fecha seleccionada: ${availability.motivo}`);
    }

    // 4. Validar que la hora seleccionada esté dentro de un slot disponible
    const requestedTime = hora.substring(0, 5);
    const validSlot = availability.slots.find((s) => s.hora === requestedTime);

    if (!validSlot) {
      throw ApiError.badRequest(`La hora ${requestedTime} está fuera del horario de atención del barbero (${availability.hora_inicio} a ${availability.hora_fin}).`);
    }

    if (!validSlot.disponible) {
      throw ApiError.conflict(`El horario ${requestedTime} ya se encuentra reservado para este barbero. Por favor elige otro turno.`);
    }

    // 5. Validar que no haya conflicto en base de datos (doble verificación de concurrencia)
    const hasConflict = await AppointmentsRepository.findConflict(id_barbero, fecha, requestedTime);
    if (hasConflict) {
      throw ApiError.conflict(`Conflicto de horario: Ya existe una cita programada para el barbero en ${fecha} a las ${requestedTime}.`);
    }

    // 6. Resolver servicios y sus precios
    let serviceIds = [];
    if (Array.isArray(appointmentData.servicios) && appointmentData.servicios.length > 0) {
      serviceIds = appointmentData.servicios.map((s) => (typeof s === "object" ? s.id_servicio : Number(s)));
    } else if (appointmentData.id_servicio) {
      serviceIds = [Number(appointmentData.id_servicio)];
    }

    if (serviceIds.length === 0) {
      throw ApiError.badRequest("Debes especificar al menos un servicio válido para la cita.");
    }

    const servicesWithPrice = [];
    for (const sId of serviceIds) {
      const serv = await ServicesRepository.findById(sId);
      if (!serv) {
        throw ApiError.notFound(`Servicio con ID ${sId} no encontrado.`);
      }
      servicesWithPrice.push({
        id_servicio: serv.id_servicio,
        precio: serv.precio
      });
    }

    const newAppointmentId = await AppointmentsRepository.create(
      {
        ...appointmentData,
        hora: requestedTime
      },
      servicesWithPrice
    );

    const createdApt = await AppointmentsRepository.findById(newAppointmentId);

    // Disparo automático de notificaciones operativas
    try {
      NotificationsService.createCustomNotification({
        type: "appointment",
        title: "Nueva cita agendada",
        description: `Nueva cita agendada para el ${fecha} a las ${requestedTime} con ${barber.nombre}.`,
        id_rol: ROLES.ADMIN,
        route: "/admin/citas"
      });
      NotificationsService.createCustomNotification({
        type: "appointment",
        title: "Nueva cita agendada",
        description: `Nueva cita agendada para el ${fecha} a las ${requestedTime} con ${barber.nombre}.`,
        id_rol: ROLES.RECEPCIONISTA,
        route: "/admin/citas"
      });
      if (barber.id_usuario) {
        NotificationsService.createCustomNotification({
          type: "appointment",
          title: "Nueva cita asignada",
          description: `Tienes una nueva cita para el ${fecha} a las ${requestedTime} (${appointmentData.cliente_nombre || client.nombre || "Cliente"}).`,
          id_usuario: barber.id_usuario,
          route: "/barbero/agenda"
        });
      }
      if (client.id_usuario) {
        NotificationsService.createCustomNotification({
          type: "appointment",
          title: "¡Cita agendada con éxito!",
          description: `Tu cita para el ${fecha} a las ${requestedTime} con ${barber.nombre} ha sido confirmada.`,
          id_usuario: client.id_usuario,
          route: "/portal/mis-citas"
        });
      }
    } catch (err) {
      console.warn("[AppointmentsService] No se pudo despachar notificación:", err.message);
    }

    return createdApt;
  }

  static async updateAppointment(id, appointmentData) {
    const appointment = await AppointmentsRepository.findById(id);
    if (!appointment) {
      throw ApiError.notFound("Cita no encontrada.");
    }

    const targetBarber = appointmentData.id_barbero || appointment.id_barbero;
    const targetDate = appointmentData.fecha || appointment.fecha;
    const targetTime = (appointmentData.hora || appointment.hora).substring(0, 5);

    // Si cambió barbero, fecha u hora, verificar conflicto
    if (
      Number(targetBarber) !== Number(appointment.id_barbero) ||
      targetDate !== appointment.fecha ||
      targetTime !== appointment.hora.substring(0, 5)
    ) {
      const hasConflict = await AppointmentsRepository.findConflict(targetBarber, targetDate, targetTime, id);
      if (hasConflict) {
        throw ApiError.conflict(`Conflicto de horario: El barbero ya tiene otra cita en ${targetDate} a las ${targetTime}.`);
      }
    }

    let servicesWithPrice = null;
    if (Array.isArray(appointmentData.servicios) && appointmentData.servicios.length > 0) {
      servicesWithPrice = [];
      for (const s of appointmentData.servicios) {
        const sId = typeof s === "object" ? s.id_servicio : Number(s);
        const serv = await ServicesRepository.findById(sId);
        if (serv) {
          servicesWithPrice.push({ id_servicio: serv.id_servicio, precio: serv.precio });
        }
      }
    }

    await AppointmentsRepository.update(id, appointmentData, servicesWithPrice);
    return await AppointmentsRepository.findById(id);
  }

  static async updateAppointmentStatus(id, newStatus) {
    const appointment = await AppointmentsRepository.findById(id);
    if (!appointment) {
      throw ApiError.notFound("Cita no encontrada.");
    }
    await AppointmentsRepository.updateStatus(id, newStatus);
    return { id_cita: Number(id), estado: newStatus };
  }

  static async cancelAppointment(id) {
    const apt = await AppointmentsRepository.findById(id);
    const result = await this.updateAppointmentStatus(id, "Cancelada");
    if (apt) {
      try {
        NotificationsService.createCustomNotification({
          type: "appointment",
          title: "Cita cancelada",
          description: `La cita del ${apt.fecha} a las ${apt.hora ? apt.hora.substring(0, 5) : ""} ha sido cancelada.`,
          id_rol: ROLES.ADMIN,
          route: "/admin/citas"
        });
        if (apt.id_barbero) {
          const barber = await BarbersRepository.findById(apt.id_barbero);
          if (barber?.id_usuario) {
            NotificationsService.createCustomNotification({
              type: "appointment",
              title: "Cita cancelada",
              description: `Tu cita del ${apt.fecha} a las ${apt.hora ? apt.hora.substring(0, 5) : ""} ha sido cancelada.`,
              id_usuario: barber.id_usuario,
              route: "/barbero/agenda"
            });
          }
        }
      } catch (err) {
        console.warn("[AppointmentsService] No se pudo despachar notificación de cancelación:", err.message);
      }
    }
    return result;
  }

  static async deleteAppointment(id) {
    const appointment = await AppointmentsRepository.findById(id);
    if (!appointment) {
      throw ApiError.notFound("Cita no encontrada.");
    }
    await AppointmentsRepository.delete(id);
    return { id_cita: Number(id), eliminado: true };
  }
}

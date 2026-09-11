import { SchedulesRepository } from "../models/schedules.model.js";
import { BarbersRepository } from "../models/barbers.model.js";
import { executeQuery, isDatabaseConnected } from "../config/db.js";
import { mockStore } from "../config/mockStore.js";
import { ApiError } from "../errors/apiError.js";

const DAYS_OF_WEEK_ES = ["Domingo", "Lunes", "Martes", "Miercoles", "Jueves", "Viernes", "Sabado"];

export class SchedulesService {
  static async getAllSchedules(filters) {
    return await SchedulesRepository.findAll(filters);
  }

  static async getScheduleById(id) {
    const schedule = await SchedulesRepository.findById(id);
    if (!schedule) {
      throw ApiError.notFound("Horario no encontrado");
    }
    return schedule;
  }

  static async saveMultipleDays(scheduleData) {
    const barber = await BarbersRepository.findById(scheduleData.id_barbero);
    if (!barber) {
      throw ApiError.notFound("Barbero no encontrado");
    }
    await SchedulesRepository.createMultipleDays(scheduleData);
    return await SchedulesRepository.findAll({ barber: scheduleData.id_barbero });
  }

  static async updateSchedule(id, scheduleData) {
    const schedule = await SchedulesRepository.findById(id);
    if (!schedule) {
      throw ApiError.notFound("Horario no encontrado");
    }
    await SchedulesRepository.update(id, scheduleData);
    return await SchedulesRepository.findById(id);
  }

  static async deleteSchedule(id) {
    const schedule = await SchedulesRepository.findById(id);
    if (!schedule) {
      throw ApiError.notFound("Horario no encontrado");
    }
    return await SchedulesRepository.delete(id);
  }

  // ==========================================
  // CÁLCULO DE DISPONIBILIDAD HORARIA
  // ==========================================
  static async getAvailability(barberId, dateStr) {
    const bId = Number(barberId);
    const barber = await BarbersRepository.findById(bId);
    if (!barber) {
      throw ApiError.notFound("Barbero no encontrado");
    }

    if (barber.estado === 0) {
      return {
        disponible: false,
        motivo: "El barbero se encuentra actualmente inactivo.",
        slots: []
      };
    }

    // 1. Determinar día de la semana
    // Parse con hora fija a mediodía para evitar desfases de zona horaria
    const dateObj = new Date(`${dateStr}T12:00:00Z`);
    const dayOfWeek = DAYS_OF_WEEK_ES[dateObj.getUTCDay()];

    // 2. Verificar si tiene novedad de ausencia aprobada
    const hasAbsence = await SchedulesRepository.hasApprovedNovelty(bId, dateStr);
    if (hasAbsence) {
      return {
        disponible: false,
        dia_semana: dayOfWeek,
        motivo: "El barbero cuenta con un permiso o ausencia autorizada en la fecha seleccionada.",
        slots: []
      };
    }

    // 3. Buscar horario de atención para ese día
    const schedule = await SchedulesRepository.findByBarberAndDay(bId, dayOfWeek);
    if (!schedule) {
      return {
        disponible: false,
        dia_semana: dayOfWeek,
        motivo: `El barbero no presta servicio los días ${dayOfWeek}.`,
        slots: []
      };
    }

    // 4. Obtener citas agendadas activas en esa fecha
    let bookedTimes = [];
    if (isDatabaseConnected()) {
      const sql = `
        SELECT hora, estado FROM cita
        WHERE id_barbero = ? AND fecha = ? AND estado IN ('Programada', 'Confirmada', 'Reprogramada')
      `;
      const rows = await executeQuery(sql, [bId, dateStr]);
      bookedTimes = rows ? rows.map((r) => r.hora.substring(0, 5)) : [];
    } else {
      bookedTimes = mockStore.citas
        .filter((c) => c.id_barbero === bId && c.fecha === dateStr && ["Programada", "Confirmada", "Reprogramada"].includes(c.estado))
        .map((c) => c.hora.substring(0, 5));
    }

    // 5. Generar slots de 30 minutos
    const slots = [];
    const [startH, startM] = schedule.hora_inicio.split(":").map(Number);
    const [endH, endM] = schedule.hora_fin.split(":").map(Number);

    let currentMinutes = startH * 60 + startM;
    const endMinutes = endH * 60 + endM;

    while (currentMinutes < endMinutes) {
      const hh = String(Math.floor(currentMinutes / 60)).padStart(2, "0");
      const mm = String(currentMinutes % 60).padStart(2, "0");
      const slotTime = `${hh}:${mm}`;

      slots.push({
        hora: slotTime,
        disponible: !bookedTimes.includes(slotTime)
      });

      currentMinutes += 30; // intervalos de 30 minutos
    }

    return {
      disponible: true,
      id_barbero: bId,
      barbero: `${barber.nombre} ${barber.apellido}`,
      fecha: dateStr,
      dia_semana: dayOfWeek,
      hora_inicio: schedule.hora_inicio,
      hora_fin: schedule.hora_fin,
      total_slots: slots.length,
      slots_disponibles: slots.filter((s) => s.disponible).length,
      slots
    };
  }

  // ==========================================
  // NOVEDADES
  // ==========================================
  static async getAllNovelties(filters) {
    return await SchedulesRepository.findAllNovelties(filters);
  }

  static async createNovelty(noveltyData) {
    const barber = await BarbersRepository.findById(noveltyData.id_barbero);
    if (!barber) {
      throw ApiError.notFound("Barbero no encontrado");
    }
    const newId = await SchedulesRepository.createNovelty(noveltyData);
    return { id_novedad: newId, ...noveltyData, estado: "Pendiente" };
  }

  static async updateNoveltyStatus(id, newStatus) {
    const updated = await SchedulesRepository.updateNoveltyStatus(id, newStatus);
    if (!updated) {
      throw ApiError.notFound("Novedad no encontrada");
    }
    return { id_novedad: Number(id), estado: newStatus };
  }
}

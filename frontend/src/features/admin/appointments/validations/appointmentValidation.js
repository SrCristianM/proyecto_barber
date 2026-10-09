import {
  isRequired,
  validateFutureOrTodayDate
} from "../../../../shared/validations/commonValidators.js";

/** Normaliza texto para comparaciones sin tildes ni mayúsculas */
function normalizeDayName(d) {
  return String(d || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

/**
 * Valida formulario de agendamiento de citas incluyendo colisiones de horario y disponibilidad.
 */
export function validateAppointmentForm(
  formData,
  isCreate = true,
  appointments = [],
  selectedAppointmentId = null,
  schedules = [],
  novelties = []
) {
  const errors = {};

  // Cliente
  if (!formData.id_cliente || Number(formData.id_cliente) <= 0) {
    errors.id_cliente = "Debes seleccionar un cliente.";
  }

  // Barbero
  if (!formData.id_barbero || Number(formData.id_barbero) <= 0) {
    errors.id_barbero = "Debes seleccionar un barbero.";
  }

  // Servicio o Paquetes
  const hasSelectedServices =
    (Array.isArray(formData.servicios_seleccionados) && formData.servicios_seleccionados.length > 0) ||
    (formData.id_servicio && Number(formData.id_servicio) > 0);

  if (!hasSelectedServices) {
    errors.servicios = "Debes seleccionar al menos un servicio o paquete del catálogo.";
  }

  // Fecha
  if (!formData.fecha || formData.fecha.trim() === "") {
    errors.fecha = "Debes seleccionar la fecha de la cita.";
  } else if (isCreate) {
    const dateErr = validateFutureOrTodayDate(formData.fecha, "La fecha de la cita");
    if (dateErr) errors.fecha = dateErr;
  }

  // Validaciones del barbero en la fecha seleccionada
  if (formData.id_barbero && formData.fecha) {
    const [y, m, d] = formData.fecha.split("-").map(Number);
    const dateObj = new Date(y, m - 1, d, 12, 0, 0);
    const DAYS = ["Domingo", "Lunes", "Martes", "Miercoles", "Jueves", "Viernes", "Sabado"];
    const DAYS_DISPLAY = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
    const dayName = DAYS[dateObj.getDay()];
    const displayDay = DAYS_DISPLAY[dateObj.getDay()];

    // 1. Novedad de ausencia aprobada
    if (Array.isArray(novelties) && novelties.length > 0) {
      const novelty = novelties.find(
        (n) =>
          Number(n.id_barbero) === Number(formData.id_barbero) &&
          n.fecha === formData.fecha &&
          (n.estado === "Aprobado" || n.estado === "Aprobada")
      );
      if (novelty) {
        errors.fecha = `El barbero cuenta con una novedad aprobada (${novelty.tipo || "Permiso"}) en esta fecha.`;
      }
    }

    // 2. Horario laboral del barbero
    if (Array.isArray(schedules) && schedules.length > 0 && !errors.fecha) {
      const barberHasSchedules = schedules.some((s) => Number(s.id_barbero) === Number(formData.id_barbero));
      if (barberHasSchedules) {
        const worksOnDay = schedules.some((s) => {
          if (Number(s.id_barbero) !== Number(formData.id_barbero) || Number(s.estado) === 0) return false;
          const targetDay = normalizeDayName(dayName);
          if (s.dia_semana && normalizeDayName(s.dia_semana) === targetDay) return true;
          if (Array.isArray(s.dias_semana) && s.dias_semana.some((sd) => normalizeDayName(sd) === targetDay)) return true;
          return false;
        });
        if (!worksOnDay) {
          errors.fecha = `El barbero no atiende los días ${displayDay}. Por favor selecciona otra fecha.`;
        }
      }
    }
  }

  // Hora
  if (!formData.hora || formData.hora.trim() === "") {
    errors.hora = "Debes seleccionar o ingresar una hora de atención.";
  } else if (formData.id_barbero && formData.fecha && Array.isArray(appointments) && appointments.length > 0) {
    const requestedTime = formData.hora.substring(0, 5);
    const conflict = appointments.find((a) => {
      if (Number(a.id_barbero) !== Number(formData.id_barbero)) return false;
      if (a.fecha !== formData.fecha) return false;
      if (a.estado === "Cancelada") return false;
      if (selectedAppointmentId && Number(a.id_cita) === Number(selectedAppointmentId)) return false;
      const aptTime = a.hora ? a.hora.substring(0, 5) : "";
      return aptTime === requestedTime;
    });

    if (conflict) {
      errors.hora = `El horario ${requestedTime} ya se encuentra ocupado con otra cita para este barbero.`;
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

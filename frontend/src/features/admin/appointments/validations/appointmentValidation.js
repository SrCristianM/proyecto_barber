import {
  isRequired,
  validateFutureOrTodayDate
} from "../../../../shared/validations/commonValidators";

/**
 * Valida formulario de agendamiento de citas.
 */
export function validateAppointmentForm(formData, isCreate = true) {
  const errors = {};

  // Cliente
  if (!formData.id_cliente || Number(formData.id_cliente) <= 0) {
    errors.id_cliente = "Debes seleccionar un cliente.";
  }

  // Barbero
  if (!formData.id_barbero || Number(formData.id_barbero) <= 0) {
    errors.id_barbero = "Debes seleccionar un barbero.";
  }

  // Servicio
  if (!formData.id_servicio || Number(formData.id_servicio) <= 0) {
    errors.id_servicio = "Debes seleccionar un servicio del catálogo.";
  }

  // Fecha
  if (!formData.fecha || formData.fecha.trim() === "") {
    errors.fecha = "Debes seleccionar la fecha de la cita.";
  } else if (isCreate) {
    const dateErr = validateFutureOrTodayDate(formData.fecha, "La fecha de la cita");
    if (dateErr) errors.fecha = dateErr;
  }

  // Hora
  if (!formData.hora || formData.hora.trim() === "") {
    errors.hora = "Debes seleccionar o ingresar una hora de atención.";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

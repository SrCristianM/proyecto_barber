import {
  isRequired,
  validateTimeRange,
  validateStringLength
} from "../../../../shared/validations/commonValidators";

/**
 * Valida formulario de horarios semanales de barberos.
 */
export function validateScheduleForm(formData) {
  const errors = {};

  // Barbero asignado
  if (!formData.id_barbero || Number(formData.id_barbero) <= 0) {
    errors.id_barbero = "Debes seleccionar un barbero asignado.";
  }

  // Días de atención (al menos 1 día)
  if (!formData.dias_semana || formData.dias_semana.length === 0) {
    errors.dias_semana = "Debes seleccionar al menos un día de atención semanal.";
  }

  // Horas
  if (!formData.hora_inicio) {
    errors.hora_inicio = "La hora de inicio es obligatoria.";
  }
  if (!formData.hora_fin) {
    errors.hora_fin = "La hora de fin es obligatoria.";
  }

  // Validación de restricción CHECK (hora_fin > hora_inicio)
  if (formData.hora_inicio && formData.hora_fin) {
    const timeErr = validateTimeRange(formData.hora_inicio, formData.hora_fin);
    if (timeErr) {
      errors.hora_fin = timeErr;
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

/**
 * Valida formulario de novedades de horario (ausencias, permisos, etc.).
 */
export function validateNoveltyForm(formData) {
  const errors = {};

  if (!formData.id_barbero || Number(formData.id_barbero) <= 0) {
    errors.id_barbero = "Debes seleccionar el barbero solicitante.";
  }

  if (!formData.tipo || formData.tipo.trim() === "") {
    errors.tipo = "Debes seleccionar el tipo de novedad.";
  }

  if (!formData.fecha || formData.fecha.trim() === "") {
    errors.fecha = "La fecha de la novedad es obligatoria.";
  }

  const descReq = isRequired(formData.descripcion, "La descripción del motivo");
  const descLen = validateStringLength(formData.descripcion, 5, 255, "La descripción");
  if (descReq) errors.descripcion = descReq;
  else if (descLen) errors.descripcion = descLen;

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

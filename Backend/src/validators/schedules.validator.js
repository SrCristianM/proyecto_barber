import { body, param, query } from "express-validator";

export const createScheduleValidation = [
  body("id_barbero").isInt({ min: 1 }).withMessage("ID de barbero requerido."),
  body("dias_semana").isArray({ min: 1 }).withMessage("Debes seleccionar al menos un día de la semana."),
  body("hora_inicio").matches(/^([01]\d|2[0-3]):([0-5]\d)(:[0-5]\d)?$/).withMessage("Formato de hora de inicio inválido (HH:mm)."),
  body("hora_fin").matches(/^([01]\d|2[0-3]):([0-5]\d)(:[0-5]\d)?$/).withMessage("Formato de hora de fin inválido (HH:mm).")
];

export const updateScheduleValidation = [
  param("id").isInt().withMessage("ID de horario inválido."),
  body("hora_inicio").optional().matches(/^([01]\d|2[0-3]):([0-5]\d)(:[0-5]\d)?$/),
  body("hora_fin").optional().matches(/^([01]\d|2[0-3]):([0-5]\d)(:[0-5]\d)?$/),
  body("estado").optional().isIn([0, 1])
];

export const availabilityValidation = [
  query("fecha").matches(/^\d{4}-\d{2}-\d{2}$/).withMessage("La fecha debe tener formato YYYY-MM-DD."),
  query("id_barbero").custom((value, { req }) => {
    const id = value || req.query.barbero;
    if (!id || isNaN(Number(id)) || Number(id) < 1) {
      throw new Error("ID de barbero requerido.");
    }
    return true;
  })
];

export const createNoveltyValidation = [
  body("id_barbero").isInt({ min: 1 }).withMessage("ID de barbero requerido."),
  body("tipo").isIn(["Ausencia", "Cambio de turno", "Permiso", "Otro"]).withMessage("Tipo de novedad no válido."),
  body("fecha").matches(/^\d{4}-\d{2}-\d{2}$/).withMessage("Fecha con formato YYYY-MM-DD requerida."),
  body("descripcion").optional().trim().isLength({ max: 255 })
];

export const updateNoveltyStatusValidation = [
  param("id").isInt().withMessage("ID de novedad inválido."),
  body("estado").isIn(["Aprobado", "Rechazado"]).withMessage("El nuevo estado debe ser 'Aprobado' o 'Rechazado'.")
];

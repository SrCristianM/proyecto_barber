import { body, param, query } from "express-validator";

export const createAppointmentValidation = [
  body("id_cliente").isInt({ min: 1 }).withMessage("ID de cliente requerido."),
  body("id_barbero").isInt({ min: 1 }).withMessage("ID de barbero requerido."),
  body("fecha").matches(/^\d{4}-\d{2}-\d{2}$/).withMessage("Fecha con formato YYYY-MM-DD requerida."),
  body("hora").matches(/^([01]\d|2[0-3]):([0-5]\d)(:[0-5]\d)?$/).withMessage("Hora con formato HH:mm requerida."),
  body("servicios")
    .custom((val, { req }) => {
      if (Array.isArray(val) && val.length > 0) return true;
      if (req.body.id_servicio) return true;
      throw new Error("Debes especificar al menos un servicio para la cita.");
    }),
  body("estado").optional().isIn(["Programada", "Confirmada", "En Proceso", "Completada", "Cancelada", "Reprogramada"])
];

export const updateAppointmentValidation = [
  param("id").isInt().withMessage("ID de cita inválido."),
  body("id_barbero").optional().isInt({ min: 1 }),
  body("fecha").optional().matches(/^\d{4}-\d{2}-\d{2}$/),
  body("hora").optional().matches(/^([01]\d|2[0-3]):([0-5]\d)(:[0-5]\d)?$/),
  body("estado").optional().isIn(["Programada", "Confirmada", "En Proceso", "Completada", "Cancelada", "Reprogramada"]),
  body("servicios").optional().isArray()
];

export const updateStatusValidation = [
  param("id").isInt().withMessage("ID de cita inválido."),
  body("estado").isIn(["Programada", "Confirmada", "En Proceso", "Completada", "Cancelada", "Reprogramada"]).withMessage("Estado de cita no válido.")
];

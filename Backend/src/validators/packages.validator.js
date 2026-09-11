import { body, param } from "express-validator";

export const createPackageValidation = [
  body("nombre").trim().notEmpty().withMessage("El nombre del paquete es requerido.").isLength({ max: 120 }),
  body("descuento_porcentaje")
    .isFloat({ min: 0, max: 100 })
    .withMessage("El descuento debe ser un porcentaje entre 0 y 100."),
  body("servicios_ids")
    .isArray({ min: 1 })
    .withMessage("Debes incluir al menos un servicio en el paquete.")
];

export const updatePackageValidation = [
  param("id").isInt().withMessage("ID de paquete inválido."),
  body("nombre").optional().trim().notEmpty(),
  body("descuento_porcentaje").optional().isFloat({ min: 0, max: 100 }),
  body("servicios_ids").optional().isArray({ min: 1 }),
  body("estado").optional().isIn([0, 1])
];

export const togglePackageStatusValidation = [
  param("id").isInt().withMessage("ID de paquete inválido.")
];

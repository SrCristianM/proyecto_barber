import { body, param } from "express-validator";

export const createRoleValidation = [
  body("nombre_rol").trim().notEmpty().withMessage("El nombre del rol es requerido.").isLength({ max: 50 }),
  body("descripcion").optional().trim().isLength({ max: 255 }),
  body("permisos").optional().isArray().withMessage("Permisos debe ser un arreglo de identificadores o claves.")
];

export const updateRoleValidation = [
  param("id").isInt().withMessage("ID de rol inválido."),
  body("nombre_rol").optional().trim().notEmpty().withMessage("El nombre del rol no puede estar vacío."),
  body("descripcion").optional().trim().isLength({ max: 255 }),
  body("estado").optional().isIn([0, 1]),
  body("permisos").optional().isArray()
];

export const toggleRoleStatusValidation = [
  param("id").isInt().withMessage("ID de rol inválido.")
];

import { body, param } from "express-validator";

export const createSupplierValidation = [
  body("nombre").trim().notEmpty().withMessage("El nombre del proveedor es requerido.").isLength({ max: 120 }),
  body("nit").optional({ checkFalsy: true }).trim().isLength({ max: 30 }),
  body("telefono").optional().trim().isLength({ max: 20 }),
  body("correo").optional({ checkFalsy: true }).trim().isEmail().withMessage("Correo electrónico inválido."),
  body("direccion").optional().trim().isLength({ max: 255 })
];

export const updateSupplierValidation = [
  param("id").isInt().withMessage("ID de proveedor inválido."),
  body("nombre").optional().trim().notEmpty(),
  body("nit").optional({ checkFalsy: true }).trim(),
  body("telefono").optional().trim(),
  body("correo").optional({ checkFalsy: true }).trim().isEmail(),
  body("direccion").optional().trim(),
  body("estado").optional().isIn([0, 1])
];

export const toggleSupplierStatusValidation = [
  param("id").isInt().withMessage("ID de proveedor inválido.")
];

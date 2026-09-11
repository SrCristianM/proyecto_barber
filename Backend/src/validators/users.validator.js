import { body, query, param } from "express-validator";

export const createUserValidation = [
  body("nombre").trim().notEmpty().withMessage("El nombre es requerido.").isLength({ max: 80 }),
  body("apellido").trim().notEmpty().withMessage("El apellido es requerido.").isLength({ max: 80 }),
  body("correo").trim().isEmail().withMessage("Correo electrónico no válido.").isLength({ max: 120 }),
  body("contrasena").optional().isLength({ min: 8 }).withMessage("La contraseña debe tener al menos 8 caracteres."),
  body("id_rol").isInt({ min: 1, max: 4 }).withMessage("id_rol debe ser un valor válido entre 1 y 4."),
  body("telefono").optional({ checkFalsy: true }).trim().isLength({ max: 20 }),
  body("estado").optional().isIn([0, 1]).withMessage("El estado debe ser 0 o 1.")
];

export const updateUserValidation = [
  param("id").isInt().withMessage("El ID de usuario debe ser un número entero."),
  body("nombre").optional().trim().notEmpty().withMessage("El nombre no puede estar vacío."),
  body("apellido").optional().trim().notEmpty().withMessage("El apellido no puede estar vacío."),
  body("correo").optional().trim().isEmail().withMessage("Correo no válido."),
  body("telefono").optional().trim(),
  body("id_rol").optional().isInt({ min: 1, max: 4 }),
  body("estado").optional().isIn([0, 1]),
  body("contrasena").optional().isLength({ min: 8 })
];

export const toggleStatusValidation = [
  param("id").isInt().withMessage("ID de usuario inválido."),
  body("estado").optional().isIn([0, 1])
];

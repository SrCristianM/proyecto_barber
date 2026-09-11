import { body, param } from "express-validator";

export const createBarberValidation = [
  body("nombre").trim().notEmpty().withMessage("El nombre es requerido."),
  body("apellido").trim().notEmpty().withMessage("El apellido es requerido."),
  body("correo").trim().isEmail().withMessage("Correo electrónico no válido."),
  body("telefono").optional().trim(),
  body("especialidad").optional().trim().isLength({ max: 100 }),
  body("imagen_url").optional().trim(),
  body("contrasena").optional().isLength({ min: 8 })
];

export const updateBarberValidation = [
  param("id").isInt().withMessage("ID de barbero inválido."),
  body("nombre").optional().trim().notEmpty(),
  body("apellido").optional().trim().notEmpty(),
  body("correo").optional().trim().isEmail(),
  body("telefono").optional().trim(),
  body("especialidad").optional().trim().isLength({ max: 100 }),
  body("imagen_url").optional().trim(),
  body("estado").optional().isIn([0, 1])
];

export const toggleBarberStatusValidation = [
  param("id").isInt().withMessage("ID de barbero inválido.")
];

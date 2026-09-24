import { body, param } from "express-validator";

export const createBarberValidation = [
  body("nombre").trim().notEmpty().withMessage("El nombre es requerido."),
  body("apellido").trim().notEmpty().withMessage("El apellido es requerido."),
  body("documento").optional({ checkFalsy: true }).trim().isLength({ min: 5, max: 20 }).withMessage("El documento debe tener entre 5 y 20 caracteres."),
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
  body("documento").optional({ checkFalsy: true }).trim().isLength({ min: 5, max: 20 }).withMessage("El documento debe tener entre 5 y 20 caracteres."),
  body("correo").optional().trim().isEmail(),
  body("telefono").optional().trim(),
  body("especialidad").optional().trim().isLength({ max: 100 }),
  body("imagen_url").optional().trim(),
  body("estado").optional().isIn([0, 1])
];

export const toggleBarberStatusValidation = [
  param("id").isInt().withMessage("ID de barbero inválido.")
];

import { body, param } from "express-validator";

export const createServiceValidation = [
  body("nombre").trim().notEmpty().withMessage("El nombre del servicio es requerido.").isLength({ max: 120 }),
  body("id_categoria_servicio").isInt({ min: 1 }).withMessage("Categoría de servicio requerida."),
  body("precio").isFloat({ min: 0 }).withMessage("El precio debe ser un número mayor o igual a 0."),
  body("duracion_minutos").isInt({ min: 5 }).withMessage("La duración mínima debe ser de al menos 5 minutos."),
  body("imagen_url").optional().trim()
];

export const updateServiceValidation = [
  param("id").isInt().withMessage("ID de servicio inválido."),
  body("nombre").optional().trim().notEmpty(),
  body("id_categoria_servicio").optional().isInt({ min: 1 }),
  body("precio").optional().isFloat({ min: 0 }),
  body("duracion_minutos").optional().isInt({ min: 5 }),
  body("imagen_url").optional().trim(),
  body("estado").optional().isIn([0, 1])
];

export const toggleServiceStatusValidation = [
  param("id").isInt().withMessage("ID de servicio inválido.")
];

export const createCategoryValidation = [
  body("nombre").trim().notEmpty().withMessage("El nombre de categoría es requerido.").isLength({ max: 80 })
];

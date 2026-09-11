import { body, param } from "express-validator";

export const createProductValidation = [
  body("nombre").trim().notEmpty().withMessage("El nombre del producto es requerido.").isLength({ max: 120 }),
  body("id_categoria_producto").isInt({ min: 1 }).withMessage("Categoría de producto requerida."),
  body("precio").isFloat({ min: 0 }).withMessage("El precio debe ser mayor o igual a 0."),
  body("stock").isInt({ min: 0 }).withMessage("El stock debe ser un número entero mayor o igual a 0."),
  body("imagen_url").optional().trim()
];

export const updateProductValidation = [
  param("id").isInt().withMessage("ID de producto inválido."),
  body("nombre").optional().trim().notEmpty(),
  body("id_categoria_producto").optional().isInt({ min: 1 }),
  body("precio").optional().isFloat({ min: 0 }),
  body("stock").optional().isInt({ min: 0 }),
  body("imagen_url").optional().trim(),
  body("estado").optional().isIn([0, 1])
];

export const toggleProductStatusValidation = [
  param("id").isInt().withMessage("ID de producto inválido.")
];

export const createCategoryValidation = [
  body("nombre").trim().notEmpty().withMessage("El nombre de la categoría es requerido.").isLength({ max: 80 })
];

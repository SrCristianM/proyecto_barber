import { body, param } from "express-validator";

export const createSupplyValidation = [
  body("id_barbero").isInt({ min: 1 }).withMessage("ID de barbero requerido."),
  body("observaciones").optional().isString().trim(),
  body("detalles").isArray({ min: 1 }).withMessage("El abastecimiento debe incluir al menos un insumo/producto."),
  body("detalles.*.id_producto").isInt({ min: 1 }).withMessage("ID de producto requerido en cada detalle."),
  body("detalles.*.cantidad").isInt({ min: 1 }).withMessage("La cantidad de cada insumo debe ser al menos 1."),
  body("detalles.*.precio_unitario").optional().isFloat({ min: 0 }).withMessage("El precio unitario de referencia no puede ser negativo.")
];

export const cancelSupplyValidation = [
  param("id").isInt().withMessage("ID de abastecimiento inválido.")
];

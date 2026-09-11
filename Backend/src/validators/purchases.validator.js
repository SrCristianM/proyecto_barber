import { body, param } from "express-validator";

export const createPurchaseValidation = [
  body("id_proveedor").isInt({ min: 1 }).withMessage("ID de proveedor requerido."),
  body("detalles").isArray({ min: 1 }).withMessage("La compra debe incluir al menos un producto."),
  body("detalles.*.id_producto").isInt({ min: 1 }).withMessage("ID de producto inválido en el detalle."),
  body("detalles.*.cantidad").isInt({ min: 1 }).withMessage("La cantidad debe ser un número entero mayor a 0."),
  body("detalles.*.precio_unitario").isFloat({ min: 0 }).withMessage("El precio unitario debe ser mayor o igual a 0.")
];

export const cancelPurchaseValidation = [
  param("id").isInt().withMessage("ID de compra inválido.")
];

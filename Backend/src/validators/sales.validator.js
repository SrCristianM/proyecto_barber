import { body, param } from "express-validator";

export const createSaleValidation = [
  body("id_cliente").isInt({ min: 1 }).withMessage("ID de cliente requerido."),
  body("id_cita").optional({ nullable: true }).isInt({ min: 1 }),
  body("detalles").isArray({ min: 1 }).withMessage("La venta debe incluir al menos un producto o servicio."),
  body("detalles.*.tipo_item").isIn(["Producto", "Servicio"]).withMessage("tipo_item debe ser 'Producto' o 'Servicio'."),
  body("detalles.*.cantidad").isInt({ min: 1 }).withMessage("La cantidad debe ser mayor a 0."),
  body("detalles.*.precio_unitario").isFloat({ min: 0 }).withMessage("El precio unitario debe ser mayor o igual a 0.")
];

export const cancelSaleValidation = [
  param("id").isInt().withMessage("ID de venta inválido.")
];

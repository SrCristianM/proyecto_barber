import { Router } from "express";
import { SalesController } from "../controllers/sales.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { authorizePermission } from "../middlewares/rbac.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { createSaleValidation, cancelSaleValidation } from "../validators/sales.validator.js";

const router = Router();

// Consulta de ventas (Admin, Recepcionista y Cliente para ver 'mis-compras')
router.get("/", authenticate, authorizePermission("ventas", "ver"), SalesController.getAll);
router.get("/:id", authenticate, authorizePermission("ventas", "ver"), SalesController.getById);

// Registrar venta
router.post(
  "/",
  authenticate,
  authorizePermission("ventas", "crear"),
  validate(createSaleValidation),
  SalesController.create
);

// Anular venta y restituir inventario
router.patch(
  ["/:id/anular", "/:id/cancel"],
  authenticate,
  authorizePermission("ventas", "anular"),
  validate(cancelSaleValidation),
  SalesController.cancel
);

router.delete(
  "/:id",
  authenticate,
  authorizePermission("ventas", "anular"),
  SalesController.delete
);

export default router;

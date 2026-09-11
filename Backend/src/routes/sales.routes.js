import { Router } from "express";
import { SalesController } from "../controllers/sales.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/rbac.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { createSaleValidation, cancelSaleValidation } from "../validators/sales.validator.js";
import { ROLES } from "../config/constants.js";

const router = Router();

// Consulta de ventas (Admin, Recepcionista y Cliente para ver 'mis-compras')
router.get("/", authenticate, authorizeRoles(ROLES.ADMIN, ROLES.RECEPCIONISTA, ROLES.CLIENTE), SalesController.getAll);
router.get("/:id", authenticate, authorizeRoles(ROLES.ADMIN, ROLES.RECEPCIONISTA, ROLES.CLIENTE), SalesController.getById);

// Registrar venta (Admin y Recepcionista)
router.post(
  "/",
  authenticate,
  authorizeRoles(ROLES.ADMIN, ROLES.RECEPCIONISTA),
  validate(createSaleValidation),
  SalesController.create
);

// Anular venta y restituir inventario (Administrador)
router.patch(
  ["/:id/anular", "/:id/cancel"],
  authenticate,
  authorizeRoles(ROLES.ADMIN),
  validate(cancelSaleValidation),
  SalesController.cancel
);

router.delete(
  "/:id",
  authenticate,
  authorizeRoles(ROLES.ADMIN),
  SalesController.delete
);

export default router;

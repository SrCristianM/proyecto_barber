import { Router } from "express";
import { PurchasesController } from "../controllers/purchases.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/rbac.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { createPurchaseValidation, cancelPurchaseValidation } from "../validators/purchases.validator.js";
import { ROLES } from "../config/constants.js";

const router = Router();

// Lectura de compras (Admin y Recepcionista)
router.get("/", authenticate, authorizeRoles(ROLES.ADMIN, ROLES.RECEPCIONISTA), PurchasesController.getAll);
router.get("/:id", authenticate, authorizeRoles(ROLES.ADMIN, ROLES.RECEPCIONISTA), PurchasesController.getById);

// Registro de compras (Admin y Recepcionista)
router.post(
  "/",
  authenticate,
  authorizeRoles(ROLES.ADMIN, ROLES.RECEPCIONISTA),
  validate(createPurchaseValidation),
  PurchasesController.create
);

// Anulación de compra con ajuste atómico de stock (Exclusivo Administrador)
router.patch(
  "/:id/anular",
  authenticate,
  authorizeRoles(ROLES.ADMIN),
  validate(cancelPurchaseValidation),
  PurchasesController.cancel
);

export default router;

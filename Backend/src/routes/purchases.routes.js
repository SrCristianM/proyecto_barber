import { Router } from "express";
import { PurchasesController } from "../controllers/purchases.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { authorizePermission } from "../middlewares/rbac.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { createPurchaseValidation, cancelPurchaseValidation } from "../validators/purchases.validator.js";

const router = Router();

// Lectura de compras
router.get("/", authenticate, authorizePermission("compras", "ver"), PurchasesController.getAll);
router.get("/:id", authenticate, authorizePermission("compras", "ver"), PurchasesController.getById);

// Registro de compras
router.post(
  "/",
  authenticate,
  authorizePermission("compras", "crear"),
  validate(createPurchaseValidation),
  PurchasesController.create
);

// Anulación de compra con ajuste atómico de stock
router.patch(
  ["/:id/anular", "/:id/cancel"],
  authenticate,
  authorizePermission("compras", "anular"),
  validate(cancelPurchaseValidation),
  PurchasesController.cancel
);

router.delete(
  "/:id",
  authenticate,
  authorizePermission("compras", "eliminar"),
  PurchasesController.delete
);

export default router;

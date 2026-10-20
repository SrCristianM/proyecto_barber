import { Router } from "express";
import { SuppliesController } from "../controllers/supplies.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { authorizeRoles, authorizePermission } from "../middlewares/rbac.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { createSupplyValidation, cancelSupplyValidation } from "../validators/supplies.validator.js";
import { ROLES } from "../config/constants.js";

const router = Router();

// Métricas de consumo de insumos por barbero (Dashboard y módulo)
router.get(
  "/metrics",
  authenticate,
  authorizeRoles(ROLES.ADMIN, ROLES.RECEPCIONISTA, ROLES.BARBERO),
  SuppliesController.getMetrics
);

// Consulta general de abastecimientos
router.get(
  "/",
  authenticate,
  authorizePermission("abastecimiento", "ver"),
  SuppliesController.getAll
);

router.get(
  "/:id",
  authenticate,
  authorizePermission("abastecimiento", "ver"),
  SuppliesController.getById
);

// Registrar nuevo abastecimiento (descuento automático de stock)
router.post(
  "/",
  authenticate,
  authorizePermission("abastecimiento", "crear"),
  validate(createSupplyValidation),
  SuppliesController.create
);

// Anular abastecimiento (restitución automática de stock)
router.patch(
  ["/:id/anular", "/:id/cancel"],
  authenticate,
  authorizePermission("abastecimiento", "anular"),
  validate(cancelSupplyValidation),
  SuppliesController.cancel
);

// Eliminación administrativa
router.delete(
  "/:id",
  authenticate,
  authorizeRoles(ROLES.ADMIN),
  SuppliesController.delete
);

export default router;

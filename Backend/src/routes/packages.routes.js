import { Router } from "express";
import { PackagesController } from "../controllers/packages.controller.js";
import { authenticate, optionalAuth } from "../middlewares/auth.middleware.js";
import { authorizePermission } from "../middlewares/rbac.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import {
  createPackageValidation,
  updatePackageValidation,
  togglePackageStatusValidation
} from "../validators/packages.validator.js";

const router = Router();

// Lectura de paquetes (Pública / Portal Cliente / Barbero)
router.get("/", optionalAuth, PackagesController.getAll);
router.get("/:id", optionalAuth, PackagesController.getById);

// Gestión con control dinámico según permisos del módulo de servicios
router.post("/", authenticate, authorizePermission("servicios", "crear"), validate(createPackageValidation), PackagesController.create);
router.put("/:id", authenticate, authorizePermission("servicios", "editar"), validate(updatePackageValidation), PackagesController.update);
router.patch("/:id/status", authenticate, authorizePermission("servicios", "activar"), validate(togglePackageStatusValidation), PackagesController.toggleStatus);
router.delete("/:id", authenticate, authorizePermission("servicios", "eliminar"), PackagesController.delete);

export default router;

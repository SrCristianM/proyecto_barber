import { Router } from "express";
import { PackagesController } from "../controllers/packages.controller.js";
import { authenticate, optionalAuth } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/rbac.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import {
  createPackageValidation,
  updatePackageValidation,
  togglePackageStatusValidation
} from "../validators/packages.validator.js";
import { ROLES } from "../config/constants.js";

const router = Router();

// Lectura de paquetes (Pública / Portal Cliente / Barbero)
router.get("/", optionalAuth, PackagesController.getAll);
router.get("/:id", optionalAuth, PackagesController.getById);

// Gestión para Administrador
router.post("/", authenticate, authorizeRoles(ROLES.ADMIN), validate(createPackageValidation), PackagesController.create);
router.put("/:id", authenticate, authorizeRoles(ROLES.ADMIN), validate(updatePackageValidation), PackagesController.update);
router.patch("/:id/status", authenticate, authorizeRoles(ROLES.ADMIN), validate(togglePackageStatusValidation), PackagesController.toggleStatus);
router.delete("/:id", authenticate, authorizeRoles(ROLES.ADMIN), PackagesController.delete);

export default router;

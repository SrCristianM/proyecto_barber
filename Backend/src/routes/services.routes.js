import { Router } from "express";
import { ServicesController } from "../controllers/services.controller.js";
import { authenticate, optionalAuth } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/rbac.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import {
  createServiceValidation,
  updateServiceValidation,
  toggleServiceStatusValidation,
  createCategoryValidation
} from "../validators/services.validator.js";
import { ROLES } from "../config/constants.js";

const router = Router();

// Categorías de servicio
router.get("/categories", optionalAuth, ServicesController.getCategories);
router.post("/categories", authenticate, authorizeRoles(ROLES.ADMIN), validate(createCategoryValidation), ServicesController.createCategory);

// Catálogo de servicios (Lectura pública / cualquier cliente para agendar)
router.get("/", optionalAuth, ServicesController.getAll);
router.get("/:id", optionalAuth, ServicesController.getById);

// Gestión para Administrador
router.post("/", authenticate, authorizeRoles(ROLES.ADMIN), validate(createServiceValidation), ServicesController.create);
router.put("/:id", authenticate, authorizeRoles(ROLES.ADMIN), validate(updateServiceValidation), ServicesController.update);
router.patch("/:id/status", authenticate, authorizeRoles(ROLES.ADMIN), validate(toggleServiceStatusValidation), ServicesController.toggleStatus);
router.delete("/:id", authenticate, authorizeRoles(ROLES.ADMIN), ServicesController.delete);

export default router;

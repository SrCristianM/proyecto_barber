import { Router } from "express";
import { ServicesController } from "../controllers/services.controller.js";
import { authenticate, optionalAuth } from "../middlewares/auth.middleware.js";
import { authorizePermission } from "../middlewares/rbac.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import {
  createServiceValidation,
  updateServiceValidation,
  toggleServiceStatusValidation,
  createCategoryValidation
} from "../validators/services.validator.js";

const router = Router();

// Categorías de servicio
router.get("/categories", optionalAuth, ServicesController.getCategories);
router.post("/categories", authenticate, authorizePermission("servicios", "crear"), validate(createCategoryValidation), ServicesController.createCategory);

// Catálogo de servicios (Lectura pública / cualquier cliente para agendar)
router.get("/", optionalAuth, ServicesController.getAll);
router.get("/:id", optionalAuth, ServicesController.getById);

// Gestión con control dinámico de permisos RBAC
router.post("/", authenticate, authorizePermission("servicios", "crear"), validate(createServiceValidation), ServicesController.create);
router.put("/:id", authenticate, authorizePermission("servicios", "editar"), validate(updateServiceValidation), ServicesController.update);
router.patch("/:id/status", authenticate, authorizePermission("servicios", "activar"), validate(toggleServiceStatusValidation), ServicesController.toggleStatus);
router.delete("/:id", authenticate, authorizePermission("servicios", "eliminar"), ServicesController.delete);

export default router;

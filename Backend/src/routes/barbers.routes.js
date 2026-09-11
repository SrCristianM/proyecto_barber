import { Router } from "express";
import { BarbersController } from "../controllers/barbers.controller.js";
import { authenticate, optionalAuth } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/rbac.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { createBarberValidation, updateBarberValidation, toggleBarberStatusValidation } from "../validators/barbers.validator.js";
import { ROLES } from "../config/constants.js";

const router = Router();

// Lectura pública o para cualquier usuario autenticado (para agendamiento de citas)
router.get("/", optionalAuth, BarbersController.getAll);
router.get("/:id", optionalAuth, BarbersController.getById);

// Gestión exclusiva para Administrador (1)
router.post("/", authenticate, authorizeRoles(ROLES.ADMIN), validate(createBarberValidation), BarbersController.create);
router.put("/:id", authenticate, authorizeRoles(ROLES.ADMIN, ROLES.BARBERO), validate(updateBarberValidation), BarbersController.update);
router.patch("/:id/status", authenticate, authorizeRoles(ROLES.ADMIN), validate(toggleBarberStatusValidation), BarbersController.toggleStatus);
router.delete("/:id", authenticate, authorizeRoles(ROLES.ADMIN), BarbersController.delete);

export default router;

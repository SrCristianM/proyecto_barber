import { Router } from "express";
import { BarbersController } from "../controllers/barbers.controller.js";
import { authenticate, optionalAuth } from "../middlewares/auth.middleware.js";
import { authorizePermission } from "../middlewares/rbac.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { createBarberValidation, updateBarberValidation, toggleBarberStatusValidation } from "../validators/barbers.validator.js";

const router = Router();

// Lectura pública o para cualquier usuario autenticado (para agendamiento de citas)
router.get("/", optionalAuth, BarbersController.getAll);
router.get("/:id", optionalAuth, BarbersController.getById);

// Gestión con control dinámico de permisos RBAC
router.post("/", authenticate, authorizePermission("barberos", "crear"), validate(createBarberValidation), BarbersController.create);
router.put("/:id", authenticate, authorizePermission("barberos", "editar"), validate(updateBarberValidation), BarbersController.update);
router.patch("/:id/status", authenticate, authorizePermission("barberos", "activar"), validate(toggleBarberStatusValidation), BarbersController.toggleStatus);
router.delete("/:id", authenticate, authorizePermission("barberos", "eliminar"), BarbersController.delete);

export default router;

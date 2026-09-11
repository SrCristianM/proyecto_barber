import { Router } from "express";
import { ClientsController } from "../controllers/clients.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/rbac.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { createClientValidation, updateClientValidation, toggleClientStatusValidation } from "../validators/clients.validator.js";
import { ROLES } from "../config/constants.js";

const router = Router();

// Perfil propio del cliente autenticado
router.get("/me", authenticate, authorizeRoles(ROLES.CLIENTE), ClientsController.getMyClientProfile);

// Lectura de clientes accesible para Admin, Recepcionista y Barbero
router.get("/", authenticate, authorizeRoles(ROLES.ADMIN, ROLES.RECEPCIONISTA, ROLES.BARBERO), ClientsController.getAll);
router.get("/:id", authenticate, authorizeRoles(ROLES.ADMIN, ROLES.RECEPCIONISTA, ROLES.BARBERO), ClientsController.getById);

// Creación permitida para Admin y Recepcionista
router.post("/", authenticate, authorizeRoles(ROLES.ADMIN, ROLES.RECEPCIONISTA), validate(createClientValidation), ClientsController.create);

// Actualización y desactivación
router.put("/:id", authenticate, authorizeRoles(ROLES.ADMIN, ROLES.RECEPCIONISTA), validate(updateClientValidation), ClientsController.update);
router.patch("/:id/status", authenticate, authorizeRoles(ROLES.ADMIN), validate(toggleClientStatusValidation), ClientsController.toggleStatus);

export default router;

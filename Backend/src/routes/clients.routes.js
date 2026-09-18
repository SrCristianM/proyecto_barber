import { Router } from "express";
import { ClientsController } from "../controllers/clients.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { authorizeRoles, authorizePermission } from "../middlewares/rbac.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { createClientValidation, updateClientValidation, toggleClientStatusValidation } from "../validators/clients.validator.js";
import { ROLES } from "../config/constants.js";

const router = Router();

// Perfil propio del cliente autenticado
router.get("/me", authenticate, authorizeRoles(ROLES.CLIENTE), ClientsController.getMyClientProfile);

// Lectura de clientes
router.get("/", authenticate, authorizePermission("clientes", "ver"), ClientsController.getAll);
router.get("/:id", authenticate, authorizePermission("clientes", "ver"), ClientsController.getById);

// Creación permitida según matriz de permisos
router.post("/", authenticate, authorizePermission("clientes", "crear"), validate(createClientValidation), ClientsController.create);

// Actualización y desactivación
router.put("/:id", authenticate, authorizePermission("clientes", "editar"), validate(updateClientValidation), ClientsController.update);
router.patch("/:id/status", authenticate, authorizePermission("clientes", "activar"), validate(toggleClientStatusValidation), ClientsController.toggleStatus);
router.delete("/:id", authenticate, authorizePermission("clientes", "eliminar"), ClientsController.delete);

export default router;

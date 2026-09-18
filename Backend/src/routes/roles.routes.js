import { Router } from "express";
import { RolesController } from "../controllers/roles.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { authorizePermission } from "../middlewares/rbac.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { createRoleValidation, updateRoleValidation, toggleRoleStatusValidation } from "../validators/roles.validator.js";

const router = Router();

// Matriz de módulos y permisos
router.get("/modules/matrix", authenticate, authorizePermission("roles", "ver"), RolesController.getModules);

// CRUD de roles protegido dinámicamente por la matriz de permisos
router.get("/", authenticate, authorizePermission("roles", "ver"), RolesController.getAll);
router.get("/:id", authenticate, authorizePermission("roles", "ver"), RolesController.getById);
router.post("/", authenticate, authorizePermission("roles", "crear"), validate(createRoleValidation), RolesController.create);
router.put("/:id", authenticate, authorizePermission("roles", "editar"), validate(updateRoleValidation), RolesController.update);
router.put("/:id/permissions", authenticate, authorizePermission("roles", "editar"), RolesController.updatePermissions);
router.patch("/:id/status", authenticate, authorizePermission("roles", "editar"), validate(toggleRoleStatusValidation), RolesController.toggleStatus);
router.delete("/:id", authenticate, authorizePermission("roles", "eliminar"), RolesController.delete);

export default router;

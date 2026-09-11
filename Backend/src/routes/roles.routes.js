import { Router } from "express";
import { RolesController } from "../controllers/roles.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/rbac.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { createRoleValidation, updateRoleValidation, toggleRoleStatusValidation } from "../validators/roles.validator.js";
import { ROLES } from "../config/constants.js";

const router = Router();

// Matriz de módulos y permisos
router.get("/modules/matrix", authenticate, authorizeRoles(ROLES.ADMIN), RolesController.getModules);

// CRUD de roles
router.get("/", authenticate, authorizeRoles(ROLES.ADMIN), RolesController.getAll);
router.get("/:id", authenticate, authorizeRoles(ROLES.ADMIN), RolesController.getById);
router.post("/", authenticate, authorizeRoles(ROLES.ADMIN), validate(createRoleValidation), RolesController.create);
router.put("/:id", authenticate, authorizeRoles(ROLES.ADMIN), validate(updateRoleValidation), RolesController.update);
router.patch("/:id/status", authenticate, authorizeRoles(ROLES.ADMIN), validate(toggleRoleStatusValidation), RolesController.toggleStatus);

export default router;

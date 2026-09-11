import { Router } from "express";
import { UsersController } from "../controllers/users.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/rbac.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { createUserValidation, updateUserValidation, toggleStatusValidation } from "../validators/users.validator.js";
import { ROLES } from "../config/constants.js";

const router = Router();

// Rutas accesibles por Administrador (1) y Recepcionista (2) para lectura
router.get("/", authenticate, authorizeRoles(ROLES.ADMIN, ROLES.RECEPCIONISTA), UsersController.getAll);
router.get("/:id", authenticate, authorizeRoles(ROLES.ADMIN, ROLES.RECEPCIONISTA), UsersController.getById);

// Modificaciones restringidas exclusivamente al Administrador (1)
router.post("/", authenticate, authorizeRoles(ROLES.ADMIN), validate(createUserValidation), UsersController.create);
router.put("/:id", authenticate, authorizeRoles(ROLES.ADMIN), validate(updateUserValidation), UsersController.update);
router.patch("/:id/status", authenticate, authorizeRoles(ROLES.ADMIN), validate(toggleStatusValidation), UsersController.toggleStatus);
router.delete("/:id", authenticate, authorizeRoles(ROLES.ADMIN), UsersController.delete);

export default router;

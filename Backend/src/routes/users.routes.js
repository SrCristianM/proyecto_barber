import { Router } from "express";
import { UsersController } from "../controllers/users.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { authorizePermission } from "../middlewares/rbac.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { createUserValidation, updateUserValidation, toggleStatusValidation } from "../validators/users.validator.js";

const router = Router();

// Rutas de lectura controladas por permisos dinámicos
router.get("/", authenticate, authorizePermission("usuarios", "ver"), UsersController.getAll);
router.get("/:id", authenticate, authorizePermission("usuarios", "ver"), UsersController.getById);

// Modificaciones protegidas dinámicamente por la matriz de permisos
router.post("/", authenticate, authorizePermission("usuarios", "crear"), validate(createUserValidation), UsersController.create);
router.put("/:id", authenticate, authorizePermission("usuarios", "editar"), validate(updateUserValidation), UsersController.update);
router.patch("/:id/status", authenticate, authorizePermission("usuarios", "activar"), validate(toggleStatusValidation), UsersController.toggleStatus);
router.delete("/:id", authenticate, authorizePermission("usuarios", "eliminar"), UsersController.delete);

export default router;

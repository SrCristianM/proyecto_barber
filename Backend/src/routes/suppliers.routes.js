import { Router } from "express";
import { SuppliersController } from "../controllers/suppliers.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { authorizePermission } from "../middlewares/rbac.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import {
  createSupplierValidation,
  updateSupplierValidation,
  toggleSupplierStatusValidation
} from "../validators/suppliers.validator.js";

const router = Router();

// Lectura de proveedores según permiso asignado
router.get("/", authenticate, authorizePermission("proveedores", "ver"), SuppliersController.getAll);
router.get("/:id", authenticate, authorizePermission("proveedores", "ver"), SuppliersController.getById);

// Gestión de proveedores: controlada dinámicamente por la matriz de roles y permisos
router.post("/", authenticate, authorizePermission("proveedores", "crear"), validate(createSupplierValidation), SuppliersController.create);
router.put("/:id", authenticate, authorizePermission("proveedores", "editar"), validate(updateSupplierValidation), SuppliersController.update);
router.patch("/:id/status", authenticate, authorizePermission("proveedores", "activar"), validate(toggleSupplierStatusValidation), SuppliersController.toggleStatus);
router.delete("/:id", authenticate, authorizePermission("proveedores", "eliminar"), SuppliersController.delete);

export default router;

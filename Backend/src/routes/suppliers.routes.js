import { Router } from "express";
import { SuppliersController } from "../controllers/suppliers.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/rbac.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import {
  createSupplierValidation,
  updateSupplierValidation,
  toggleSupplierStatusValidation
} from "../validators/suppliers.validator.js";
import { ROLES } from "../config/constants.js";

const router = Router();

// Lectura de proveedores (Admin y Recepcionista)
router.get("/", authenticate, authorizeRoles(ROLES.ADMIN, ROLES.RECEPCIONISTA), SuppliersController.getAll);
router.get("/:id", authenticate, authorizeRoles(ROLES.ADMIN, ROLES.RECEPCIONISTA), SuppliersController.getById);

// Gestión de proveedores (Admin)
router.post("/", authenticate, authorizeRoles(ROLES.ADMIN), validate(createSupplierValidation), SuppliersController.create);
router.put("/:id", authenticate, authorizeRoles(ROLES.ADMIN), validate(updateSupplierValidation), SuppliersController.update);
router.patch("/:id/status", authenticate, authorizeRoles(ROLES.ADMIN), validate(toggleSupplierStatusValidation), SuppliersController.toggleStatus);
router.delete("/:id", authenticate, authorizeRoles(ROLES.ADMIN), SuppliersController.delete);

export default router;

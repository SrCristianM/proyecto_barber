import { Router } from "express";
import { ProductsController } from "../controllers/products.controller.js";
import { authenticate, optionalAuth } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/rbac.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import {
  createProductValidation,
  updateProductValidation,
  toggleProductStatusValidation,
  createCategoryValidation
} from "../validators/products.validator.js";
import { ROLES } from "../config/constants.js";

const router = Router();

// Categorías de producto
router.get("/categories", optionalAuth, ProductsController.getCategories);
router.post("/categories", authenticate, authorizeRoles(ROLES.ADMIN), validate(createCategoryValidation), ProductsController.createCategory);

// Catálogo de productos (Lectura para cualquier usuario / Portal del cliente)
router.get("/", optionalAuth, ProductsController.getAll);
router.get("/:id", optionalAuth, ProductsController.getById);

// Gestión para Administrador y Recepcionista
router.post("/", authenticate, authorizeRoles(ROLES.ADMIN, ROLES.RECEPCIONISTA), validate(createProductValidation), ProductsController.create);
router.put("/:id", authenticate, authorizeRoles(ROLES.ADMIN, ROLES.RECEPCIONISTA), validate(updateProductValidation), ProductsController.update);
router.patch("/:id/status", authenticate, authorizeRoles(ROLES.ADMIN), validate(toggleProductStatusValidation), ProductsController.toggleStatus);
router.delete("/:id", authenticate, authorizeRoles(ROLES.ADMIN, ROLES.RECEPCIONISTA), ProductsController.delete);

export default router;

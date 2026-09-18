import { Router } from "express";
import { ProductsController } from "../controllers/products.controller.js";
import { authenticate, optionalAuth } from "../middlewares/auth.middleware.js";
import { authorizePermission } from "../middlewares/rbac.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import {
  createProductValidation,
  updateProductValidation,
  toggleProductStatusValidation,
  createCategoryValidation
} from "../validators/products.validator.js";

const router = Router();

// Categorías de producto
router.get("/categories", optionalAuth, ProductsController.getCategories);
router.post("/categories", authenticate, authorizePermission("productos", "crear"), validate(createCategoryValidation), ProductsController.createCategory);

// Catálogo de productos (Lectura para cualquier usuario / Portal del cliente)
router.get("/", optionalAuth, ProductsController.getAll);
router.get("/:id", optionalAuth, ProductsController.getById);

// Gestión con control dinámico de permisos RBAC
router.post("/", authenticate, authorizePermission("productos", "crear"), validate(createProductValidation), ProductsController.create);
router.put("/:id", authenticate, authorizePermission("productos", "editar"), validate(updateProductValidation), ProductsController.update);
router.patch("/:id/status", authenticate, authorizePermission("productos", "activar"), validate(toggleProductStatusValidation), ProductsController.toggleStatus);
router.delete("/:id", authenticate, authorizePermission("productos", "eliminar"), ProductsController.delete);

export default router;

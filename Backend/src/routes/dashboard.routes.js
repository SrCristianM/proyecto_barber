import { Router } from "express";
import { DashboardController } from "../controllers/dashboard.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/rbac.middleware.js";
import { ROLES } from "../config/constants.js";

const router = Router();

// Ruta raíz de dashboard (compatibilidad directa)
router.get("/", authenticate, authorizeRoles(ROLES.ADMIN, ROLES.RECEPCIONISTA), DashboardController.getAdminStats);

// Métricas de administrador y recepcionista
router.get("/admin", authenticate, authorizeRoles(ROLES.ADMIN, ROLES.RECEPCIONISTA), DashboardController.getAdminStats);

// Métricas para el portal del barbero
router.get("/barber", authenticate, authorizeRoles(ROLES.ADMIN, ROLES.BARBERO), DashboardController.getBarberStats);

export default router;

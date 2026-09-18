/**
 * @file notifications.routes.js
 * Rutas de la API de notificaciones protegidas por autenticación.
 */

import { Router } from "express";
import { NotificationsController } from "../controllers/notifications.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";

const router = Router();

// Todas las rutas de notificaciones requieren estar autenticado
router.use(authenticate);

router.get("/", NotificationsController.getAll);
router.post("/", NotificationsController.create);
router.patch("/read-all", NotificationsController.markAllAsRead);
router.patch("/:id/read", NotificationsController.markAsRead);
router.delete("/clear-read", NotificationsController.clearRead);
router.delete("/:id", NotificationsController.deleteNotification);

export default router;

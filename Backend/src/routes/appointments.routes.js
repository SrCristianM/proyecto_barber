import { Router } from "express";
import { AppointmentsController } from "../controllers/appointments.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { authorizePermission } from "../middlewares/rbac.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import {
  createAppointmentValidation,
  updateAppointmentValidation,
  updateStatusValidation
} from "../validators/appointments.validator.js";

const router = Router();

// Todas las operaciones de citas requieren autenticación
router.get("/", authenticate, authorizePermission("citas", "ver"), AppointmentsController.getAll);
router.get("/:id", authenticate, authorizePermission("citas", "ver"), AppointmentsController.getById);

// Creación de citas
router.post(
  "/",
  authenticate,
  authorizePermission("citas", "crear"),
  validate(createAppointmentValidation),
  AppointmentsController.create
);

// Modificación y cambio de estado
router.put(
  "/:id",
  authenticate,
  authorizePermission("citas", "editar"),
  validate(updateAppointmentValidation),
  AppointmentsController.update
);

router.patch(
  "/:id/status",
  authenticate,
  authorizePermission("citas", "editar"),
  validate(updateStatusValidation),
  AppointmentsController.updateStatus
);

router.patch(
  "/:id/cancel",
  authenticate,
  authorizePermission("citas", "cancelar"),
  AppointmentsController.cancel
);

router.delete(
  "/:id",
  authenticate,
  authorizePermission("citas", "cancelar"),
  AppointmentsController.delete
);

export default router;

import { Router } from "express";
import { AppointmentsController } from "../controllers/appointments.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/rbac.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import {
  createAppointmentValidation,
  updateAppointmentValidation,
  updateStatusValidation
} from "../validators/appointments.validator.js";
import { ROLES } from "../config/constants.js";

const router = Router();

// Todas las operaciones de citas requieren autenticación
router.get("/", authenticate, AppointmentsController.getAll);
router.get("/:id", authenticate, AppointmentsController.getById);

// Creación de citas (Admin, Recepcionista, Barbero y Cliente)
router.post(
  "/",
  authenticate,
  authorizeRoles(ROLES.ADMIN, ROLES.RECEPCIONISTA, ROLES.BARBERO, ROLES.CLIENTE),
  validate(createAppointmentValidation),
  AppointmentsController.create
);

// Modificación y cambio de estado
router.put(
  "/:id",
  authenticate,
  authorizeRoles(ROLES.ADMIN, ROLES.RECEPCIONISTA, ROLES.BARBERO),
  validate(updateAppointmentValidation),
  AppointmentsController.update
);

router.patch(
  "/:id/status",
  authenticate,
  authorizeRoles(ROLES.ADMIN, ROLES.RECEPCIONISTA, ROLES.BARBERO, ROLES.CLIENTE),
  validate(updateStatusValidation),
  AppointmentsController.updateStatus
);

router.patch(
  "/:id/cancel",
  authenticate,
  authorizeRoles(ROLES.ADMIN, ROLES.RECEPCIONISTA, ROLES.CLIENTE),
  AppointmentsController.cancel
);

router.delete(
  "/:id",
  authenticate,
  authorizeRoles(ROLES.ADMIN, ROLES.RECEPCIONISTA, ROLES.CLIENTE),
  AppointmentsController.delete
);

export default router;

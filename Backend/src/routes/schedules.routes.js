import { Router } from "express";
import { SchedulesController } from "../controllers/schedules.controller.js";
import { authenticate, optionalAuth } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/rbac.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import {
  createScheduleValidation,
  updateScheduleValidation,
  availabilityValidation,
  createNoveltyValidation,
  updateNoveltyStatusValidation
} from "../validators/schedules.validator.js";
import { ROLES } from "../config/constants.js";

const router = Router();

// Consulta de disponibilidad de turnos para agendamiento (Pública / Portal Cliente)
router.get("/availability", optionalAuth, validate(availabilityValidation), SchedulesController.getAvailability);

// Novedades de horario
router.get("/novelties", authenticate, authorizeRoles(ROLES.ADMIN, ROLES.RECEPCIONISTA, ROLES.BARBERO), SchedulesController.getAllNovelties);
router.post("/novelties", authenticate, authorizeRoles(ROLES.ADMIN, ROLES.BARBERO), validate(createNoveltyValidation), SchedulesController.createNovelty);
router.patch("/novelties/:id/status", authenticate, authorizeRoles(ROLES.ADMIN), validate(updateNoveltyStatusValidation), SchedulesController.updateNoveltyStatus);

// CRUD de Horarios
router.get("/", optionalAuth, SchedulesController.getAll);
router.get("/:id", optionalAuth, SchedulesController.getById);
router.post("/", authenticate, authorizeRoles(ROLES.ADMIN), validate(createScheduleValidation), SchedulesController.create);
router.put("/:id", authenticate, authorizeRoles(ROLES.ADMIN), validate(updateScheduleValidation), SchedulesController.update);
router.delete("/:id", authenticate, authorizeRoles(ROLES.ADMIN), SchedulesController.delete);

export default router;

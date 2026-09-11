import { Router } from "express";

import authRoutes from "./auth.routes.js";
import usersRoutes from "./users.routes.js";
import rolesRoutes from "./roles.routes.js";
import barbersRoutes from "./barbers.routes.js";
import clientsRoutes from "./clients.routes.js";
import servicesRoutes from "./services.routes.js";
import packagesRoutes from "./packages.routes.js";
import productsRoutes from "./products.routes.js";
import schedulesRoutes from "./schedules.routes.js";
import appointmentsRoutes from "./appointments.routes.js";
import suppliersRoutes from "./suppliers.routes.js";
import purchasesRoutes from "./purchases.routes.js";
import salesRoutes from "./sales.routes.js";
import dashboardRoutes from "./dashboard.routes.js";
import uploadsRoutes from "./uploads.routes.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/users", usersRoutes);
router.use("/roles", rolesRoutes);
router.use("/barbers", barbersRoutes);
router.use("/clients", clientsRoutes);
router.use("/services", servicesRoutes);
router.use("/packages", packagesRoutes);
router.use("/products", productsRoutes);
router.use("/schedules", schedulesRoutes);
router.use("/appointments", appointmentsRoutes);
router.use("/suppliers", suppliersRoutes);
router.use("/purchases", purchasesRoutes);
router.use("/sales", salesRoutes);
router.use("/dashboard", dashboardRoutes);
router.use("/uploads", uploadsRoutes);

export default router;
export {
  authRoutes,
  usersRoutes,
  rolesRoutes,
  barbersRoutes,
  clientsRoutes,
  servicesRoutes,
  packagesRoutes,
  productsRoutes,
  schedulesRoutes,
  appointmentsRoutes,
  suppliersRoutes,
  purchasesRoutes,
  salesRoutes,
  dashboardRoutes,
  uploadsRoutes
};

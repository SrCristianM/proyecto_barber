import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";
import swaggerUi from "swagger-ui-express";

import { env } from "./config/env.js";
import { isDatabaseConnected } from "./config/db.js";
import { mockStore } from "./config/mockStore.js";
import { errorHandler } from "./middlewares/errorHandler.middleware.js";
import { ApiError } from "./errors/apiError.js";
import { swaggerDocument } from "./docs/swagger.js";

// Importar rutas de la capa routes
import authRoutes from "./routes/auth.routes.js";
import usersRoutes from "./routes/users.routes.js";
import rolesRoutes from "./routes/roles.routes.js";
import barbersRoutes from "./routes/barbers.routes.js";
import clientsRoutes from "./routes/clients.routes.js";
import servicesRoutes from "./routes/services.routes.js";
import packagesRoutes from "./routes/packages.routes.js";
import productsRoutes from "./routes/products.routes.js";
import schedulesRoutes from "./routes/schedules.routes.js";
import appointmentsRoutes from "./routes/appointments.routes.js";
import suppliersRoutes from "./routes/suppliers.routes.js";
import purchasesRoutes from "./routes/purchases.routes.js";
import salesRoutes from "./routes/sales.routes.js";
import dashboardRoutes from "./routes/dashboard.routes.js";
import uploadsRoutes from "./routes/uploads.routes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// ==========================================
// MIDDLEWARES GLOBALES DE SEGURIDAD Y LOGS
// ==========================================
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
  })
);

app.use(
  cors({
    origin: true,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
  })
);

if (env.NODE_ENV !== "test") {
  app.use(morgan("dev"));
}

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Persistencia automática en disco local para operaciones que alteran datos cuando MySQL no está activo
app.use((req, res, next) => {
  if (["POST", "PUT", "PATCH", "DELETE"].includes(req.method)) {
    res.on("finish", () => {
      if (res.statusCode >= 200 && res.statusCode < 400 && !isDatabaseConnected()) {
        mockStore.saveToFile();
      }
    });
  }
  next();
});

// Servidor estático para archivos subidos
app.use("/uploads", express.static(path.resolve(__dirname, "../uploads")));

// ==========================================
// DOCUMENTACIÓN SWAGGER / OPENAPI
// ==========================================
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    environment: env.NODE_ENV
  });
});

// Ruta raíz informativa / redirección amigable a Swagger UI
app.get("/", (req, res) => {
  if (req.accepts("html")) {
    return res.redirect("/api/docs");
  }
  res.status(200).json({
    name: "Tu Turno Barber - API Backend",
    version: "1.0.0",
    status: "online",
    docs: "/api/docs",
    health: "/api/health"
  });
});

// ==========================================
// REGISTRO DE RUTAS DE LA APLICACIÓN
// ==========================================
app.use("/api/auth", authRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/roles", rolesRoutes);
app.use("/api/barbers", barbersRoutes);
app.use("/api/clients", clientsRoutes);
app.use("/api/services", servicesRoutes);
app.use("/api/packages", packagesRoutes);
app.use("/api/products", productsRoutes);
app.use("/api/schedules", schedulesRoutes);
app.use("/api/appointments", appointmentsRoutes);
app.use("/api/suppliers", suppliersRoutes);
app.use("/api/purchases", purchasesRoutes);
app.use("/api/sales", salesRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/uploads", uploadsRoutes);

// Ruta no encontrada (404)
app.use((req, res, next) => {
  next(ApiError.notFound(`Ruta no encontrada: [${req.method}] ${req.originalUrl}`));
});

// Middleware centralizado de manejo de errores
app.use(errorHandler);

export default app;

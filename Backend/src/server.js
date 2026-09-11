import app from "./app.js";
import { env } from "./config/env.js";
import { getDatabaseConnection } from "./config/db.js";
import { logger } from "./utils/logger.js";

const PORT = env.PORT;

async function startServer() {
  // Intentar conectar a la base de datos
  await getDatabaseConnection();

  const server = app.listen(PORT, () => {
    logger.info(`💈 Servidor "Tu Turno Barber" Backend ejecutándose en: http://localhost:${PORT}`);
    logger.info(`📚 Documentación Swagger UI disponible en: http://localhost:${PORT}/api/docs`);
    logger.info(`🩺 Endpoint de diagnóstico disponible en: http://localhost:${PORT}/api/health`);
  });

  // Manejo de apagado elegante (Graceful Shutdown)
  const shutdown = () => {
    logger.info("🛑 Cerrando servidor HTTP ordenadamente...");
    server.close(() => {
      logger.info("👋 Servidor apagado correctamente.");
      process.exit(0);
    });
  };

  process.on("SIGTERM", shutdown);
  process.on("SIGINT", shutdown);
}

startServer();

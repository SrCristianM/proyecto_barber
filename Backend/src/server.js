import os from "os";
import app from "./app.js";
import { env } from "./config/env.js";
import { getDatabaseConnection } from "./config/db.js";
import { logger } from "./utils/logger.js";

const PORT = env.PORT;

function getLocalIpAddresses() {
  const interfaces = os.networkInterfaces();
  const addresses = [];
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === "IPv4" && !iface.internal) {
        addresses.push({ name, ip: iface.address });
      }
    }
  }
  return addresses;
}

let tunnelRetries = 0;
const MAX_TUNNEL_RETRIES = 3;

async function initGlobalTunnel(port) {
  if (tunnelRetries >= MAX_TUNNEL_RETRIES) {
    logger.info("ℹ️ Túnel global pausado (modo local activo en http://localhost:3001).");
    return;
  }
  try {
    const localtunnel = (await import("localtunnel")).default;
    const tunnel = await localtunnel({ port, subdomain: "tuturnobarber-api-2026" });
    logger.info(`🌐 TÚNEL PÚBLICO GLOBAL ACTIVO: ${tunnel.url}/api (Acceso desde cualquier celular, datos móviles o Wi-Fi)`);
    tunnelRetries = 0;

    tunnel.on("close", () => {
      logger.info("ℹ️ El túnel público global se ha cerrado.");
    });

    tunnel.on("error", (err) => {
      logger.warn(`⚠️ Nota túnel: ${err.message}`);
    });
  } catch (err) {
    tunnelRetries++;
    logger.warn(`⚠️ Túnel público no disponible temporalmente (${err.message}). Continuando en modo local.`);
  }
}

async function startServer() {
  // Intentar conectar a la base de datos
  await getDatabaseConnection();

  const server = app.listen(PORT, "0.0.0.0", async () => {
    logger.info(`💈 Servidor "Tu Turno Barber" Backend ejecutándose en: http://localhost:${PORT}`);
    logger.info(`📚 Documentación Swagger UI disponible en: http://localhost:${PORT}/api/docs`);
    logger.info(`🩺 Endpoint de diagnóstico disponible en: http://localhost:${PORT}/api/health`);

    const localIps = getLocalIpAddresses();
    if (localIps.length > 0) {
      logger.info("📱 Direcciones IP de esta PC en la red local (Wi-Fi / Hotspot):");
      localIps.forEach(({ name, ip }) => {
        logger.info(`   👉 [${name}] http://${ip}:${PORT}/api`);
      });
    }

    if (process.env.DISABLE_TUNNEL !== "true" && env.NODE_ENV !== "production") {
      await initGlobalTunnel(PORT);
    }
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

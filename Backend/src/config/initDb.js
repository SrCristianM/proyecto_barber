import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import mysql from "mysql2/promise";
import { env } from "./env.js";
import { logger } from "../utils/logger.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function initializeDatabase() {
  const sqlPath = path.resolve(__dirname, "../../../Data_Base/Database.sql");
  if (!fs.existsSync(sqlPath)) {
    logger.error(`❌ Archivo SQL no encontrado en: ${sqlPath}`);
    return false;
  }

  logger.info(`📄 Leyendo esquema desde: ${sqlPath}`);
  const sqlContent = fs.readFileSync(sqlPath, "utf8");

  try {
    const connection = await mysql.createConnection({
      host: env.DB.HOST,
      port: env.DB.PORT,
      user: env.DB.USER,
      password: env.DB.PASSWORD,
      multipleStatements: true
    });

    logger.info(`🚀 Ejecutando script Database.sql en MySQL...`);
    await connection.query(sqlContent);
    await connection.end();
    logger.info(`✅ Base de datos barberia_db inicializada correctamente.`);
    return true;
  } catch (error) {
    logger.error(`❌ Error al inicializar base de datos: ${error.message}`);
    return false;
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  initializeDatabase().then(() => process.exit(0));
}

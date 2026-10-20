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
  let sqlContent = fs.readFileSync(sqlPath, "utf8");

  // Si la base de datos en la nube tiene otro nombre (por ejemplo 'railway' en Railway)
  if (env.DB.NAME && env.DB.NAME !== "barberia_db") {
    sqlContent = sqlContent.replace(/`barberia_db`/g, `\`${env.DB.NAME}\``);
  }

  try {
    let connection;
    try {
      connection = await mysql.createConnection({
        host: env.DB.HOST,
        port: env.DB.PORT,
        user: env.DB.USER,
        password: env.DB.PASSWORD,
        database: env.DB.NAME,
        multipleStatements: true
      });
    } catch (connErr) {
      if (connErr.code === "ER_BAD_DB_ERROR" || connErr.errno === 1049) {
        connection = await mysql.createConnection({
          host: env.DB.HOST,
          port: env.DB.PORT,
          user: env.DB.USER,
          password: env.DB.PASSWORD,
          multipleStatements: true
        });
      } else {
        throw connErr;
      }
    }

    logger.info(`🚀 Ejecutando script Database.sql en MySQL [${env.DB.HOST}:${env.DB.PORT}/${env.DB.NAME}]...`);
    await connection.query(sqlContent);
    await connection.end();
    logger.info(`✅ Base de datos ${env.DB.NAME} inicializada y sincronizada correctamente.`);
    return true;
  } catch (error) {
    logger.error(`❌ Error al inicializar base de datos: ${error.message}`);
    return false;
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  initializeDatabase().then(() => process.exit(0));
}

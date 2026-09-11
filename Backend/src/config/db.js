import mysql from "mysql2/promise";
import { env } from "./env.js";
import { logger } from "../utils/logger.js";

let pool = null;
let isConnected = false;

export async function getDatabaseConnection() {
  if (pool) return pool;

  try {
    pool = mysql.createPool({
      host: env.DB.HOST,
      port: env.DB.PORT,
      user: env.DB.USER,
      password: env.DB.PASSWORD,
      database: env.DB.NAME,
      waitForConnections: env.DB.WAIT_FOR_CONNECTIONS,
      connectionLimit: env.DB.CONNECTION_LIMIT,
      queueLimit: env.DB.QUEUE_LIMIT,
      enableKeepAlive: true,
      keepAliveInitialDelay: 10000
    });

    // Test ping
    const connection = await pool.getConnection();
    connection.release();
    isConnected = true;
    logger.info(`✅ Conectado exitosamente a MySQL [${env.DB.HOST}:${env.DB.PORT}/${env.DB.NAME}]`);
    return pool;
  } catch (error) {
    isConnected = false;
    logger.warn(`⚠️ No se pudo conectar a MySQL local (${error.message}).`);
    if (env.DB_MOCK_FALLBACK) {
      logger.info(`🔄 Activando capa de resiliencia / MockDataStore en memoria para desarrollo continuo.`);
    }
    return null;
  }
}

export function isDatabaseConnected() {
  return isConnected;
}

/**
 * Ejecuta una consulta SQL con parámetros preparados contra MySQL si está activo.
 */
export async function executeQuery(sql, params = []) {
  const p = await getDatabaseConnection();
  if (p && isConnected) {
    const [results] = await p.execute(sql, params);
    return results;
  }
  return null;
}

/**
 * Ejecuta un bloque de operaciones dentro de una transacción MySQL ACID.
 */
export async function executeTransaction(callback) {
  const p = await getDatabaseConnection();
  if (!p || !isConnected) {
    // Si no hay MySQL conectado, ejecuta la función directamente (en memoria)
    return await callback(null);
  }

  const connection = await p.getConnection();
  await connection.beginTransaction();
  try {
    const result = await callback(connection);
    await connection.commit();
    return result;
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
}

export default {
  getDatabaseConnection,
  isDatabaseConnected,
  executeQuery,
  executeTransaction
};

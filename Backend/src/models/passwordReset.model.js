/**
 * @file passwordReset.model.js
 * Repositorio de códigos de verificación temporales para restablecimiento de contraseña.
 * Gestiona expiración (TTL), intentos fallidos (prevención de fuerza bruta) y consumo único de códigos.
 */

import { executeQuery, isDatabaseConnected } from "../config/db.js";
import { logger } from "../utils/logger.js";

// Almacén en memoria y persistente
const memoryTokens = new Map();

export class PasswordResetRepository {
  /**
   * Asegura que la tabla exista en MySQL si la base de datos está conectada
   */
  static async ensureTable() {
    if (!isDatabaseConnected()) return;
    try {
      const sql = `
        CREATE TABLE IF NOT EXISTS recuperacion_contrasena (
          id INT AUTO_INCREMENT PRIMARY KEY,
          correo VARCHAR(120) NOT NULL,
          codigo VARCHAR(10) NOT NULL,
          expira_en BIGINT NOT NULL,
          intentos INT DEFAULT 0,
          utilizado TINYINT(1) DEFAULT 0,
          fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          INDEX idx_rc_correo (correo)
        )
      `;
      await executeQuery(sql);
    } catch (err) {
      logger.warn(`[PasswordResetRepository] No se pudo crear tabla en MySQL: ${err.message}`);
    }
  }

  /**
   * Guarda un código de verificación para un correo
   */
  static async saveCode(correo, codigo, ttlMinutes = 15) {
    const cleanEmail = correo.trim().toLowerCase();
    const cleanCode = String(codigo).trim();
    const expiraEn = Date.now() + ttlMinutes * 60 * 1000;

    // 1. Guardar en memoria
    memoryTokens.set(cleanEmail, {
      correo: cleanEmail,
      codigo: cleanCode,
      expira_en: expiraEn,
      intentos: 0,
      utilizado: false,
      creado_en: Date.now()
    });

    // 2. Persistir en base de datos si está conectada
    if (isDatabaseConnected()) {
      try {
        await this.ensureTable();
        // Invalidar códigos anteriores no utilizados
        await executeQuery(
          `UPDATE recuperacion_contrasena SET utilizado = 1 WHERE LOWER(correo) = ? AND utilizado = 0`,
          [cleanEmail]
        );
        // Insertar nuevo registro
        await executeQuery(
          `INSERT INTO recuperacion_contrasena (correo, codigo, expira_en, intentos, utilizado) VALUES (?, ?, ?, 0, 0)`,
          [cleanEmail, cleanCode, expiraEn]
        );
      } catch (err) {
        logger.warn(`[PasswordResetRepository] Error guardando código en MySQL: ${err.message}`);
      }
    }

    return true;
  }

  /**
   * Valida un código de verificación ingresado
   */
  static async verifyCode(correo, codigo) {
    const cleanEmail = correo.trim().toLowerCase();
    const cleanCode = String(codigo).trim();

    // 1. Verificar en base de datos primero si está activa
    if (isDatabaseConnected()) {
      try {
        await this.ensureTable();
        const rows = await executeQuery(
          `SELECT * FROM recuperacion_contrasena WHERE LOWER(correo) = ? ORDER BY id DESC LIMIT 1`,
          [cleanEmail]
        );

        if (rows && rows.length > 0) {
          const record = rows[0];

          if (record.utilizado === 1) {
            return {
              valid: false,
              message: "Este código de verificación ya ha sido utilizado. Solicita uno nuevo."
            };
          }

          if (Date.now() > Number(record.expira_en)) {
            return {
              valid: false,
              message: "El código de verificación ha expirado. Por favor solicita uno nuevo."
            };
          }

          if (record.intentos >= 5) {
            return {
              valid: false,
              message: "Has superado el límite de intentos permitidos. Solicita un nuevo código."
            };
          }

          if (record.codigo !== cleanCode) {
            await executeQuery(
              `UPDATE recuperacion_contrasena SET intentos = intentos + 1 WHERE id = ?`,
              [record.id]
            );
            const remaining = 5 - (record.intentos + 1);
            return {
              valid: false,
              message: `Código incorrecto. Te quedan ${remaining} ${remaining === 1 ? "intento" : "intentos"}.`
            };
          }

          // Código válido: marcar como utilizado
          await executeQuery(
            `UPDATE recuperacion_contrasena SET utilizado = 1 WHERE id = ?`,
            [record.id]
          );

          // Sincronizar memoria
          memoryTokens.delete(cleanEmail);

          return { valid: true };
        }
      } catch (err) {
        logger.warn(`[PasswordResetRepository] Error verificando en MySQL: ${err.message}`);
      }
    }

    // 2. Verificar en memoria
    const memRecord = memoryTokens.get(cleanEmail);
    if (!memRecord) {
      return {
        valid: false,
        message: "No hay ninguna solicitud activa para este correo. Por favor solicita un nuevo código."
      };
    }

    if (memRecord.utilizado) {
      return {
        valid: false,
        message: "Este código de verificación ya ha sido utilizado. Solicita uno nuevo."
      };
    }

    if (Date.now() > memRecord.expira_en) {
      memoryTokens.delete(cleanEmail);
      return {
        valid: false,
        message: "El código de verificación ha expirado. Por favor solicita uno nuevo."
      };
    }

    if (memRecord.intentos >= 5) {
      return {
        valid: false,
        message: "Has superado el límite de intentos permitidos. Solicita un nuevo código."
      };
    }

    if (memRecord.codigo !== cleanCode) {
      memRecord.intentos += 1;
      const remaining = 5 - memRecord.intentos;
      return {
        valid: false,
        message: `Código incorrecto. Te quedan ${remaining} ${remaining === 1 ? "intento" : "intentos"}.`
      };
    }

    // Código válido: marcar como consumido
    memRecord.utilizado = true;
    memoryTokens.delete(cleanEmail);

    return { valid: true };
  }
}

export default PasswordResetRepository;

/**
 * @file logger.js
 * Logger estructurado con timestamp y niveles para auditoría y observabilidad.
 */

export const logger = {
  info: (msg, meta) => {
    const time = new Date().toISOString();
    console.log(`\x1b[32m[INFO] ${time}\x1b[0m: ${msg}`, meta ? meta : "");
  },
  warn: (msg, meta) => {
    const time = new Date().toISOString();
    console.warn(`\x1b[33m[WARN] ${time}\x1b[0m: ${msg}`, meta ? meta : "");
  },
  error: (msg, error) => {
    const time = new Date().toISOString();
    console.error(`\x1b[31m[ERROR] ${time}\x1b[0m: ${msg}`, error ? error : "");
  },
  debug: (msg, meta) => {
    if (process.env.NODE_ENV !== "production") {
      const time = new Date().toISOString();
      console.debug(`\x1b[36m[DEBUG] ${time}\x1b[0m: ${msg}`, meta ? meta : "");
    }
  }
};

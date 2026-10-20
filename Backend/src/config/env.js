import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

let dbHost = process.env.DB_HOST || process.env.MYSQLHOST || "localhost";
let dbPort = Number(process.env.DB_PORT || process.env.MYSQLPORT) || 3306;
let dbName = process.env.DB_NAME || process.env.MYSQLDATABASE || "barberia_db";
let dbUser = process.env.DB_USER || process.env.MYSQLUSER || "root";
let dbPassword = process.env.DB_PASSWORD !== undefined ? process.env.DB_PASSWORD : (process.env.MYSQLPASSWORD || "");

const databaseUrl = process.env.DATABASE_URL || process.env.MYSQL_URL;
if (databaseUrl) {
  try {
    const parsed = new URL(databaseUrl);
    dbHost = parsed.hostname;
    dbPort = Number(parsed.port) || 3306;
    dbUser = decodeURIComponent(parsed.username);
    dbPassword = decodeURIComponent(parsed.password);
    const parsedPath = parsed.pathname.replace(/^\//, "");
    if (parsedPath) dbName = parsedPath;
  } catch {}
}

const rawCors = process.env.CORS_ORIGIN || "http://localhost:5173,http://localhost:3000";
const corsOrigins = rawCors === "*" ? "*" : rawCors.split(",").map((s) => s.trim());

export const env = {
  PORT: Number(process.env.PORT) || 3001,
  NODE_ENV: process.env.NODE_ENV || "development",
  DB: {
    HOST: dbHost,
    PORT: dbPort,
    NAME: dbName,
    USER: dbUser,
    PASSWORD: dbPassword,
    CONNECTION_LIMIT: Number(process.env.DB_CONNECTION_LIMIT) || 10,
    QUEUE_LIMIT: Number(process.env.DB_QUEUE_LIMIT) || 0,
    WAIT_FOR_CONNECTIONS: process.env.DB_WAIT_FOR_CONNECTIONS !== "false"
  },
  JWT: {
    SECRET: process.env.JWT_SECRET || "default_super_secret_barber_key_2026_change_me",
    EXPIRES_IN: process.env.JWT_EXPIRES_IN || "24h"
  },
  CORS_ORIGIN: corsOrigins,
  MAX_FILE_SIZE_MB: Number(process.env.MAX_FILE_SIZE_MB) || 5,
  UPLOAD_PATH: process.env.UPLOAD_PATH || "uploads",
  DB_MOCK_FALLBACK: process.env.DB_MOCK_FALLBACK === "true" || (process.env.NODE_ENV !== "production" && process.env.DB_MOCK_FALLBACK !== "false"),
  EMAIL: {
    HOST: process.env.SMTP_HOST || process.env.EMAIL_HOST || "",
    PORT: Number(process.env.SMTP_PORT || process.env.EMAIL_PORT) || 587,
    SECURE: process.env.SMTP_SECURE === "true" || process.env.EMAIL_SECURE === "true",
    USER: process.env.SMTP_USER || process.env.EMAIL_USER || "",
    PASS: process.env.SMTP_PASS || process.env.EMAIL_PASS || "",
    FROM: process.env.SMTP_FROM || process.env.EMAIL_FROM || '"Tu Turno Barber" <tuturnobarber@gmail.com>'
  }
};

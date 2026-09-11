import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

export const env = {
  PORT: process.env.PORT || 3001,
  NODE_ENV: process.env.NODE_ENV || "development",
  DB: {
    HOST: process.env.DB_HOST || "localhost",
    PORT: Number(process.env.DB_PORT) || 3306,
    NAME: process.env.DB_NAME || "barberia_db",
    USER: process.env.DB_USER || "root",
    PASSWORD: process.env.DB_PASSWORD || "",
    CONNECTION_LIMIT: Number(process.env.DB_CONNECTION_LIMIT) || 10,
    QUEUE_LIMIT: Number(process.env.DB_QUEUE_LIMIT) || 0,
    WAIT_FOR_CONNECTIONS: process.env.DB_WAIT_FOR_CONNECTIONS !== "false"
  },
  JWT: {
    SECRET: process.env.JWT_SECRET || "default_super_secret_barber_key_2026_change_me",
    EXPIRES_IN: process.env.JWT_EXPIRES_IN || "24h"
  },
  CORS_ORIGIN: (process.env.CORS_ORIGIN || "http://localhost:5173,http://localhost:3000").split(","),
  MAX_FILE_SIZE_MB: Number(process.env.MAX_FILE_SIZE_MB) || 5,
  UPLOAD_PATH: process.env.UPLOAD_PATH || "uploads",
  DB_MOCK_FALLBACK: process.env.DB_MOCK_FALLBACK === "true" || process.env.NODE_ENV !== "production"
};

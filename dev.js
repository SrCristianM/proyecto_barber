/**
 * @file dev.js
 * Lanzador unificado concurrente para "Tu Turno Barber".
 * Inicia el Backend (Express API en puerto 3001) y el Frontend (Vite en puerto 5173) simultáneamente,
 * canalizando logs con prefijos claros y manejando el cierre ordenado de ambos procesos.
 */

import { spawn } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isWindows = process.platform === "win32";
const npmCmd = isWindows ? "npm.cmd" : "npm";

console.log("\x1b[36m%s\x1b[0m", "============================================================");
console.log("\x1b[36m%s\x1b[0m", "🚀 INICIANDO 'TU TURNO BARBER' (BACKEND + FRONTEND)");
console.log("\x1b[36m%s\x1b[0m", "============================================================");

// 1. Iniciar Backend
const backendPath = path.resolve(__dirname, "Backend");
const backendProcess = spawn(npmCmd, ["run", "dev"], {
  cwd: backendPath,
  shell: true,
  stdio: "pipe",
  env: { ...process.env, FORCE_COLOR: "true" }
});

backendProcess.stdout.on("data", (data) => {
  const lines = data.toString().split("\n");
  for (const line of lines) {
    if (line.trim()) {
      console.log("\x1b[34m[BACKEND 3001]\x1b[0m " + line.trimEnd());
    }
  }
});

backendProcess.stderr.on("data", (data) => {
  const lines = data.toString().split("\n");
  for (const line of lines) {
    if (line.trim()) {
      console.error("\x1b[31m[BACKEND ERR]\x1b[0m " + line.trimEnd());
    }
  }
});

// 2. Iniciar Frontend
const frontendPath = path.resolve(__dirname, "frontend");
const frontendProcess = spawn(npmCmd, ["run", "dev"], {
  cwd: frontendPath,
  shell: true,
  stdio: "pipe",
  env: { ...process.env, FORCE_COLOR: "true" }
});

frontendProcess.stdout.on("data", (data) => {
  const lines = data.toString().split("\n");
  for (const line of lines) {
    if (line.trim()) {
      console.log("\x1b[32m[FRONTEND 5173]\x1b[0m " + line.trimEnd());
    }
  }
});

frontendProcess.stderr.on("data", (data) => {
  const lines = data.toString().split("\n");
  for (const line of lines) {
    if (line.trim()) {
      console.error("\x1b[33m[FRONTEND ERR]\x1b[0m " + line.trimEnd());
    }
  }
});

// 3. Manejo de apagado elegante (Ctrl + C)
function cleanup() {
  console.log("\n\x1b[36m%s\x1b[0m", "🛑 Deteniendo servidores Backend y Frontend...");
  if (isWindows) {
    if (backendProcess.pid) spawn("taskkill", ["/pid", backendProcess.pid, "/f", "/t"]);
    if (frontendProcess.pid) spawn("taskkill", ["/pid", frontendProcess.pid, "/f", "/t"]);
  } else {
    backendProcess.kill("SIGTERM");
    frontendProcess.kill("SIGTERM");
  }
  process.exit(0);
}

process.on("SIGINT", cleanup);
process.on("SIGTERM", cleanup);

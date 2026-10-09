/**
 * @file dev.js
 * Lanzador unificado concurrente para "Tu Turno Barber".
 * Inicia el Backend (Express API en puerto 3001) y el Frontend (Vite en puerto 5173) simultáneamente,
 * liberando puertos previamente ocupados para evitar EADDRINUSE, canalizando logs de forma limpia
 * y manejando el cierre ordenado de ambos procesos.
 */

import { spawn, execSync } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isWindows = process.platform === "win32";
const npmCmd = isWindows ? "npm.cmd" : "npm";

/**
 * Libera un puerto si está ocupado por un proceso huérfano previo.
 */
function freePort(port) {
  try {
    if (isWindows) {
      const output = execSync(`netstat -ano | findstr :${port}`, {
        encoding: "utf8",
        stdio: ["pipe", "pipe", "ignore"]
      });
      const lines = output.trim().split(/\r?\n/);
      const pids = new Set();
      for (const line of lines) {
        if (line.includes("LISTENING")) {
          const parts = line.trim().split(/\s+/);
          const pid = parts[parts.length - 1];
          if (pid && pid !== "0" && pid !== String(process.pid)) {
            pids.add(pid);
          }
        }
      }
      for (const pid of pids) {
        try {
          execSync(`taskkill /F /PID ${pid}`, { stdio: "ignore" });
          console.log(`\x1b[33m[SISTEMA]\x1b[0m Puerto ${port} liberado (proceso previo PID ${pid} cerrado).`);
        } catch (_) {}
      }
    } else {
      execSync(`fuser -k ${port}/tcp`, { stdio: "ignore" });
    }
  } catch (_) {
    // El puerto ya estaba libre
  }
}

console.log("\x1b[36m%s\x1b[0m", "============================================================");
console.log("\x1b[36m%s\x1b[0m", "🚀 INICIANDO 'TU TURNO BARBER' (BACKEND + FRONTEND)");
console.log("\x1b[36m%s\x1b[0m", "============================================================");

// Liberar puertos 3001 y 5173 preventivamente para evitar 'EADDRINUSE'
freePort(3001);
freePort(5173);

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
    const trimmed = line.trimEnd();
    if (trimmed) {
      console.log("\x1b[34m[BACKEND 3001]\x1b[0m " + trimmed);
    }
  }
});

backendProcess.stderr.on("data", (data) => {
  const lines = data.toString().split("\n");
  for (const line of lines) {
    const trimmed = line.trimEnd();
    if (!trimmed) continue;
    // Evitar marcar advertencias normales o notas de consola como error fatal
    if (
      trimmed.includes("[WARN]") ||
      trimmed.includes("[INFO]") ||
      trimmed.includes("ExperimentalWarning") ||
      trimmed.includes("DeprecationWarning")
    ) {
      console.log("\x1b[33m[BACKEND WARN]\x1b[0m " + trimmed);
    } else {
      console.error("\x1b[31m[BACKEND ERR]\x1b[0m " + trimmed);
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
    const trimmed = line.trimEnd();
    if (trimmed) {
      console.log("\x1b[32m[FRONTEND 5173]\x1b[0m " + trimmed);
    }
  }
});

frontendProcess.stderr.on("data", (data) => {
  const lines = data.toString().split("\n");
  for (const line of lines) {
    const trimmed = line.trimEnd();
    if (trimmed) {
      console.log("\x1b[33m[FRONTEND]\x1b[0m " + trimmed);
    }
  }
});

// 3. Manejo de apagado elegante (Ctrl + C)
function cleanup() {
  console.log("\n\x1b[36m%s\x1b[0m", "🛑 Deteniendo servidores Backend y Frontend...");
  if (isWindows) {
    if (backendProcess && backendProcess.pid) {
      try { spawn("taskkill", ["/pid", String(backendProcess.pid), "/f", "/t"]); } catch (_) {}
    }
    if (frontendProcess && frontendProcess.pid) {
      try { spawn("taskkill", ["/pid", String(frontendProcess.pid), "/f", "/t"]); } catch (_) {}
    }
    freePort(3001);
    freePort(5173);
  } else {
    try { backendProcess?.kill("SIGTERM"); } catch (_) {}
    try { frontendProcess?.kill("SIGTERM"); } catch (_) {}
  }
  process.exit(0);
}

process.on("SIGINT", cleanup);
process.on("SIGTERM", cleanup);


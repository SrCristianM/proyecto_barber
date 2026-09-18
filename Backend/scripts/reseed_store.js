import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { mockStore } from "../src/config/mockStore.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const storeFile = path.resolve(__dirname, "../data/db_store.json");

if (fs.existsSync(storeFile)) {
  fs.unlinkSync(storeFile);
}

mockStore.init();
mockStore.saveToFile();

console.log("✅ db_store.json regenerado exitosamente:");
console.log("- Total permisos base:", mockStore.permisos.length);
console.log("- Permisos de Administrador (rol 1):", mockStore.rol_permisos.filter((r) => r.id_rol === 1).length);
console.log("- Permisos de Recepcionista (rol 2):", mockStore.rol_permisos.filter((r) => r.id_rol === 2).length);

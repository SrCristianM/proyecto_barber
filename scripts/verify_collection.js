import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

const collectionPath = path.resolve(rootDir, "Tu_Turno_Barber_API.postman_collection.json");
const envPath = path.resolve(rootDir, "Tu_Turno_Barber_Environment.postman_environment.json");

console.log("============================================================");
console.log("🧪 INICIANDO VERIFICACIÓN DE LA SUITE POSTMAN CRUD");
console.log("============================================================");

// 1. Validar integridad de JSON
try {
  const colRaw = fs.readFileSync(collectionPath, "utf8");
  const envRaw = fs.readFileSync(envPath, "utf8");
  const col = JSON.parse(colRaw);
  const env = JSON.parse(envRaw);

  console.log(`✅ Colección JSON válida: "${col.info.name}" (${col.item.length} módulos)`);
  console.log(`✅ Entorno JSON válido: "${env.name}" (${env.values.length} variables)`);
} catch (err) {
  console.error("❌ Error de sintaxis JSON:", err.message);
  process.exit(1);
}

// 2. Ejecutar prueba de integración contra el servidor Backend
const BASE_URL = "http://localhost:3001/api";

async function runApiIntegrationTests() {
  console.log("\n🚀 Conectando con Backend en:", BASE_URL);

  let token = "";
  const results = [];

  async function testReq(title, endpoint, options = {}) {
    try {
      const url = `${BASE_URL}${endpoint}`;
      const headers = {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.headers || {})
      };

      const res = await fetch(url, { ...options, headers });
      const status = res.status;
      let body = null;
      try {
        body = await res.json();
      } catch (e) {
        body = await res.text();
      }

      const passed = status >= 200 && status < 300;
      results.push({ title, endpoint, status, passed });
      const symbol = passed ? "✅" : "❌";
      console.log(`${symbol} [${status}] ${title} -> ${endpoint}`);
      return { status, body, passed };
    } catch (err) {
      results.push({ title, endpoint, status: "CONN_ERR", passed: false, error: err.message });
      console.log(`❌ [CONN_ERR] ${title} -> ${err.message}`);
      return { passed: false, error: err.message };
    }
  }

  // TEST 1: Healthcheck
  await testReq("00. Health check", "/health");

  // TEST 2: Login Admin
  const loginRes = await testReq("00. Login Administrador", "/auth/login", {
    method: "POST",
    body: JSON.stringify({
      correo: "cristianmazo957@gmail.com",
      contrasena: "Admin123*"
    })
  });

  if (loginRes.body?.data?.token) {
    token = loginRes.body.data.token;
    console.log("   🔑 Token JWT obtenido exitosamente (Longitud:", token.length, ")");
  } else {
    console.error("   ❌ No se pudo obtener el token JWT para los siguientes tests.");
    process.exit(1);
  }

  // TEST 3: Auth Me (Perfil)
  await testReq("00. Perfil de Usuario", "/auth/me");

  // TEST 4: Usuarios
  await testReq("01. Listar Usuarios", "/users");

  // TEST 5: Roles y Permisos
  await testReq("02. Listar Roles", "/roles");
  await testReq("02. Matriz de Módulos y Permisos", "/roles/modules/matrix");

  // TEST 6: Clientes
  await testReq("03. Listar Clientes", "/clients");

  // TEST 7: Barberos
  await testReq("04. Listar Barberos", "/barbers");

  // TEST 8: Servicios y Categorías
  await testReq("05. Listar Servicios", "/services");
  await testReq("05. Categorías de Servicios", "/services/categories");

  // TEST 9: Paquetes Promocionales
  await testReq("06. Listar Paquetes", "/packages");

  // TEST 10: Productos
  await testReq("07. Listar Productos", "/products");
  await testReq("07. Categorías de Productos", "/products/categories");

  // TEST 11: Horarios y Disponibilidad
  await testReq("08. Listar Horarios", "/schedules");
  await testReq("08. Novedades de Horarios", "/schedules/novelties");

  // TEST 12: Citas
  await testReq("09. Listar Citas", "/appointments");

  // TEST 13: Proveedores
  await testReq("10. Listar Proveedores", "/suppliers");

  // TEST 14: Compras
  await testReq("11. Listar Compras", "/purchases");

  // TEST 15: Ventas
  await testReq("12. Listar Ventas", "/sales");

  // TEST 16: Dashboard
  await testReq("13. Métricas Generales Dashboard", "/dashboard");
  await testReq("13. Dashboard Admin", "/dashboard/admin");

  console.log("\n============================================================");
  const total = results.length;
  const passedCount = results.filter((r) => r.passed).length;
  console.log(`📊 RESUMEN DE PRUEBAS: ${passedCount}/${total} pasadas (${Math.round((passedCount / total) * 100)}%)`);
  console.log("============================================================");

  if (passedCount === total) {
    console.log("🎉 ¡TODOS LOS MÓDULOS DE LA API RESPONDEN EXITOSAMENTE (100% OK)!");
  } else {
    console.warn("⚠️ Algunas pruebas no pasaron. Revisa los detalles arriba.");
  }
}

runApiIntegrationTests();

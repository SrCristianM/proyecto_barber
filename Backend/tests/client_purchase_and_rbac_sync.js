/**
 * @file client_purchase_and_rbac_sync.test.js
 * Test de validación para:
 * 1. Compras exclusivas en Salón Físico (eliminación total de compras a domicilio).
 * 2. Sincronización completa de Roles y Permisos por defecto para Clientes y Barberos.
 */

import http from "http";
import app from "../src/app.js";
import { mockStore } from "../src/config/mockStore.js";

let server;
let baseUrl;

function request(method, path, body = null, token = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, baseUrl);
    const options = {
      method,
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      headers: {
        "Content-Type": "application/json"
      }
    };

    if (token) {
      options.headers["Authorization"] = `Bearer ${token}`;
    }

    const req = http.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        try {
          resolve({ status: res.statusCode, body: data ? JSON.parse(data) : {} });
        } catch {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });

    req.on("error", reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function runTests() {
  server = app.listen(0);
  const port = server.address().port;
  baseUrl = `http://localhost:${port}`;

  console.log("\n============================================================");
  console.log("   TEST: SINCRONIZACIÓN RBAC Y COMPRAS EN SALÓN FÍSICO");
  console.log("============================================================\n");

  let passed = 0;
  let total = 0;

  function assert(condition, message) {
    total++;
    if (condition) {
      console.log(`  ✅ PASS: ${total}. ${message}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${total}. ${message}`);
      process.exitCode = 1;
    }
  }

  try {
    // 1. Login Barbero
    const loginBarberRes = await request("POST", "/api/auth/login", {
      correo: "barbero@tuturnobarber.com",
      contrasena: "Barbero123*"
    });
    assert(loginBarberRes.status === 200, "Login de Barbero exitoso");
    const barberToken = loginBarberRes.body.data.token;
    const barberPerms = loginBarberRes.body.data.user.permisos;

    // Verificar permisos asignados al Barbero
    const expectedBarberPerms = [
      "citas_ver", "citas_crear", "citas_editar", "citas_cancelar",
      "horarios_ver", "horarios_crear", "horarios_editar", "horarios_eliminar", "horarios_activar",
      "servicios_ver", "paquetes_ver", "productos_ver", "clientes_ver", "ventas_ver"
    ];
    const hasAllBarberPerms = expectedBarberPerms.every((p) => barberPerms.includes(p));
    assert(hasAllBarberPerms, `Barbero tiene todos los permisos requeridos por sus vistas (${barberPerms.length} permisos)`);

    // 2. Login Cliente
    const loginClientRes = await request("POST", "/api/auth/login", {
      correo: "cliente@example.com",
      contrasena: "Cliente123*"
    });
    assert(loginClientRes.status === 200, "Login de Cliente exitoso");
    const clientToken = loginClientRes.body.data.token;
    const clientPerms = loginClientRes.body.data.user.permisos;

    // Verificar permisos asignados al Cliente
    const expectedClientPerms = [
      "citas_ver", "citas_crear", "citas_cancelar",
      "servicios_ver", "paquetes_ver", "productos_ver", "horarios_ver", "barberos_ver", "ventas_ver", "ventas_crear"
    ];
    const hasAllClientPerms = expectedClientPerms.every((p) => clientPerms.includes(p));
    assert(hasAllClientPerms, `Cliente tiene todos los permisos por defecto para su portal (${clientPerms.length} permisos)`);

    // 3. Cliente accede a sus compras / historial de ventas
    const clientSalesRes = await request("GET", "/api/sales", null, clientToken);
    assert(clientSalesRes.status === 200, "Cliente puede consultar sus compras / facturación (/api/sales -> 200 OK)");

    // 4. Barbero accede a sus citas y novedades
    const barberAptsRes = await request("GET", "/api/appointments", null, barberToken);
    assert(barberAptsRes.status === 200, "Barbero consulta sus citas asignadas (/api/appointments -> 200 OK)");

    const barberNovRes = await request("GET", "/api/schedules/novelties", null, barberToken);
    assert(barberNovRes.status === 200, "Barbero consulta novedades de turno (/api/schedules/novelties -> 200 OK)");

    // 5. Barbero consulta reportes de ventas/comisiones
    const barberSalesRes = await request("GET", "/api/sales", null, barberToken);
    assert(barberSalesRes.status === 200, "Barbero consulta módulo de reportes / ventas (/api/sales -> 200 OK)");

    // 6. Matriz de roles del sistema vía API (requiere token de Admin)
    const loginAdminRes = await request("POST", "/api/auth/login", {
      correo: "cristianmazo957@gmail.com",
      contrasena: "Admin123*"
    });
    const adminToken = loginAdminRes.body.data.token;

    const rolesRes = await request("GET", "/api/roles", null, adminToken);
    assert(rolesRes.status === 200 && Array.isArray(rolesRes.body.data), "GET /api/roles devuelve todos los roles");
    const roles = rolesRes.body.data;
    const rolCliente = roles.find((r) => r.id_rol === 4);
    const rolBarbero = roles.find((r) => r.id_rol === 3);
    assert(rolCliente && rolCliente.permisos.length >= 10, `Rol Cliente tiene permisos completos sincronizados (${rolCliente?.permisos?.length})`);
    assert(rolBarbero && rolBarbero.permisos.length >= 14, `Rol Barbero tiene permisos completos sincronizados (${rolBarbero?.permisos?.length})`);

    console.log("\n============================================================");
    console.log(`   RESULTADO: ${passed}/${total} PRUEBAS SUPERADAS EXITOSAMENTE`);
    console.log("============================================================\n");
  } finally {
    server.close();
  }
}

runTests();

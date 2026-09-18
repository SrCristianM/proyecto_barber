/**
 * @file dynamic_rbac_integration.test.js
 * Prueba integral automatizada de RBAC dinámico:
 * 1. Verifica login de Admin y Recepcionista.
 * 2. Verifica bloqueo 403 en endpoints no autorizados inicialmente.
 * 3. Modifica permisos del rol mediante el endpoint de administración de roles (PUT /api/roles/:id).
 * 4. Demuestra que el usuario con ese rol obtiene acceso INMEDIATAMENTE sin re-login.
 * 5. Revoca el permiso y comprueba que se vuelve a bloquear con 403 Forbidden al instante.
 * 6. Verifica que el Administrador (id_rol: 1) mantiene bypass total (*) en todas las rutas.
 * 7. Restaura los permisos iniciales.
 */

import request from "supertest";
import assert from "assert";
import app from "../src/app.js";

async function runDynamicRBACTest() {
  console.log("\n============================================================");
  console.log("   TEST DE INTEGRACIÓN: RBAC DINÁMICO FRONTEND/BACKEND      ");
  console.log("============================================================\n");

  let totalTests = 0;
  let passedTests = 0;

  async function test(description, fn) {
    totalTests++;
    try {
      await fn();
      passedTests++;
      console.log(`  ✅ PASS: ${description}`);
    } catch (err) {
      console.error(`  ❌ FAIL: ${description}`);
      console.error(`     Error: ${err.message}`);
      throw err;
    }
  }

  let adminToken = "";
  let recToken = "";
  let initialRecPermissions = [];

  // Paso 1: Autenticación
  await test("1. Login de Administrador (id_rol: 1)", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ correo: "cristianmazo957@gmail.com", contrasena: "Admin123*" });
    assert.strictEqual(res.status, 200);
    adminToken = res.body.data.token;
    assert.ok(adminToken, "Token admin obtenido");
  });

  await test("2. Login de Recepcionista (id_rol: 2)", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ correo: "maria@example.com", contrasena: "Recepcionista123*" });
    assert.strictEqual(res.status, 200);
    recToken = res.body.data.token;
    assert.strictEqual(Number(res.body.data.user.id_rol), 2);
    assert.ok(recToken, "Token recepcionista obtenido");
  });

  const adminHeaders = { Authorization: `Bearer ${adminToken}` };
  const recHeaders = { Authorization: `Bearer ${recToken}` };

  // Paso 2: Obtener permisos actuales del rol Recepcionista (id: 2)
  await test("3. Obtener rol Recepcionista actual", async () => {
    const res = await request(app)
      .get("/api/roles/2")
      .set(adminHeaders);
    assert.strictEqual(res.status, 200);
    initialRecPermissions = res.body.data.permisos || [];
    console.log(`     Permisos iniciales de Recepcionista: ${initialRecPermissions.length}`);
  });

  // Paso 3: Verificar que Recepcionista NO puede crear proveedores inicialmente (403 Forbidden)
  await test("4. Recepcionista intenta crear Proveedor sin permiso -> 403 Forbidden", async () => {
    const res = await request(app)
      .post("/api/suppliers")
      .set(recHeaders)
      .send({
        nombre: "Proveedor Test RBAC",
        nit: "901234567-8",
        telefono: "3009998877",
        correo: "proveedor.rbac@test.com"
      });
    assert.strictEqual(res.status, 403, `Esperado 403, recibido ${res.status}`);
    assert.strictEqual(res.body.success, false);
  });

  // Paso 4: Administrador otorga dinámicamente el permiso 'proveedores:crear' al Rol Recepcionista
  await test("5. Admin otorga 'proveedores:crear' al Rol Recepcionista (PUT /api/roles/2)", async () => {
    const updatedPerms = Array.from(new Set([...initialRecPermissions, "proveedores:crear"]));
    const res = await request(app)
      .put("/api/roles/2")
      .set(adminHeaders)
      .send({
        nombre_rol: "Recepcionista",
        descripcion: "Atención al cliente y gestión de citas",
        permisos: updatedPerms
      });
    assert.strictEqual(res.status, 200);
  });

  // Paso 5: Recepcionista intenta crear Proveedor usando el MISMO TOKEN previo -> Ahora pasa el RBAC middleware
  let createdSupplierId = null;
  await test("6. Recepcionista crea Proveedor con mismo token (RBAC dinámico en vivo) -> 201 Created", async () => {
    const res = await request(app)
      .post("/api/suppliers")
      .set(recHeaders)
      .send({
        nombre: "Proveedor Test RBAC Dinámico",
        nit: "901234567-9",
        telefono: "3009998877",
        correo: "proveedor.dinamico@test.com"
      });
    assert.strictEqual(res.status, 201, `Esperado 201, recibido ${res.status}: ${JSON.stringify(res.body)}`);
    createdSupplierId = res.body.data?.id_proveedor;
    assert.ok(createdSupplierId, "Proveedor creado con éxito por Recepcionista");
  });

  // Paso 6: Administrador REVOCA 'proveedores:crear' del Rol Recepcionista
  await test("7. Admin revoca 'proveedores:crear' del Rol Recepcionista (PUT /api/roles/2)", async () => {
    const filteredPerms = initialRecPermissions.filter((p) => p !== "proveedores:crear");
    const res = await request(app)
      .put("/api/roles/2")
      .set(adminHeaders)
      .send({
        nombre_rol: "Recepcionista",
        descripcion: "Atención al cliente y gestión de citas",
        permisos: filteredPerms
      });
    assert.strictEqual(res.status, 200);
  });

  // Paso 7: Recepcionista intenta crear Proveedor otra vez -> INMEDIATAMENTE 403 Forbidden
  await test("8. Recepcionista intenta crear Proveedor tras revocación -> 403 Forbidden inmediato", async () => {
    const res = await request(app)
      .post("/api/suppliers")
      .set(recHeaders)
      .send({
        nombre: "Proveedor Intento Ilegal",
        nit: "901234567-0",
        telefono: "3009998877",
        correo: "proveedor.ilegal@test.com"
      });
    assert.strictEqual(res.status, 403, `Esperado 403, recibido ${res.status}`);
  });

  // Paso 8: Comprobar bypass total del Administrador en cualquier acción
  await test("9. Administrador tiene bypass total (*) en productos, usuarios y roles", async () => {
    const resUsers = await request(app).get("/api/users").set(adminHeaders);
    assert.strictEqual(resUsers.status, 200);

    const resRoles = await request(app).get("/api/roles").set(adminHeaders);
    assert.strictEqual(resRoles.status, 200);

    const resProducts = await request(app).get("/api/products").set(adminHeaders);
    assert.strictEqual(resProducts.status, 200);
  });

  // Paso 9: Limpieza - Eliminar proveedor de prueba y restaurar permisos originales
  await test("10. Limpieza: restaurar permisos originales de Recepcionista y eliminar datos de test", async () => {
    if (createdSupplierId) {
      await request(app).delete(`/api/suppliers/${createdSupplierId}`).set(adminHeaders);
    }
    const res = await request(app)
      .put("/api/roles/2")
      .set(adminHeaders)
      .send({
        nombre_rol: "Recepcionista",
        descripcion: "Atención al cliente y gestión de citas",
        permisos: initialRecPermissions
      });
    assert.strictEqual(res.status, 200);
  });

  console.log(`\n============================================================`);
  console.log(`   RESULTADO: ${passedTests}/${totalTests} PRUEBAS SUPERADAS EXITOSAMENTE `);
  console.log(`============================================================\n`);
}

runDynamicRBACTest()
  .then(() => {
    process.exit(0);
  })
  .catch((err) => {
    console.error("Test suite failed:", err);
    process.exit(1);
  });

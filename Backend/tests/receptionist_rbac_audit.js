/**
 * @file receptionist_rbac_audit.js
 * Suite integral de auditoría de seguridad y RBAC para el ROL RECEPCIONISTA (id_rol: 2)
 * Valida que las operaciones permitidas respondan exitosamente (200/201)
 * y que las operaciones restringidas sean estrictamente bloqueadas (403 Forbidden).
 */

import request from "supertest";
import assert from "assert";
import app from "../src/app.js";

async function runAudit() {
  console.log("\n=======================================================");
  console.log("   AUDITORÍA DE SEGURIDAD Y RBAC - ROL RECEPCIONISTA   ");
  console.log("=======================================================\n");

  let totalTests = 0;
  let passedTests = 0;

  function test(description, fn) {
    totalTests++;
    return fn()
      .then(() => {
        passedTests++;
        console.log(`  ✅ PASS: ${description}`);
      })
      .catch((err) => {
        console.error(`  ❌ FAIL: ${description}`);
        console.error(`     Error: ${err.message}`);
      });
  }

  // 1. AUTENTICACIÓN
  let recToken = "";
  let adminToken = "";

  await test("1. Login como Recepcionista (maria@example.com)", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ correo: "maria@example.com", contrasena: "Recepcionista123*" });

    assert.strictEqual(res.status, 200, `Status esperado 200, obtenido ${res.status}`);
    assert.strictEqual(res.body.success, true, "Respuesta success debe ser true");
    assert.strictEqual(Number(res.body.data.user.id_rol), 2, "id_rol debe ser 2 (Recepcionista)");
    recToken = res.body.data.token;
    assert.ok(recToken, "Token JWT debe existir");
  });

  await test("2. Login como Administrador (cristianmazo957@gmail.com)", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ correo: "cristianmazo957@gmail.com", contrasena: "Admin123*" });

    assert.strictEqual(res.status, 200, `Status esperado 200, obtenido ${res.status}`);
    adminToken = res.body.data.token;
  });

  const recHeaders = { Authorization: `Bearer ${recToken}` };

  console.log("\n--- BLOQUE 1: PRUEBAS DE SEGURIDAD (ACCIONES PROHIBIDAS A RECEPCIONISTA -> 403) ---");

  await test("3. Recepcionista intenta POST /api/roles -> Debe ser 403 Forbidden", async () => {
    const res = await request(app)
      .post("/api/roles")
      .set(recHeaders)
      .send({ nombre_rol: "Rol Ilegal", descripcion: "No permitido" });
    assert.strictEqual(res.status, 403, `Esperado 403, obtenido ${res.status}`);
  });

  await test("4. Recepcionista intenta PUT /api/roles/:id -> Debe ser 403 Forbidden", async () => {
    const res = await request(app)
      .put("/api/roles/1")
      .set(recHeaders)
      .send({ nombre_rol: "Nuevo Nombre" });
    assert.strictEqual(res.status, 403, `Esperado 403, obtenido ${res.status}`);
  });

  await test("5. Recepcionista intenta DELETE /api/roles/:id -> Debe ser 403 Forbidden", async () => {
    const res = await request(app)
      .delete("/api/roles/99")
      .set(recHeaders);
    assert.strictEqual(res.status, 403, `Esperado 403, obtenido ${res.status}`);
  });

  await test("6. Recepcionista intenta POST /api/users -> Debe ser 403 Forbidden", async () => {
    const res = await request(app)
      .post("/api/users")
      .set(recHeaders)
      .send({
        nombre: "Test",
        apellido: "User",
        correo: "test@example.com",
        contrasena: "Password123*",
        id_rol: 1
      });
    assert.strictEqual(res.status, 403, `Esperado 403, obtenido ${res.status}`);
  });

  await test("7. Recepcionista intenta PUT /api/users/:id -> Debe ser 403 Forbidden", async () => {
    const res = await request(app)
      .put("/api/users/1")
      .set(recHeaders)
      .send({ nombre: "Hack" });
    assert.strictEqual(res.status, 403, `Esperado 403, obtenido ${res.status}`);
  });

  await test("8. Recepcionista intenta PATCH /api/users/:id/status -> Debe ser 403 Forbidden", async () => {
    const res = await request(app)
      .patch("/api/users/1/status")
      .set(recHeaders)
      .send({ estado: 0 });
    assert.strictEqual(res.status, 403, `Esperado 403, obtenido ${res.status}`);
  });

  await test("9. Recepcionista intenta DELETE /api/users/:id -> Debe ser 403 Forbidden", async () => {
    const res = await request(app)
      .delete("/api/users/1")
      .set(recHeaders);
    assert.strictEqual(res.status, 403, `Esperado 403, obtenido ${res.status}`);
  });

  await test("10. Recepcionista intenta POST /api/suppliers (Crear Proveedor) -> Debe ser 403 Forbidden", async () => {
    const res = await request(app)
      .post("/api/suppliers")
      .set(recHeaders)
      .send({
        nombre: "Proveedor Ilegal",
        nit: "900999888-1",
        telefono: "3001112233",
        correo: "proveedor@test.com"
      });
    assert.strictEqual(res.status, 403, `Esperado 403, obtenido ${res.status}`);
  });

  await test("11. Recepcionista intenta PUT /api/suppliers/:id (Editar Proveedor) -> Debe ser 403 Forbidden", async () => {
    const res = await request(app)
      .put("/api/suppliers/1")
      .set(recHeaders)
      .send({ nombre: "Nombre Modificado" });
    assert.strictEqual(res.status, 403, `Esperado 403, obtenido ${res.status}`);
  });

  await test("12. Recepcionista intenta PATCH /api/suppliers/:id/status -> Debe ser 403 Forbidden", async () => {
    const res = await request(app)
      .patch("/api/suppliers/1/status")
      .set(recHeaders)
      .send({ estado: 0 });
    assert.strictEqual(res.status, 403, `Esperado 403, obtenido ${res.status}`);
  });

  console.log("\n--- BLOQUE 2: PRUEBAS FUNCIONALES (ACCIONES AUTORIZADAS SEGÚN HISTORY MAPPING) ---");

  await test("13. Recepcionista consulta Dashboard (GET /api/dashboard) -> 200 OK", async () => {
    const res = await request(app).get("/api/dashboard").set(recHeaders);
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
  });

  await test("14. Recepcionista lista Barberos (GET /api/barbers) -> 200 OK", async () => {
    const res = await request(app).get("/api/barbers").set(recHeaders);
    assert.strictEqual(res.status, 200);
  });

  await test("15. Recepcionista lista Horarios (GET /api/schedules) -> 200 OK", async () => {
    const res = await request(app).get("/api/schedules").set(recHeaders);
    assert.strictEqual(res.status, 200);
  });

  await test("16. Recepcionista lista Novedades (GET /api/schedules/novelties) -> 200 OK", async () => {
    const res = await request(app).get("/api/schedules/novelties").set(recHeaders);
    assert.strictEqual(res.status, 200);
  });

  await test("17. Recepcionista lista Proveedores (GET /api/suppliers) -> 200 OK", async () => {
    const res = await request(app).get("/api/suppliers").set(recHeaders);
    assert.strictEqual(res.status, 200);
  });

  await test("18. Recepcionista lista Compras (GET /api/purchases) -> 200 OK", async () => {
    const res = await request(app).get("/api/purchases").set(recHeaders);
    assert.strictEqual(res.status, 200);
  });

  await test("19. Recepcionista lista Productos (GET /api/products) -> 200 OK", async () => {
    const res = await request(app).get("/api/products").set(recHeaders);
    assert.strictEqual(res.status, 200);
  });

  await test("20. Recepcionista lista Servicios (GET /api/services) -> 200 OK", async () => {
    const res = await request(app).get("/api/services").set(recHeaders);
    assert.strictEqual(res.status, 200);
  });

  await test("21. Recepcionista lista Paquetes (GET /api/packages) -> 200 OK", async () => {
    const res = await request(app).get("/api/packages").set(recHeaders);
    assert.strictEqual(res.status, 200);
  });

  await test("22. Recepcionista lista Clientes (GET /api/clients) -> 200 OK", async () => {
    const res = await request(app).get("/api/clients").set(recHeaders);
    assert.strictEqual(res.status, 200);
  });

  await test("23. Recepcionista lista Ventas (GET /api/sales) -> 200 OK", async () => {
    const res = await request(app).get("/api/sales").set(recHeaders);
    assert.strictEqual(res.status, 200);
  });

  await test("24. Recepcionista lista Citas (GET /api/appointments) -> 200 OK", async () => {
    const res = await request(app).get("/api/appointments").set(recHeaders);
    assert.strictEqual(res.status, 200);
  });

  await test("25. Recepcionista crea Cliente (POST /api/clients) -> 201 Created", async () => {
    const res = await request(app)
      .post("/api/clients")
      .set(recHeaders)
      .send({
        nombre: `ClienteRec_${Date.now()}`,
        apellido: "Prueba",
        correo: `clienterec_${Date.now()}@test.com`,
        telefono: "+57 311 000 1122",
        direccion: "Calle 100 #20-30"
      });
    assert.strictEqual(res.status, 201, `Status obtenido ${res.status}: ${JSON.stringify(res.body)}`);
  });

  await test("26. Recepcionista crea Categoría de Producto (POST /api/products/categories) -> 201 Created", async () => {
    const res = await request(app)
      .post("/api/products/categories")
      .set(recHeaders)
      .send({
        nombre: `CatProdRec_${Date.now()}`
      });
    assert.strictEqual(res.status, 201, `Status obtenido ${res.status}: ${JSON.stringify(res.body)}`);
  });

  await test("27. Recepcionista crea Categoría de Servicio (POST /api/services/categories) -> 201 Created", async () => {
    const res = await request(app)
      .post("/api/services/categories")
      .set(recHeaders)
      .send({
        nombre: `CatServRec_${Date.now()}`
      });
    assert.strictEqual(res.status, 201, `Status obtenido ${res.status}: ${JSON.stringify(res.body)}`);
  });

  await test("28. Recepcionista crea Servicio (POST /api/services) -> 201 Created", async () => {
    const res = await request(app)
      .post("/api/services")
      .set(recHeaders)
      .send({
        nombre: `ServicioRec_${Date.now()}`,
        id_categoria_servicio: 1,
        duracion_minutos: 40,
        precio: 22000
      });
    assert.strictEqual(res.status, 201, `Status obtenido ${res.status}: ${JSON.stringify(res.body)}`);
  });

  await test("29. Recepcionista elimina Proveedor (DELETE /api/suppliers/:id) -> 200 OK según History Mapping", async () => {
    // 1. Admin crea un proveedor de prueba
    const createRes = await request(app)
      .post("/api/suppliers")
      .set({ Authorization: `Bearer ${adminToken}` })
      .send({
        nombre: `ProveedorParaBorrar_${Date.now()}`,
        nit: `900${Date.now().toString().slice(-6)}-1`,
        telefono: "3009998877",
        correo: `prov_${Date.now()}@test.com`,
        direccion: "Calle 1 #2-3"
      });
    assert.strictEqual(createRes.status, 201, `Admin debe poder crear proveedor (status ${createRes.status})`);
    const supplierId = createRes.body.data.id_proveedor;

    // 2. Recepcionista lo elimina (Permitido por History Mapping)
    const deleteRes = await request(app)
      .delete(`/api/suppliers/${supplierId}`)
      .set(recHeaders);
    assert.strictEqual(deleteRes.status, 200, `Recepcionista debe poder eliminar proveedor (status ${deleteRes.status})`);
    assert.strictEqual(deleteRes.body.success, true);
  });

  console.log("\n=======================================================");
  console.log(`RESULTADO DE AUDITORÍA: ${passedTests} / ${totalTests} PRUEBAS EXITOSAS`);
  console.log("=======================================================\n");

  if (passedTests !== totalTests) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runAudit().catch((e) => {
  console.error("FATAL ERROR EN AUDITORIA:", e);
  process.exit(1);
});

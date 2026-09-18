import assert from "node:assert";
import request from "supertest";
import app from "../src/app.js";

async function runBarberRBACTest() {
  console.log("\n============================================================");
  console.log("   TEST DE INTEGRACIÓN: RBAC BARBERO BACKEND/FRONTEND        ");
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
  let barberToken = "";
  let initialBarberPermissions = [];

  // Paso 1: Autenticación Admin
  await test("1. Login de Administrador (id_rol: 1)", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ correo: "cristianmazo957@gmail.com", contrasena: "Admin123*" });
    assert.strictEqual(res.status, 200);
    adminToken = res.body.data.token;
    assert.ok(adminToken);
  });

  // Paso 2: Autenticación Barbero
  await test("2. Login de Barbero (id_rol: 3)", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ correo: "barbero@tuturnobarber.com", contrasena: "Barbero123*" });
    assert.strictEqual(res.status, 200);
    barberToken = res.body.data.token;
    assert.strictEqual(Number(res.body.data.user.id_rol), 3);
    assert.ok(barberToken);
  });

  const adminHeaders = { Authorization: `Bearer ${adminToken}` };
  const barberHeaders = { Authorization: `Bearer ${barberToken}` };

  // Paso 3: Obtener permisos actuales del Barbero
  await test("3. Obtener rol Barbero actual", async () => {
    const res = await request(app).get("/api/roles/3").set(adminHeaders);
    assert.strictEqual(res.status, 200);
    initialBarberPermissions = res.body.data.permisos.map((p) => p.id_permiso);
    console.log(`     Permisos iniciales de Barbero: ${initialBarberPermissions.length}`);
  });

  // Paso 4: Barbero consulta citas con permiso (GET /api/appointments)
  await test("4. Barbero consulta sus citas asignadas -> 200 OK", async () => {
    const res = await request(app).get("/api/appointments").set(barberHeaders);
    assert.strictEqual(res.status, 200);
  });

  // Paso 5: Barbero consulta novedades de horarios con permiso (GET /api/schedules/novelties)
  await test("5. Barbero consulta novedades de horario con permiso -> 200 OK", async () => {
    const res = await request(app).get("/api/schedules/novelties").set(barberHeaders);
    assert.strictEqual(res.status, 200);
  });

  // Paso 6: Admin revoca 'horarios:ver' (id_permiso: 25) y 'horarios:crear' (id_permiso: 26) del Barbero
  await test("6. Admin revoca permisos de horarios del Barbero (PUT /api/roles/3)", async () => {
    const updatedPerms = initialBarberPermissions.filter((id) => id !== 25 && id !== 26);
    const res = await request(app)
      .put("/api/roles/3")
      .set(adminHeaders)
      .send({
        nombre_rol: "Barbero",
        descripcion: "Consulta de horarios y citas asignadas",
        permisos: updatedPerms
      });
    assert.strictEqual(res.status, 200);
  });

  // Paso 7: Barbero intenta consultar novedades tras revocación -> 403 Forbidden
  await test("7. Barbero intenta consultar novedades tras revocación -> 403 Forbidden inmediato", async () => {
    const res = await request(app).get("/api/schedules/novelties").set(barberHeaders);
    assert.strictEqual(res.status, 403);
  });

  // Paso 8: Barbero intenta crear novedad tras revocación -> 403 Forbidden
  await test("8. Barbero intenta crear novedad tras revocación -> 403 Forbidden inmediato", async () => {
    const res = await request(app)
      .post("/api/schedules/novelties")
      .set(barberHeaders)
      .send({
        id_barbero: 1,
        tipo: "Incapacidad",
        fecha_inicio: "2026-10-01",
        fecha_fin: "2026-10-02",
        motivo: "Cita médica"
      });
    assert.strictEqual(res.status, 403);
  });

  // Paso 9: Limpieza - Restaurar permisos originales del Barbero
  await test("9. Limpieza: restaurar permisos originales de Barbero", async () => {
    const res = await request(app)
      .put("/api/roles/3")
      .set(adminHeaders)
      .send({
        nombre_rol: "Barbero",
        descripcion: "Consulta de horarios y citas asignadas",
        permisos: initialBarberPermissions
      });
    assert.strictEqual(res.status, 200);
  });

  console.log(`\n============================================================`);
  console.log(`   RESULTADO: ${passedTests}/${totalTests} PRUEBAS SUPERADAS EXITOSAMENTE `);
  console.log(`============================================================\n`);
}

runBarberRBACTest()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Test suite failed:", err);
    process.exit(1);
  });

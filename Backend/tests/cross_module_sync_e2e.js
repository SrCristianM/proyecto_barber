import request from "supertest";
import assert from "node:assert";
import app from "../src/app.js";

async function runEndToEndCrossModuleTest() {
  console.log("\n============================================================");
  console.log("   PRUEBA INTEGRAL END-TO-END DE SINCRONIZACIÓN ENTRE MÓDULOS ");
  console.log("============================================================\n");

  let passed = 0;
  let total = 0;

  const test = async (name, fn) => {
    total++;
    try {
      await fn();
      passed++;
      console.log(`  ✅ PASS: ${name}`);
    } catch (err) {
      console.error(`  ❌ FAIL: ${name}`);
      console.error(`     Error: ${err.message}`);
      throw err;
    }
  };

  // Login como Admin
  let adminToken = "";
  await test("1. Autenticación Administrador", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ correo: "cristianmazo957@gmail.com", contrasena: "Admin123*" });
    assert.strictEqual(res.status, 200);
    adminToken = res.body.data.token;
    assert.ok(adminToken);
  });

  const authHeader = { Authorization: `Bearer ${adminToken}` };

  // ==========================================
  // FLUJO 1: CLIENTES -> CITAS & VENTAS
  // ==========================================
  let newClientId = null;
  const uniqueClientEmail = `cliente_test_${Date.now()}@sync.com`;

  await test("2. Crear Cliente en Módulo Clientes (POST /api/clients)", async () => {
    const randomDoc = Math.floor(1000000000 + Math.random() * 9000000000).toString();
    const res = await request(app)
      .post("/api/clients")
      .set(authHeader)
      .send({
        nombre: "Alejandro",
        apellido: "Montoya",
        documento: randomDoc,
        correo: uniqueClientEmail,
        telefono: "+57 311 987 6543",
        direccion: "Carrera 80 # 32-10",
        nivel_fidelidad: "Nuevo"
      });
    assert.strictEqual(res.status, 201);
    assert.ok(res.body.data.id_cliente);
    newClientId = res.body.data.id_cliente;
  });

  await test("3. Verificar que Cliente recién creado aparece en GET /api/clients", async () => {
    const res = await request(app).get("/api/clients").set(authHeader);
    assert.strictEqual(res.status, 200);
    const found = res.body.data.find((c) => c.id_cliente === newClientId);
    assert.ok(found, "El cliente recién creado debe existir en el listado de clientes");
    assert.strictEqual(found.nombre, "Alejandro");
  });

  await test("4. Utilizar nuevo Cliente para agendar Cita en Módulo Citas (POST /api/appointments)", async () => {
    const availRes = await request(app).get("/api/schedules/availability?id_barbero=1&fecha=2026-11-23").set(authHeader);
    const freeSlot = availRes.body?.data?.slots?.find((s) => s.disponible)?.hora || "15:00";

    const res = await request(app)
      .post("/api/appointments")
      .set(authHeader)
      .send({
        id_cliente: newClientId,
        id_barbero: 1,
        id_servicio: 1,
        fecha: "2026-11-23",
        hora: `${freeSlot}:00`.substring(0, 8),
        notas: "Cita para cliente sincronizado"
      });
    assert.strictEqual(res.status, 201);
    assert.strictEqual(res.body.data.id_cliente, newClientId);
  });

  // ==========================================
  // FLUJO 2: CATEGORÍA PRODUCTO -> PRODUCTO -> COMPRA (STOCK +) -> VENTA (STOCK -)
  // ==========================================
  let newProductCatId = null;
  let newProductId = null;

  await test("5. Crear Categoría de Producto (POST /api/products/categories)", async () => {
    const res = await request(app)
      .post("/api/products/categories")
      .set(authHeader)
      .send({
        nombre: `Cera Modeladora ${Date.now()}`
      });
    assert.strictEqual(res.status, 201);
    newProductCatId = res.body.data.id_categoria_producto;
    assert.ok(newProductCatId);
  });

  await test("6. Crear Producto usando nueva Categoría (POST /api/products)", async () => {
    const res = await request(app)
      .post("/api/products")
      .set(authHeader)
      .send({
        nombre: `Cera Brillo Extremo ${Date.now()}`,
        id_categoria_producto: newProductCatId,
        precio: 28000,
        stock: 10,
        descripcion: "Cera efecto húmedo fijación media"
      });
    assert.strictEqual(res.status, 201);
    newProductId = res.body.data.id_producto;
    assert.ok(newProductId);
    assert.strictEqual(res.body.data.stock, 10);
  });

  let newSupplierId = null;
  await test("7. Crear Proveedor en Módulo Proveedores (POST /api/suppliers)", async () => {
    const res = await request(app)
      .post("/api/suppliers")
      .set(authHeader)
      .send({
        nombre: `Distribuidora Barber Pro ${Date.now()}`,
        nit: `900${Date.now()}`,
        telefono: "+57 301 000 1122",
        correo: `prov_${Date.now()}@distribuidora.com`,
        direccion: "Av. Principal # 50-20"
      });
    assert.strictEqual(res.status, 201);
    newSupplierId = res.body.data.id_proveedor;
    assert.ok(newSupplierId);
  });

  await test("8. Registrar Compra que abastece nuevo Producto con nuevo Proveedor (POST /api/purchases)", async () => {
    const res = await request(app)
      .post("/api/purchases")
      .set(authHeader)
      .send({
        id_proveedor: newSupplierId,
        detalles: [
          {
            id_producto: newProductId,
            cantidad: 15,
            precio_unitario: 18000
          }
        ]
      });
    assert.strictEqual(res.status, 201);
  });

  await test("9. Verificar que Stock del Producto aumentó de 10 a 25 tras la Compra", async () => {
    const res = await request(app).get(`/api/products/${newProductId}`).set(authHeader);
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.data.stock, 25, "El stock debe ser 10 + 15 = 25");
  });

  await test("10. Registrar Venta a nuevo Cliente descontando Producto recién comprado (POST /api/sales)", async () => {
    const res = await request(app)
      .post("/api/sales")
      .set(authHeader)
      .send({
        id_cliente: newClientId,
        id_barbero: 1,
        metodo_pago: "Efectivo",
        detalles: [
          {
            tipo_item: "Producto",
            id_producto: newProductId,
            cantidad: 5,
            precio_unitario: 28000
          }
        ]
      });
    assert.strictEqual(res.status, 201);
  });

  await test("11. Verificar que Stock del Producto disminuyó de 25 a 20 tras la Venta", async () => {
    const res = await request(app).get(`/api/products/${newProductId}`).set(authHeader);
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.data.stock, 20, "El stock debe ser 25 - 5 = 20");
  });

  // ==========================================
  // FLUJO 3: CATEGORÍA SERVICIO -> SERVICIO -> PAQUETE -> CITA
  // ==========================================
  let newServiceCatId = null;
  let newServiceId = null;
  let newPackageId = null;

  await test("12. Crear Categoría de Servicio (POST /api/services/categories)", async () => {
    const res = await request(app)
      .post("/api/services/categories")
      .set(authHeader)
      .send({
        nombre: `Colorimetría y Diseños ${Date.now()}`
      });
    assert.strictEqual(res.status, 201);
    newServiceCatId = res.body.data.id_categoria_servicio;
    assert.ok(newServiceCatId);
  });

  await test("13. Crear Servicio asociado a nueva Categoría (POST /api/services)", async () => {
    const res = await request(app)
      .post("/api/services")
      .set(authHeader)
      .send({
        nombre: `Platinado Silver ${Date.now()}`,
        id_categoria_servicio: newServiceCatId,
        duracion_minutos: 90,
        precio: 65000
      });
    assert.strictEqual(res.status, 201);
    newServiceId = res.body.data.id_servicio;
    assert.ok(newServiceId);
  });

  await test("14. Crear Paquete incluyendo el nuevo Servicio (POST /api/packages)", async () => {
    const res = await request(app)
      .post("/api/packages")
      .set(authHeader)
      .send({
        nombre: `Pack Transformación Total ${Date.now()}`,
        descripcion: "Corte clásico + Platinado Silver",
        descuento_porcentaje: 15,
        servicios_ids: [1, newServiceId]
      });
    assert.strictEqual(res.status, 201);
    newPackageId = res.body.data.id_paquete;
    assert.ok(newPackageId);
  });

  // ==========================================
  // FLUJO 4: USUARIO BARBERO -> BARBERO -> HORARIO -> CITA
  // ==========================================
  let newBarberUserId = null;
  let newBarberId = null;

  await test("15. Crear Usuario Barbero (POST /api/users con id_rol: 3) y verificar sincronización a Barbero", async () => {
    const barberEmail = `barbero_nuevo_${Date.now()}@tuturno.com`;
    const res = await request(app)
      .post("/api/users")
      .set(authHeader)
      .send({
        nombre: "Mateo",
        apellido: "Gómez",
        documento: Math.floor(1000000000 + Math.random() * 9000000000).toString(),
        correo: barberEmail,
        telefono: "+57 320 444 5566",
        id_rol: 3,
        contrasena: "Barbero123*"
      });
    assert.strictEqual(res.status, 201);
    newBarberUserId = res.body.data.id_usuario;
    assert.ok(newBarberUserId);

    // Comprobar que en GET /api/barbers aparece automáticamente asociado
    const barbersRes = await request(app).get("/api/barbers").set(authHeader);
    assert.strictEqual(barbersRes.status, 200);
    const syncBarber = barbersRes.body.data.find(
      (b) => b.id_usuario === newBarberUserId || b.correo === barberEmail
    );
    assert.ok(syncBarber, "El usuario con rol Barbero debe sincronizarse automáticamente a la tabla barbero");
    newBarberId = syncBarber.id_barbero;
    assert.ok(newBarberId);
  });

  await test("16. Asignar Horario al nuevo Barbero sincronizado (POST /api/schedules)", async () => {
    const res = await request(app)
      .post("/api/schedules")
      .set(authHeader)
      .send({
        id_barbero: newBarberId,
        dias_semana: ["Viernes", "Sábado"],
        hora_inicio: "10:00:00",
        hora_fin: "19:00:00"
      });
    assert.strictEqual(res.status, 201);
  });

  await test("17. Agendar Cita con nuevo Barbero, nuevo Cliente y nuevo Paquete (POST /api/appointments)", async () => {
    const res = await request(app)
      .post("/api/appointments")
      .set(authHeader)
      .send({
        id_cliente: newClientId,
        id_barbero: newBarberId,
        id_paquete: newPackageId,
        fecha: "2026-11-21",
        hora: "11:00:00",
        notas: "Cita con nuevo barbero y nuevo paquete"
      });
    assert.strictEqual(res.status, 201);
    assert.strictEqual(res.body.data.id_barbero, newBarberId);
    assert.strictEqual(res.body.data.id_cliente, newClientId);
    assert.ok(res.body.data.servicios && res.body.data.servicios.length >= 1, "La cita debe contener los servicios resueltos del paquete");
  });

  console.log(`\n============================================================`);
  console.log(`   RESULTADO: ${passed}/${total} PRUEBAS SUPERADAS EXITOSAMENTE `);
  console.log(`   SINCRONIZACIÓN DE EXTREMO A EXTREMO 100% FUNCIONAL `);
  console.log(`============================================================\n`);
}

runEndToEndCrossModuleTest()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Test suite failed:", err);
    process.exit(1);
  });

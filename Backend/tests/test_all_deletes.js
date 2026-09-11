import http from "http";

async function request(options, postData = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        try {
          const parsed = data ? JSON.parse(data) : {};
          resolve({ status: res.statusCode, data: parsed });
        } catch {
          resolve({ status: res.statusCode, raw: data });
        }
      });
    });
    req.on("error", reject);
    if (postData) {
      req.write(typeof postData === "string" ? postData : JSON.stringify(postData));
    }
    req.end();
  });
}

async function run() {
  console.log("=== INICIANDO AUDITORÍA DE RUTAS DELETE EN TODOS LOS MÓDULOS ===");

  // 1. Auth login
  const loginRes = await request(
    {
      hostname: "127.0.0.1",
      port: 3001,
      path: "/api/auth/login",
      method: "POST",
      headers: { "Content-Type": "application/json" }
    },
    { correo: "cristianmazo957@gmail.com", contrasena: "Admin123*" }
  );

  if (loginRes.status !== 200 || !loginRes.data?.data?.token) {
    console.error("❌ Falló autenticación:", loginRes);
    process.exit(1);
  }

  const token = loginRes.data.data.token;
  const authHeaders = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`
  };

  const results = [];

  // Helper to create and then delete
  async function testCreateAndDelete(moduleName, createPath, createPayload, deletePathFn) {
    try {
      const createRes = await request(
        {
          hostname: "127.0.0.1",
          port: 3001,
          path: createPath,
          method: "POST",
          headers: authHeaders
        },
        createPayload
      );

      if (createRes.status < 200 || createRes.status >= 300) {
        results.push({ module: moduleName, success: false, step: "CREATE", error: createRes.data });
        return;
      }

      const resData = createRes.data?.data;
      const id = Array.isArray(resData)
        ? (resData[0]?.id_horario || resData[0]?.id)
        : (resData?.id || resData?.[Object.keys(resData || {})[0]]);
      const delPath = deletePathFn(id);

      const deleteRes = await request({
        hostname: "127.0.0.1",
        port: 3001,
        path: delPath,
        method: "DELETE",
        headers: authHeaders
      });

      if (deleteRes.status >= 200 && deleteRes.status < 300) {
        results.push({ module: moduleName, success: true, endpoint: delPath, status: deleteRes.status });
      } else {
        results.push({ module: moduleName, success: false, step: "DELETE", endpoint: delPath, status: deleteRes.status, error: deleteRes.data });
      }
    } catch (err) {
      results.push({ module: moduleName, success: false, error: err.message });
    }
  }

  // 1. Barbers
  await testCreateAndDelete(
    "Barbers",
    "/api/barbers",
    {
      nombre: "BarberoAudit",
      apellido: "Test",
      correo: `barber_${Date.now()}@audit.com`,
      telefono: "3101112233",
      especialidad: "Corte Clásico"
    },
    (id) => `/api/barbers/${id}`
  );

  // 2. Clients
  await testCreateAndDelete(
    "Clients",
    "/api/clients",
    {
      nombre: "TestClient",
      apellido: "DeleteAudit",
      correo: `testclient_${Date.now()}@audit.com`,
      telefono: "3009998877",
      nivel_fidelidad: "Nuevo"
    },
    (id) => `/api/clients/${id}`
  );

  // 3. Services
  await testCreateAndDelete(
    "Services",
    "/api/services",
    {
      nombre: `TestService_${Date.now()}`,
      id_categoria_servicio: 1,
      precio: 25000,
      duracion_minutos: 30
    },
    (id) => `/api/services/${id}`
  );

  // 4. Packages
  await testCreateAndDelete(
    "Packages",
    "/api/packages",
    {
      nombre: `TestPkg_${Date.now()}`,
      descuento_porcentaje: 10,
      servicios_ids: [1]
    },
    (id) => `/api/packages/${id}`
  );

  // 5. Products
  await testCreateAndDelete(
    "Products",
    "/api/products",
    {
      nombre: `TestProd_${Date.now()}`,
      id_categoria_producto: 1,
      precio: 15000,
      stock: 10
    },
    (id) => `/api/products/${id}`
  );

  // 6. Suppliers
  await testCreateAndDelete(
    "Suppliers",
    "/api/suppliers",
    {
      nombre: `TestSupplier_${Date.now()}`,
      nit: `NIT-${Date.now()}`,
      telefono: "3112223344",
      correo: `sup_${Date.now()}@audit.com`
    },
    (id) => `/api/suppliers/${id}`
  );

  // 7. Roles
  await testCreateAndDelete(
    "Roles",
    "/api/roles",
    {
      nombre_rol: `TestRole_${Date.now()}`,
      descripcion: "Rol para test de borrado",
      permisos: ["servicios_leer"]
    },
    (id) => `/api/roles/${id}`
  );

  // 8. Users
  await testCreateAndDelete(
    "Users",
    "/api/users",
    {
      nombre: "TestUser",
      apellido: "DeleteAudit",
      correo: `testuser_${Date.now()}@audit.com`,
      contrasena: "User123*",
      id_rol: 2
    },
    (id) => `/api/users/${id}`
  );

  // 9. Schedules
  await testCreateAndDelete(
    "Schedules",
    "/api/schedules",
    {
      id_barbero: 1,
      dias_semana: ["Lunes"],
      hora_inicio: "08:00",
      hora_fin: "12:00"
    },
    (id) => `/api/schedules/${id}`
  );

  // 10. Appointments cancel/delete
  console.log("Probando Cita DELETE /api/appointments/1...");
  const appDel = await request({
    hostname: "127.0.0.1",
    port: 3001,
    path: "/api/appointments/1",
    method: "DELETE",
    headers: authHeaders
  });
  results.push({
    module: "Appointments",
    success: appDel.status >= 200 && appDel.status < 300,
    endpoint: "/api/appointments/1",
    status: appDel.status
  });

  console.log("\n--- RESULTADOS AUDITORÍA DELETE ---");
  let allOk = true;
  for (const r of results) {
    if (r.success) {
      console.log(`✅ [${r.module}] -> ${r.endpoint || ""} (Status ${r.status})`);
    } else {
      allOk = false;
      console.error(`❌ [${r.module}] -> ERROR:`, r.error || r);
    }
  }

  if (allOk) {
    console.log("\n🎉 TODAS LAS RUTAS DELETE FUNCIONAN AL 100%!");
  } else {
    console.error("\n⚠️ HUBO ERRORES EN ALGUNAS RUTAS DELETE.");
    process.exit(1);
  }
}

run();

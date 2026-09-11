const BASE_URL = "http://localhost:3001/api";

async function runAudit() {
  console.log("=================================================");
  console.log(" TU TURNO BARBER - AUDITORÍA INTEGRAL DE MÓDULOS ");
  console.log("=================================================");

  let token = null;
  let passedTests = 0;
  let totalTests = 0;

  function assert(condition, name, details = "") {
    totalTests++;
    if (condition) {
      console.log(`✅ [PASS] ${name}`);
      passedTests++;
    } else {
      console.error(`❌ [FAIL] ${name} - ${details}`);
    }
  }

  // 1. AUTH & CLIENT REGISTRATION (LOYALTY CHECK)
  console.log("\n--- 1. AUTENTICACIÓN Y VALIDACIÓN DE REGISTRO ---");
  const testEmail = `audit_client_${Date.now()}@test.com`;
  
  // Test registration
  const regRes = await fetch(`${BASE_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      nombre: "Audit",
      apellido: "User",
      correo: testEmail,
      contrasena: "Password123*",
      telefono: "3009998877"
    })
  });
  const regData = await regRes.json();
  assert(regRes.status === 201 && regData.success, "Registro de nuevo usuario con contraseña segura");
  assert(
    regData.data?.cliente?.nivel_fidelidad === "Nuevo" || regData.data?.cliente?.nivel_fidelidad === "Bronce",
    "Cliente recién registrado inicia con nivel mínimo de fidelidad ('Nuevo')",
    `Nivel obtenido: ${regData.data?.cliente?.nivel_fidelidad}`
  );

  // Test invalid login
  const badLoginRes = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ correo: testEmail, contrasena: "WrongPass" })
  });
  assert(badLoginRes.status === 400, "Validación de contraseña incorrecta rechaza con 400");

  // Test valid login
  const loginRes = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ correo: "cristianmazo957@gmail.com", contrasena: "Admin123*" })
  });
  const loginData = await loginRes.json();
  assert(loginRes.status === 200 && loginData.data?.token, "Login de administrador retorna JWT");
  token = loginData.data?.token;

  const authHeaders = {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`
  };

  // 2. PRODUCT VALIDATIONS
  console.log("\n--- 2. MÓDULO DE PRODUCTOS Y VALIDACIONES ---");
  const invalidProdRes = await fetch(`${BASE_URL}/products`, {
    method: "POST",
    headers: authHeaders,
    body: JSON.stringify({
      nombre: "Test Invalido",
      id_categoria_producto: 1,
      precio: -500, // Invalid negative price
      stock: -10
    })
  });
  const invalidProdData = await invalidProdRes.json();
  assert(invalidProdRes.status === 400, "Validación rechaza producto con precio o stock negativo");

  const validProdRes = await fetch(`${BASE_URL}/products`, {
    method: "POST",
    headers: authHeaders,
    body: JSON.stringify({
      nombre: "Pomada Mate Audit",
      id_categoria_producto: 1,
      precio: 25000,
      stock: 20
    })
  });
  const validProdData = await validProdRes.json();
  assert(validProdRes.status === 201 && validProdData.data?.id_producto, "Creación de producto válido exitosa");
  const productId = validProdData.data?.id_producto;

  // 3. APPOINTMENTS & COLLISION CHECK
  console.log("\n--- 3. MÓDULO DE CITAS Y VALIDACIÓN DE CONFLICTOS ---");
  const uniqueDay = String((Date.now() % 25) + 1).padStart(2, "0");
  const testDate = `2029-03-${uniqueDay}`;
  const testTime = "10:00";

  const firstAptRes = await fetch(`${BASE_URL}/appointments`, {
    method: "POST",
    headers: authHeaders,
    body: JSON.stringify({
      id_cliente: 1,
      id_barbero: 1,
      id_servicio: 1,
      fecha: testDate,
      hora: testTime,
      notas: "Cita inicial de prueba"
    })
  });
  assert(firstAptRes.status === 201, "Creación de primera cita para barbero en horario libre");

  const collisionAptRes = await fetch(`${BASE_URL}/appointments`, {
    method: "POST",
    headers: authHeaders,
    body: JSON.stringify({
      id_cliente: 2,
      id_barbero: 1,
      id_servicio: 2,
      fecha: testDate,
      hora: testTime,
      notas: "Cita en colisión"
    })
  });
  assert(collisionAptRes.status === 409, "Validación anti-colisión rechaza turno duplicado con 409 Conflict");

  // 4. INVENTORY & SALES VALIDATION
  console.log("\n--- 4. MÓDULO DE VENTAS Y VALIDACIÓN DE STOCK ---");
  const overSaleRes = await fetch(`${BASE_URL}/sales`, {
    method: "POST",
    headers: authHeaders,
    body: JSON.stringify({
      id_cliente: 1,
      id_barbero: 1,
      metodo_pago: "Efectivo",
      total: 99999999,
      detalles: [
        {
          tipo_item: "Producto",
          id_producto: productId,
          cantidad: 9999,
          precio_unitario: 25000
        }
      ]
    })
  });
  assert(overSaleRes.status === 409, "Validación de inventario rechaza venta con stock insuficiente con 409");

  const goodSaleRes = await fetch(`${BASE_URL}/sales`, {
    method: "POST",
    headers: authHeaders,
    body: JSON.stringify({
      id_cliente: 1,
      id_barbero: 1,
      metodo_pago: "Efectivo",
      total: 50000,
      detalles: [
        {
          tipo_item: "Producto",
          id_producto: productId,
          cantidad: 2,
          precio_unitario: 25000
        }
      ]
    })
  });
  assert(goodSaleRes.status === 201, "Venta válida procesada con éxito");

  // 5. SUPPLIERS & PURCHASES
  console.log("\n--- 5. MÓDULO DE PROVEEDORES Y COMPRAS ---");
  const suppRes = await fetch(`${BASE_URL}/suppliers`, {
    method: "POST",
    headers: authHeaders,
    body: JSON.stringify({
      nombre: `Cosméticos & Ceras ${Date.now()}`,
      correo: `supp_${Date.now()}@test.com`,
      telefono: "3105556677",
      nit: `900.${Math.floor(100000 + Math.random() * 900000)}-${Date.now() % 10}`
    })
  });
  assert(suppRes.status === 201, "Registro de proveedor exitoso");

  // 6. BARBERS, SERVICES, SCHEDULES, ROLES
  console.log("\n--- 6. VERIFICACIÓN DE BARBEROS, HORARIOS, SERVICIOS Y ROLES ---");
  const barbersRes = await fetch(`${BASE_URL}/barbers`, { headers: authHeaders });
  const barbersData = await barbersRes.json();
  assert(barbersRes.status === 200 && Array.isArray(barbersData.data), "Obtención de lista de barberos exitosa");

  const servicesRes = await fetch(`${BASE_URL}/services`, { headers: authHeaders });
  const servicesData = await servicesRes.json();
  assert(servicesRes.status === 200 && Array.isArray(servicesData.data), "Obtención de lista de servicios exitosa");

  const schedulesRes = await fetch(`${BASE_URL}/schedules`, { headers: authHeaders });
  const schedulesData = await schedulesRes.json();
  assert(schedulesRes.status === 200 && Array.isArray(schedulesData.data), "Obtención de horarios de barbería exitosa");

  const rolesRes = await fetch(`${BASE_URL}/roles`, { headers: authHeaders });
  const rolesData = await rolesRes.json();
  assert(rolesRes.status === 200 && Array.isArray(rolesData.data), "Obtención de roles y matriz de permisos exitosa");

  console.log("\n=================================================");
  console.log(` RESULTADO AUDITORÍA: ${passedTests}/${totalTests} pruebas aprobadas (${Math.round((passedTests/totalTests)*100)}%) `);
  console.log("=================================================");
}

runAudit().catch((err) => {
  console.error("Error fatal durante auditoría:", err);
});

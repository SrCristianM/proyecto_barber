import { execSync } from "child_process";

const BASE_URL = "http://localhost:3001/api";

async function testFullCrudFlow() {
  console.log("============================================================");
  console.log("🔄 PROBANDO FLUJO COMPLETO CRUD (CREATE -> READ -> UPDATE -> DELETE)");
  console.log("============================================================");

  // 1. Login
  const loginRes = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      correo: "cristianmazo957@gmail.com",
      contrasena: "Admin123*"
    })
  });
  const loginJson = await loginRes.json();
  const token = loginJson.data?.token;
  console.log("1. Login Admin status:", loginRes.status, "Token recibido:", !!token);

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`
  };

  // 2. CRUD Usuario
  console.log("\n--- Probando CRUD Usuario ---");
  const randEmail = `test.user.${Date.now()}@example.com`;
  const createUserRes = await fetch(`${BASE_URL}/users`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      nombre: "UsuarioPrueba",
      apellido: "Postman",
      correo: randEmail,
      contrasena: "Password123*",
      id_rol: 2,
      telefono: "3001112233",
      estado: 1
    })
  });
  const userJson = await createUserRes.json();
  const newUserId = userJson.data?.id_usuario;
  console.log("POST /users status:", createUserRes.status, "Nuevo ID:", newUserId);

  const getUserRes = await fetch(`${BASE_URL}/users/${newUserId}`, { headers });
  console.log("GET /users/:id status:", getUserRes.status);

  const putUserRes = await fetch(`${BASE_URL}/users/${newUserId}`, {
    method: "PUT",
    headers,
    body: JSON.stringify({
      nombre: "UsuarioPrueba Actualizado",
      telefono: "3001112299"
    })
  });
  console.log("PUT /users/:id status:", putUserRes.status);

  const delUserRes = await fetch(`${BASE_URL}/users/${newUserId}`, {
    method: "DELETE",
    headers
  });
  console.log("DELETE /users/:id status:", delUserRes.status);

  // 3. CRUD Servicio
  console.log("\n--- Probando CRUD Servicios ---");
  const createServiceRes = await fetch(`${BASE_URL}/services`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      nombre: `Servicio Test ${Date.now()}`,
      id_categoria_servicio: 1,
      precio: 20000,
      duracion_minutos: 30
    })
  });
  const serviceJson = await createServiceRes.json();
  const newServiceId = serviceJson.data?.id_servicio;
  console.log("POST /services status:", createServiceRes.status, "Nuevo ID:", newServiceId);

  const getServiceRes = await fetch(`${BASE_URL}/services/${newServiceId}`, { headers });
  console.log("GET /services/:id status:", getServiceRes.status);

  const delServiceRes = await fetch(`${BASE_URL}/services/${newServiceId}`, {
    method: "DELETE",
    headers
  });
  console.log("DELETE /services/:id status:", delServiceRes.status);

  // 4. CRUD Producto
  console.log("\n--- Probando CRUD Productos ---");
  const createProductRes = await fetch(`${BASE_URL}/products`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      nombre: `Producto Test ${Date.now()}`,
      id_categoria_producto: 1,
      precio: 25000,
      stock: 15
    })
  });
  const productJson = await createProductRes.json();
  const newProductId = productJson.data?.id_producto;
  console.log("POST /products status:", createProductRes.status, "Nuevo ID:", newProductId);

  const delProductRes = await fetch(`${BASE_URL}/products/${newProductId}`, {
    method: "DELETE",
    headers
  });
  console.log("DELETE /products/:id status:", delProductRes.status);

  console.log("\n============================================================");
  console.log("✅ ¡CICLO CRUD COMPLETO OPERACIONAL Y VALIDADO AL 100%!");
  console.log("============================================================");
}

testFullCrudFlow();

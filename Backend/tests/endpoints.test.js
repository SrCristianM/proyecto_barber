import request from "supertest";
import app from "../src/app.js";

describe("Catálogo Completo de Endpoints RESTful", () => {
  let adminToken = "";

  beforeAll(async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({
        correo: "cristianmazo957@gmail.com",
        contrasena: "Admin123*"
      });
    adminToken = res.body.data.token;
  });

  it("GET /api/health debe responder 200 con status healthy", async () => {
    const res = await request(app).get("/api/health");
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("healthy");
  });

  it("GET /api/users debe retornar la lista de usuarios", async () => {
    const res = await request(app).get("/api/users").set("Authorization", `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it("GET /api/roles debe retornar los roles del sistema", async () => {
    const res = await request(app).get("/api/roles").set("Authorization", `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBeGreaterThanOrEqual(4);
  });

  it("GET /api/roles/modules/matrix debe retornar la matriz de módulos y permisos", async () => {
    const res = await request(app).get("/api/roles/modules/matrix").set("Authorization", `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it("GET /api/barbers debe retornar los barberos activos", async () => {
    const res = await request(app).get("/api/barbers");
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it("GET /api/clients debe retornar los clientes registrados", async () => {
    const res = await request(app).get("/api/clients").set("Authorization", `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it("GET /api/services debe retornar los servicios de barbería", async () => {
    const res = await request(app).get("/api/services");
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it("GET /api/services/categories debe retornar las categorías de servicios", async () => {
    const res = await request(app).get("/api/services/categories");
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it("GET /api/packages debe retornar los paquetes promocionales con precios calculados", async () => {
    const res = await request(app).get("/api/packages");
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it("GET /api/products debe retornar el inventario de productos", async () => {
    const res = await request(app).get("/api/products");
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it("GET /api/products/categories debe retornar categorías de productos", async () => {
    const res = await request(app).get("/api/products/categories");
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it("GET /api/schedules debe retornar los horarios", async () => {
    const res = await request(app).get("/api/schedules");
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it("GET /api/schedules/novelties debe retornar las novedades de horario", async () => {
    const res = await request(app).get("/api/schedules/novelties").set("Authorization", `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it("GET /api/suppliers debe retornar la lista de proveedores", async () => {
    const res = await request(app).get("/api/suppliers").set("Authorization", `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it("GET /api/purchases debe retornar el historial de compras", async () => {
    const res = await request(app).get("/api/purchases").set("Authorization", `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it("GET /api/sales debe retornar el historial de ventas", async () => {
    const res = await request(app).get("/api/sales").set("Authorization", `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it("GET /api/dashboard/admin debe retornar KPIs y estadísticas", async () => {
    const res = await request(app).get("/api/dashboard/admin").set("Authorization", `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty("ventas_hoy");
    expect(res.body.data).toHaveProperty("citas_hoy");
    expect(res.body.data).toHaveProperty("clientes_activos");
  });
});

import request from "supertest";
import app from "../src/app.js";

describe("Módulo de Inventario, Compras y Ventas Transaccionales", () => {
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

  it("Debería registrar una compra a proveedor e incrementar el stock atómicamente", async () => {
    // 1. Obtener producto 1
    const pBefore = await request(app).get("/api/products/1");
    const stockInicial = pBefore.body.data.stock;

    // 2. Registrar compra de 10 unidades
    const res = await request(app)
      .post("/api/purchases")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        id_proveedor: 1,
        detalles: [
          {
            id_producto: 1,
            cantidad: 10,
            precio_unitario: 12000
          }
        ]
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);

    // 3. Verificar que el stock haya aumentado exactamente en 10
    const pAfter = await request(app).get("/api/products/1");
    expect(pAfter.body.data.stock).toBe(stockInicial + 10);
  });

  it("Debería registrar una venta y debitar el stock correspondiente", async () => {
    // 1. Obtener stock antes de la venta
    const pBefore = await request(app).get("/api/products/1");
    const stockAntes = pBefore.body.data.stock;

    // 2. Vender 2 unidades
    const res = await request(app)
      .post("/api/sales")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        id_cliente: 1,
        detalles: [
          {
            tipo_item: "Producto",
            id_producto: 1,
            cantidad: 2,
            precio_unitario: 15000
          }
        ]
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);

    // 3. Verificar que el stock haya disminuido en 2
    const pAfter = await request(app).get("/api/products/1");
    expect(pAfter.body.data.stock).toBe(stockAntes - 2);
  });

  it("Debería rechazar una venta cuando el stock solicitado supere el disponible (Conflicto 409)", async () => {
    const res = await request(app)
      .post("/api/sales")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        id_cliente: 1,
        detalles: [
          {
            tipo_item: "Producto",
            id_producto: 1,
            cantidad: 99999, // Supera con creces el stock
            precio_unitario: 15000
          }
        ]
      });

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
  });
});

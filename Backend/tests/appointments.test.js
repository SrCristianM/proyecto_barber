import request from "supertest";
import app from "../src/app.js";

describe("Módulo de Citas y Reglas de Negocio (Appointments API)", () => {
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

  it("Debería calcular la disponibilidad horaria del barbero para una fecha específica", async () => {
    const res = await request(app)
      .get("/api/schedules/availability?id_barbero=1&fecha=2026-09-14") // 2026-09-14 es Lunes
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty("slots");
    expect(Array.isArray(res.body.data.slots)).toBe(true);
  });

  it("Debería agendar una cita correctamente", async () => {
    const res = await request(app)
      .post("/api/appointments")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        id_cliente: 1,
        id_barbero: 1,
        fecha: "2026-09-14",
        hora: "09:00",
        servicios: [{ id_servicio: 1 }]
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id_barbero).toBe(1);
    expect(res.body.data.estado).toBe("Programada");
  });

  it("Debería impedir agendar una cita duplicada en el mismo horario y barbero (Conflicto 409)", async () => {
    const res = await request(app)
      .post("/api/appointments")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        id_cliente: 1,
        id_barbero: 1,
        fecha: "2026-09-14",
        hora: "09:00",
        servicios: [{ id_servicio: 1 }]
      });

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
  });
});

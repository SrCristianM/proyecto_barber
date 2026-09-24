import request from "supertest";
import app from "../src/app.js";

describe("Módulo de Autenticación (Auth API)", () => {
  let authToken = "";

  it("Debería iniciar sesión correctamente con credenciales válidas", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({
        correo: "cristianmazo957@gmail.com",
        contrasena: "Admin123*"
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty("token");
    expect(res.body.data.user.correo).toBe("cristianmazo957@gmail.com");

    authToken = res.body.data.token;
  });

  it("Debería rechazar el inicio de sesión con contraseña incorrecta", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({
        correo: "cristianmazo957@gmail.com",
        contrasena: "PasswordErroneo123"
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toBe("INVALID_CREDENTIALS");
  });

  it("Debería obtener el perfil del usuario autenticado con token válido", async () => {
    const res = await request(app)
      .get("/api/auth/me")
      .set("Authorization", `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.nombre).toBe("Cristian");
    expect(res.body.data.documento).toBeDefined();
  });

  it("Debería registrar un nuevo cliente con documento exitosamente", async () => {
    const timestamp = Date.now();
    const uniqueEmail = `test_client_${timestamp}@example.com`;
    const uniqueDoc = `DOC${String(timestamp).slice(-8)}`;
    const res = await request(app)
      .post("/api/auth/register")
      .send({
        nombre: "Test",
        apellido: "Cliente",
        documento: uniqueDoc,
        correo: uniqueEmail,
        contrasena: "Cliente123*",
        telefono: "3100000000"
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.correo).toBe(uniqueEmail);
    expect(res.body.data.user.documento).toBe(uniqueDoc);
  });

  it("Debería rechazar el registro con un documento ya existente", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({
        nombre: "Duplicado",
        apellido: "Test",
        documento: "1000000001", // Documento del Administrador
        correo: `dup_${Date.now()}@example.com`,
        contrasena: "Cliente123*"
      });

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
  });

  it("Debería procesar la solicitud de recuperación de contraseña", async () => {
    const res = await request(app)
      .post("/api/auth/forgot-password")
      .send({
        correo: "cristianmazo957@gmail.com"
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toContain("instrucciones");
  });
});

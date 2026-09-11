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
  });

  it("Debería registrar un nuevo cliente exitosamente", async () => {
    const uniqueEmail = `test_client_${Date.now()}@example.com`;
    const res = await request(app)
      .post("/api/auth/register")
      .send({
        nombre: "Test",
        apellido: "Cliente",
        correo: uniqueEmail,
        contrasena: "Cliente123*",
        telefono: "3100000000"
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.correo).toBe(uniqueEmail);
  });
});

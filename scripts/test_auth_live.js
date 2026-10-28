import { AuthRepository } from "../Backend/src/models/auth.model.js";
import { AuthService } from "../Backend/src/services/auth.service.js";

async function test() {
  console.log("Testing AuthRepository with MySQL...");
  const u1 = await AuthRepository.findByEmail("cristianmazo957@gmail.com");
  console.log("User 1 (cristianmazo957@gmail.com):", u1 ? { id: u1.id_usuario, nombre: u1.nombre, rol: u1.rol } : null);

  const u2 = await AuthRepository.findByEmail("barbergoldenapp@gmail.com");
  console.log("User 2 (barbergoldenapp@gmail.com):", u2 ? { id: u2.id_usuario, nombre: u2.nombre, rol: u2.rol } : null);

  const allActive = await AuthRepository.getAllActiveUsers();
  console.log("All active users count:", allActive.length);

  // Test verifyGoogleAccount
  try {
    const v1 = await AuthService.verifyGoogleAccount("cristianmazo957@gmail.com");
    console.log("verifyGoogleAccount u1:", v1);
  } catch (err) {
    console.error("verifyGoogleAccount error u1:", err.message);
  }

  try {
    const v2 = await AuthService.verifyGoogleAccount("barbergoldenapp@gmail.com");
    console.log("verifyGoogleAccount u2:", v2);
  } catch (err) {
    console.error("verifyGoogleAccount error u2:", err.message);
  }

  process.exit(0);
}

test();


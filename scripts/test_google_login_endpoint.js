import { AuthService } from "../Backend/src/services/auth.service.js";

async function testGoogleLogin() {
  const res1 = await AuthService.googleLogin({
    email: "cristianmazo957@gmail.com",
    name: "Cristian Mazo",
    isExistingDeviceAccount: true
  });
  console.log("Google Login res1 (cristianmazo957):", {
    token: !!res1.token,
    user: { id: res1.user.id_usuario, nombre: res1.user.nombre, rol: res1.user.rol }
  });

  const res2 = await AuthService.googleLogin({
    email: "barbergoldenapp@gmail.com",
    name: "barber gold",
    isExistingDeviceAccount: true
  });
  console.log("Google Login res2 (barbergoldenapp):", {
    token: !!res2.token,
    user: { id: res2.user.id_usuario, nombre: res2.user.nombre, rol: res2.user.rol }
  });

  process.exit(0);
}

testGoogleLogin().catch(e => {
  console.error("Test failed:", e);
  process.exit(1);
});


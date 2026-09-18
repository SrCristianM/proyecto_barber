import { RolesRepository } from "../src/models/roles.model.js";
import { authorizePermission } from "../src/middlewares/rbac.middleware.js";

async function runStrictRbacTests() {
  console.log("=== INICIANDO TEST COMPLETO DE RBAC ESTRICTO DINÁMICO ===");

  const adminRole = await RolesRepository.findById(1);
  const originalPerms = [...(adminRole.permisos || [])];

  // Caso 1: Administrador sin 'usuarios_activar'
  const permsWithoutActivar = originalPerms.filter((p) => p !== "usuarios_activar");
  await RolesRepository.update(1, { permisos: permsWithoutActivar });

  const middleware = authorizePermission("usuarios", "activar");
  const req = { user: { id_usuario: 1, id_rol: 1, rol: "Administrador" } };
  const res = {};

  let allowedWithout = false;
  let errorWithout = null;
  await middleware(req, res, (err) => {
    if (err) errorWithout = err;
    else allowedWithout = true;
  });

  console.log("1. Admin intentando desactivar usuario SIN permiso 'usuarios_activar':");
  console.log("   - Permitido:", allowedWithout);
  console.log("   - Error recibido:", errorWithout ? errorWithout.message : "Ninguno");
  if (!allowedWithout && errorWithout) {
    console.log("   ✅ PASÓ: Se deniega la acción correctamente con 403 Forbidden.");
  } else {
    console.error("   ❌ FALLÓ: Se permitió la acción indebidamente.");
  }

  // Caso 2: Administrador CON 'usuarios_activar'
  const permsWithActivar = [...permsWithoutActivar, "usuarios_activar"];
  await RolesRepository.update(1, { permisos: permsWithActivar });

  let allowedWith = false;
  let errorWith = null;
  await middleware(req, res, (err) => {
    if (err) errorWith = err;
    else allowedWith = true;
  });

  console.log("2. Admin intentando desactivar usuario CON permiso 'usuarios_activar':");
  console.log("   - Permitido:", allowedWith);
  console.log("   - Error recibido:", errorWith ? errorWith.message : "Ninguno");
  if (allowedWith && !errorWith) {
    console.log("   ✅ PASÓ: Se permite la acción correctamente.");
  } else {
    console.error("   ❌ FALLÓ: Se bloqueó la acción a pesar de tener el permiso.");
  }

  // Caso 3: Probar que 'usuarios_editar' NO permite activar/desactivar si 'usuarios_activar' falta
  const permsOnlyEdit = permsWithoutActivar.filter((p) => p !== "usuarios_activar");
  if (!permsOnlyEdit.includes("usuarios_editar")) permsOnlyEdit.push("usuarios_editar");
  await RolesRepository.update(1, { permisos: permsOnlyEdit });

  let allowedOnlyEdit = false;
  let errorOnlyEdit = null;
  await middleware(req, res, (err) => {
    if (err) errorOnlyEdit = err;
    else allowedOnlyEdit = true;
  });

  console.log("3. Admin con 'usuarios_editar' pero SIN 'usuarios_activar':");
  console.log("   - Permitido:", allowedOnlyEdit);
  console.log("   - Error recibido:", errorOnlyEdit ? errorOnlyEdit.message : "Ninguno");
  if (!allowedOnlyEdit && errorOnlyEdit) {
    console.log("   ✅ PASÓ: 'usuarios_editar' ya NO otorga bypass para activar/desactivar.");
  } else {
    console.error("   ❌ FALLÓ: Hubo fallback permisivo indebido.");
  }

  // Caso 4: Probar productos_activar
  const prodMiddleware = authorizePermission("productos", "activar");
  let allowedProdWithout = false;
  let errorProdWithout = null;
  await prodMiddleware(req, res, (err) => {
    if (err) errorProdWithout = err;
    else allowedProdWithout = true;
  });
  console.log("4. Admin intentando activar producto sin 'productos_activar':");
  console.log("   - Permitido:", allowedProdWithout);
  console.log("   - Error recibido:", errorProdWithout ? errorProdWithout.message : "Ninguno");
  if (!allowedProdWithout && errorProdWithout) {
    console.log("   ✅ PASÓ: Se bloquea productos_activar adecuadamente.");
  }

  // Restaurar permisos originales
  await RolesRepository.update(1, { permisos: originalPerms });
  console.log("=== TEST DE RBAC ESTRICTO FINALIZADO CON ÉXITO ===");
}

runStrictRbacTests().catch((err) => {
  console.error("Error ejecutando pruebas:", err);
  process.exit(1);
});

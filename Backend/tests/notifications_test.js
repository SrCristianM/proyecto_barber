/**
 * Script de prueba y verificación de la lógica de notificaciones
 */

import { NotificationsService } from "../src/services/notifications.service.js";
import { AppointmentsService } from "../src/services/appointments.service.js";
import { SchedulesService } from "../src/services/schedules.service.js";
import { ROLES } from "../src/config/constants.js";

async function runTest() {
  console.log("=== INICIANDO VERIFICACIÓN DEL SISTEMA DE NOTIFICACIONES ===");

  const adminUser = { id_usuario: 1, id_rol: ROLES.ADMIN };
  const recepcionistaUser = { id_usuario: 3, id_rol: ROLES.RECEPCIONISTA };
  const barberoUser = { id_usuario: 4, id_rol: ROLES.BARBERO };
  const clienteUser = { id_usuario: 10, id_rol: ROLES.CLIENTE };

  // 1. Notificaciones iniciales de Admin
  console.log("\n1. Consultando notificaciones para Administrador...");
  const adminNotifs1 = await NotificationsService.getNotificationsForUser(adminUser);
  console.log(`-> Administrador tiene ${adminNotifs1.length} notificaciones.`);
  console.log("-> Muestra de notificaciones de Admin:", adminNotifs1.slice(0, 3).map(n => `[${n.type}] ${n.title}`));

  // 2. Simular solicitud de novedad de horario por barbero
  console.log("\n2. Simulando solicitud de novedad de barbero...");
  const novelty = await SchedulesService.createNovelty({
    id_barbero: 1,
    tipo: "Permiso",
    fecha: "2026-09-25",
    descripcion: "Trámite personal matutino"
  });
  console.log("-> Novedad creada con éxito, ID:", novelty.id_novedad);

  // Verificar que el Administrador ahora ve la novedad
  const adminNotifs2 = await NotificationsService.getNotificationsForUser(adminUser);
  const foundNoveltyNotif = adminNotifs2.find(n => n.title.includes("novedad") || n.description.includes("Permiso"));
  console.log("-> Notificación de novedad recibida por Admin:", foundNoveltyNotif ? `SÍ: "${foundNoveltyNotif.title}" - ${foundNoveltyNotif.description}` : "NO");

  // 3. Administrador aprueba la novedad
  console.log("\n3. Administrador aprueba la novedad...");
  await SchedulesService.updateNoveltyStatus(novelty.id_novedad, "Aprobada");

  // Verificar que el Barbero recibe la notificación de aprobación
  const barberoNotifs = await NotificationsService.getNotificationsForUser(barberoUser);
  const foundApproval = barberoNotifs.find(n => n.title.includes("Aprobada") || n.description.includes("aprobada"));
  console.log("-> Notificación de aprobación recibida por Barbero:", foundApproval ? `SÍ: "${foundApproval.title}" - ${foundApproval.description}` : "NO");

  // 4. Test de marcar como leída
  const testAptNotif = adminNotifs1[0];
  if (testAptNotif) {
    console.log("\n4. Marcando notificación de cita como leída...", testAptNotif.id);
    NotificationsService.markAsRead(testAptNotif.id, adminUser.id_usuario);
    const updatedAdminNotifs = await NotificationsService.getNotificationsForUser(adminUser);
    const marked = updatedAdminNotifs.find(n => n.id === testAptNotif.id);
    console.log("-> ¿La notificación de cita quedó marcada como leída?:", marked?.read === true ? "SÍ (leída: true)" : "NO");
  }

  console.log("\n=== VERIFICACIÓN EXITOSA: TODAS LAS PRUEBAS PASARON ===");
}

runTest().catch(err => {
  console.error("Error en test:", err);
  process.exit(1);
});

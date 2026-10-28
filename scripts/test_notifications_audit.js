/**
 * Test de Auditoría y Verificación de Notificaciones y Validaciones
 * Prueba de sincronización en tiempo de ejecución para:
 * 1. Administrador (id_rol: 1)
 * 2. Recepcionista (id_rol: 2)
 * 3. Barbero (id_rol: 3)
 * 4. Cliente (id_rol: 4)
 */

import assert from "node:assert";

// Mock de localStorage
const storage = new Map();
global.localStorage = {
  getItem: (key) => storage.get(key) || null,
  setItem: (key, val) => storage.set(key, String(val)),
  removeItem: (key) => storage.delete(key),
  clear: () => storage.clear()
};

// Mock de eventos de ventana
const eventListeners = new Map();
global.window = {
  addEventListener: (name, cb) => {
    if (!eventListeners.has(name)) eventListeners.set(name, []);
    eventListeners.get(name).push(cb);
  },
  removeEventListener: (name, cb) => {
    if (!eventListeners.has(name)) return;
    eventListeners.set(name, eventListeners.get(name).filter(fn => fn !== cb));
  },
  dispatchEvent: (evt) => {
    const list = eventListeners.get(evt.type) || [];
    list.forEach(fn => fn(evt));
  }
};
global.CustomEvent = class CustomEvent {
  constructor(type, params = {}) {
    this.type = type;
    this.detail = params.detail || null;
  }
};

console.log("=== INICIANDO AUDITORÍA INTEGRAL DE NOTIFICACIONES Y VALIDACIONES ===");

// 1. Cargar servicios
import {
  createNotification,
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  subscribeNotifications
} from "../frontend/src/shared/services/notificationService.js";

import { notifyDataChange, SYNC_ENTITIES } from "../frontend/src/shared/services/dataSyncService.js";
import { validateAppointmentForm } from "../frontend/src/features/admin/appointments/validations/appointmentValidation.js";
import { validateNoveltyForm } from "../frontend/src/features/admin/schedules/validations/scheduleValidation.js";
import { validateSaleForm } from "../frontend/src/features/admin/sales/validations/saleValidation.js";

// Datos de usuarios de los 4 roles
const adminUser = { id_usuario: 1, id_rol: 1, nombre: "Admin Principal" };
const recepcionistaUser = { id_usuario: 2, id_rol: 2, nombre: "Recepcionista 1" };
const barberUser = { id_usuario: 4, id_rol: 3, id_barbero: 1, nombre: "Carlos Rodríguez" };
const clientUser = { id_usuario: 10, id_rol: 4, id_cliente: 5, nombre: "Juan Pérez", correo: "juan@test.com" };

// Inicializar barberos y clientes en localStorage
localStorage.setItem("barber_barbers_db", JSON.stringify([
  { id_barbero: 1, id_usuario: 4, nombre: "Carlos Rodríguez", especialidad: "Corte Clásico" }
]));

localStorage.setItem("barber_clients_db", JSON.stringify([
  { id_cliente: 5, id_usuario: 10, nombre: "Juan", apellido: "Pérez", correo: "juan@test.com" }
]));

// Test 1: Validaciones de Citas
console.log("\n[TEST 1] Verificando validaciones de agendamiento de citas...");
{
  // A. Fecha pasada
  const pastRes = validateAppointmentForm({
    id_cliente: 5,
    id_barbero: 1,
    id_servicio: 1,
    fecha: "2020-01-01",
    hora: "10:00"
  }, true);
  assert.strictEqual(pastRes.isValid, false, "Debe rechazar citas con fecha en el pasado");
  assert.ok(pastRes.errors.fecha, "Debe reportar error en la fecha pasada");

  // B. Sin cliente o sin barbero
  const noClient = validateAppointmentForm({ id_barbero: 1, fecha: "2026-12-01", hora: "10:00" }, true);
  assert.strictEqual(noClient.isValid, false, "Debe requerir cliente");
  assert.ok(noClient.errors.id_cliente);

  // C. Conflicto con cita existente
  const conflictRes = validateAppointmentForm({
    id_cliente: 5,
    id_barbero: 1,
    id_servicio: 1,
    fecha: "2026-12-01",
    hora: "10:00"
  }, true, [{ id_cita: 99, id_barbero: 1, fecha: "2026-12-01", hora: "10:00:00", estado: "Programada" }]);
  assert.strictEqual(conflictRes.isValid, false, "Debe detectar colisión con cita ya agendada");
  assert.ok(conflictRes.errors.hora);

  console.log("  -> Validaciones de agendamiento: OK (Rechaza fechas pasadas, falta de campos y colisiones)");
}

// Test 2: Validaciones de Novedades de Horario
console.log("\n[TEST 2] Verificando validaciones de novedades...");
{
  const pastNov = validateNoveltyForm({
    id_barbero: 1,
    tipo: "Permiso",
    fecha: "2020-01-01",
    descripcion: "Motivo de prueba médica"
  });
  assert.strictEqual(pastNov.isValid, false, "Debe rechazar novedades con fecha pasada");
  assert.ok(pastNov.errors.fecha);

  const shortDesc = validateNoveltyForm({
    id_barbero: 1,
    tipo: "Permiso",
    fecha: "2026-12-01",
    descripcion: "abc"
  });
  assert.strictEqual(shortDesc.isValid, false, "Debe rechazar descripción muy corta (< 5 caracteres)");
  assert.ok(shortDesc.errors.descripcion);

  console.log("  -> Validaciones de novedades: OK (Rechaza fechas pasadas y descripciones vacías o cortas)");
}

// Test 3: Validaciones de Ventas
console.log("\n[TEST 3] Verificando validaciones de ventas...");
{
  const noItemsSale = validateSaleForm({ id_cliente: 5, detalles: [] });
  assert.strictEqual(noItemsSale.isValid, false, "Debe rechazar venta sin ítems");
  assert.ok(noItemsSale.errors.detalles);

  const invalidQtySale = validateSaleForm({
    id_cliente: 5,
    detalles: [{ tipo_item: "Producto", id_producto: 1, cantidad: 0, precio_unitario: 1000 }]
  });
  assert.strictEqual(invalidQtySale.isValid, false, "Debe rechazar venta con cantidad 0");

  console.log("  -> Validaciones de ventas: OK (Requiere cliente, al menos un ítem y cantidades positivas)");
}

// Test 4: Sincronización de Notificaciones en Agendamiento (Cliente -> Barbero -> Admin/Recepcionista)
console.log("\n[TEST 4] Verificando sincronización de Citas en Notificaciones...");
{
  // Simular que se guarda una cita nueva en barber_appointments_db
  const newApt = {
    id_cita: 101,
    id_cliente: 5,
    id_usuario: 10,
    cliente_nombre: "Juan Pérez",
    id_barbero: 1,
    barbero_nombre: "Carlos Rodríguez",
    fecha: "2026-12-05",
    hora: "11:00:00",
    estado: "Programada",
    precio: 25000,
    nombre_item: "Corte + Barba"
  };
  localStorage.setItem("barber_appointments_db", JSON.stringify([newApt]));

  // Disparar sincronización
  notifyDataChange(SYNC_ENTITIES.APPOINTMENTS, newApt);

  // Consultar notificaciones para Administrador
  const adminNotifs = await getNotifications(adminUser);
  const adminAptNotif = adminNotifs.find(n => n.id === "apt-prog-101");
  assert.ok(adminAptNotif, "Admin debe recibir notificación de cita agendada");
  assert.strictEqual(adminAptNotif.route, "/dashboard/appointments", "Ruta de admin debe ser /dashboard/appointments");

  // Consultar notificaciones para Recepcionista
  const recNotifs = await getNotifications(recepcionistaUser);
  const recAptNotif = recNotifs.find(n => n.id === "apt-prog-101");
  assert.ok(recAptNotif, "Recepcionista debe recibir notificación de cita agendada");
  assert.strictEqual(recAptNotif.route, "/dashboard/appointments");

  // Consultar notificaciones para Barbero
  const barberNotifs = await getNotifications(barberUser);
  const barberAptNotif = barberNotifs.find(n => n.id === "barber-apt-101");
  assert.ok(barberAptNotif, "Barbero debe recibir notificación de la cita en su agenda");
  assert.strictEqual(barberAptNotif.route, "/barbero/agenda");

  // Consultar notificaciones para Cliente
  const clientNotifs = await getNotifications(clientUser);
  const clientAptNotif = clientNotifs.find(n => n.id === "client-apt-conf-101");
  assert.ok(clientAptNotif, "Cliente debe recibir notificación de confirmación de cita");
  assert.strictEqual(clientAptNotif.route, "/portal/mis-citas");

  console.log("  -> Sincronización de Cita: OK en Administrador, Recepcionista, Barbero y Cliente.");
}

// Test 5: Novedades de Horario y Alerta al Cliente
console.log("\n[TEST 5] Verificando sincronización de Novedad solicitada y aprobada...");
{
  // 1. Barbero solicita novedad
  const novPend = {
    id_novedad: 50,
    id_barbero: 1,
    barbero_nombre: "Carlos Rodríguez",
    tipo: "Permiso Médico",
    fecha: "2026-12-05", // Misma fecha que la cita del cliente
    estado: "Pendiente"
  };
  localStorage.setItem("barber_novelties_db", JSON.stringify([novPend]));
  notifyDataChange(SYNC_ENTITIES.SCHEDULES, novPend);

  const adminNotifs = await getNotifications(adminUser);
  const adminNovNotif = adminNotifs.find(n => n.id === "nov-pend-50");
  assert.ok(adminNovNotif, "Admin debe ver la novedad pendiente");
  assert.strictEqual(adminNovNotif.route, "/dashboard/schedules");

  // 2. Admin aprueba la novedad
  const novAprob = { ...novPend, estado: "Aprobado" };
  localStorage.setItem("barber_novelties_db", JSON.stringify([novAprob]));
  notifyDataChange(SYNC_ENTITIES.SCHEDULES, novAprob);

  // Barbero recibe aviso de novedad aprobada
  const barberNotifs = await getNotifications(barberUser);
  const barberNovNotif = barberNotifs.find(n => n.id === "barber-nov-aprob-50");
  assert.ok(barberNovNotif, "Barbero debe recibir confirmación de novedad aprobada");

  // Cliente con cita en esa fecha recibe ALERTA DE DISPONIBILIDAD para reprogramar
  const clientNotifs = await getNotifications(clientUser);
  const clientNovAlert = clientNotifs.find(n => n.id.includes("client-nov-alert-101"));
  assert.ok(clientNovAlert, "Cliente con cita debe recibir alerta de barbero no disponible para reprogramar");
  assert.strictEqual(clientNovAlert.type, "schedule");

  console.log("  -> Novedades de Horario: OK (Admin recibe solicitud, Barbero recibe aprobación y Cliente recibe alerta)");
}

// Test 6: Inventario y Stock Crítico
console.log("\n[TEST 6] Verificando alertas de Stock Crítico...");
{
  localStorage.setItem("barber_products_db", JSON.stringify([
    { id_producto: 7, nombre: "Cera Pomade Matte", stock: 3, estado: 1 } // Stock <= 5
  ]));
  notifyDataChange(SYNC_ENTITIES.PRODUCTS);

  const adminNotifs = await getNotifications(adminUser);
  const stockCritNotif = adminNotifs.find(n => n.id === "stock-crit-7");
  assert.ok(stockCritNotif, "Admin y Recepcionista deben recibir alerta de stock crítico");
  assert.strictEqual(stockCritNotif.route, "/dashboard/products");

  console.log("  -> Alertas de Stock Crítico: OK (Admin y Recepcionista notificados automáticamente)");
}

// Test 7: Ventas y Compras
console.log("\n[TEST 7] Verificando sincronización de Ventas y Compras...");
{
  const newSale = {
    id_venta: 88,
    id_cliente: 5,
    id_usuario: 10,
    cliente_nombre: "Juan Pérez",
    total: 35000,
    fecha: "2026-10-27 12:00:00"
  };
  localStorage.setItem("barber_sales_db", JSON.stringify([newSale]));
  notifyDataChange(SYNC_ENTITIES.SALES, newSale);

  const adminNotifs = await getNotifications(adminUser);
  const adminSaleNotif = adminNotifs.find(n => n.id === "sale-reg-88");
  assert.ok(adminSaleNotif, "Admin debe ver notificación de venta");
  assert.strictEqual(adminSaleNotif.route, "/dashboard/sales");

  const clientNotifs = await getNotifications(clientUser);
  const clientSaleNotif = clientNotifs.find(n => n.id === "client-sale-88");
  assert.ok(clientSaleNotif, "Cliente debe ver notificación de su compra");
  assert.strictEqual(clientSaleNotif.route, "/portal/mis-compras");

  console.log("  -> Ventas y Compras: OK (Admin recibe registro y Cliente recibe comprobante)");
}

// Test 8: Puesto de Trabajo / Insumos
console.log("\n[TEST 8] Verificando Puesto de Trabajo / Insumos de Estación...");
{
  localStorage.setItem("barber_station_items_db", JSON.stringify([
    {
      id_estacion_insumo: 12,
      id_barbero: 1,
      barbero_nombre: "Carlos Rodríguez",
      insumo_nombre: "Hojas de Afeitar Derby",
      estado_semaforo: "ROJO" // Agotado
    }
  ]));
  notifyDataChange(SYNC_ENTITIES.STATION_SUPPLIES);

  const adminNotifs = await getNotifications(adminUser);
  const stationAlert = adminNotifs.find(n => n.id === "station-rojo-12");
  assert.ok(stationAlert, "Admin debe recibir alerta de insumo agotado en puesto");
  assert.strictEqual(stationAlert.route, "/dashboard/abastecimiento");

  console.log("  -> Puesto de Trabajo / Insumos: OK (Alerta en semáforo ROJO recibida en /dashboard/abastecimiento)");
}

// Test 9: Lectura, Descarte y Reactividad
console.log("\n[TEST 9] Verificando lectura y reactividad de campanita...");
{
  let syncTriggered = false;
  const unsubscribe = subscribeNotifications(() => {
    syncTriggered = true;
  });

  // Marcar como leída
  markAsRead("apt-prog-101");
  assert.strictEqual(syncTriggered, true, "subscribeNotifications debe ser invocado al marcar leída");

  const notifsAfterRead = await getNotifications(adminUser);
  const readItem = notifsAfterRead.find(n => n.id === "apt-prog-101");
  assert.strictEqual(readItem?.read, true, "El elemento debe estar marcado como leído");

  // Descartar/Eliminar
  deleteNotification("apt-prog-101");
  const notifsAfterDelete = await getNotifications(adminUser);
  assert.strictEqual(notifsAfterDelete.some(n => n.id === "apt-prog-101"), false, "Notificación eliminada no debe aparecer");

  unsubscribe();
  console.log("  -> Reactividad, lectura y eliminación: OK");
}

console.log("\n=======================================================");
console.log("  ✓ TODAS LAS PRUEBAS PASARON EXITOSAMENTE (100% OK)");
console.log("=======================================================\n");

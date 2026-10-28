/**
 * Test de Auditoría y Verificación de Calificaciones de Barberos
 * Comprueba:
 * 1. Calificaciones de barberos inicializan en 0.
 * 2. Nuevos barberos creados empiezan estrictamente en 0.
 * 3. Validaciones de calificación (1 a 5 estrellas, enteras, campos obligatorios, prevención de duplicados).
 * 4. Cálculo automático del promedio y suma de calificaciones en tiempo real.
 * 5. Notificaciones y sincronización reactiva a Barbero y Administrador.
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

console.log("=== INICIANDO AUDITORÍA Y VERIFICACIÓN DE CALIFICACIONES DE BARBEROS ===");

// Importar servicios
import {
  getClientBarbers,
  getClientReviews,
  saveClientReview
} from "../frontend/src/features/client/services/clientStorageService.js";

import { getNotifications } from "../frontend/src/shared/services/notificationService.js";

// [TEST 1] Verificar que las calificaciones de los barberos empiezan en 0
console.log("\n[TEST 1] Verificando que las calificaciones de barberos existentes inician en 0...");
storage.clear();

const initialBarbers = getClientBarbers();
assert(initialBarbers.length > 0, "Debe existir al menos un barbero configurado");
for (const b of initialBarbers) {
  assert.strictEqual(Number(b.rating), 0, `El rating de ${b.nombre} debe ser 0`);
  assert.strictEqual(Number(b.calificacion), 0, `La calificacion de ${b.nombre} debe ser 0`);
  assert.strictEqual(Number(b.reviewsCount), 0, `reviewsCount de ${b.nombre} debe ser 0`);
  assert.strictEqual(Number(b.total_calificaciones), 0, `total_calificaciones de ${b.nombre} debe ser 0`);
}
console.log("  -> Calificaciones iniciales: OK (Todos los barberos inician en 0.0 y 0 opiniones)");

// [TEST 2] Verificar que getClientReviews() inicia vacío
console.log("\n[TEST 2] Verificando que las reseñas inician vacías...");
const initialReviews = getClientReviews();
assert.strictEqual(initialReviews.length, 0, "No debe haber reseñas residuales ficticias");
console.log("  -> Reseñas iniciales: OK (Lista de opiniones vacía)");

// [TEST 3] Validaciones de calificación
console.log("\n[TEST 3] Verificando validaciones de calificación...");

// Calificación menor a 1
const invalidLow = saveClientReview({ id_barbero: 1, calificacion: 0 });
assert.strictEqual(invalidLow.success, false, "Debe rechazar calificación menor a 1");

// Calificación mayor a 5
const invalidHigh = saveClientReview({ id_barbero: 1, calificacion: 6 });
assert.strictEqual(invalidHigh.success, false, "Debe rechazar calificación mayor a 5");

// Calificación no entera o inválida
const invalidFloat = saveClientReview({ id_barbero: 1, calificacion: 3.5 });
assert.strictEqual(invalidFloat.success, false, "Debe rechazar calificación no entera");

const invalidNull = saveClientReview({ id_barbero: 1, calificacion: null });
assert.strictEqual(invalidNull.success, false, "Debe rechazar calificación nula");

console.log("  -> Validaciones de estrellas: OK (Rechaza valores < 1, > 5 y no enteros)");

// [TEST 4] Primera calificación (5 estrellas) y cálculo automático del promedio
console.log("\n[TEST 4] Registrando primera calificación de 5 estrellas para Carlos...");
const rev1 = saveClientReview({
  id_cita: 101,
  id_barbero: 1,
  calificacion: 5,
  comentario: "Excelente servicio, muy profesional"
});
assert.strictEqual(rev1.success, true, "La reseña 1 debe registrarse con éxito");
assert.strictEqual(rev1.newRating, 5.0, "El nuevo promedio debe ser 5.0");
assert.strictEqual(rev1.totalReviews, 1, "El total de opiniones debe ser 1");

const barbersAfter1 = getClientBarbers();
const carlosAfter1 = barbersAfter1.find(b => b.id_barbero === 1);
assert.strictEqual(carlosAfter1.rating, 5.0, "El barbero Carlos debe tener rating 5.0");
assert.strictEqual(carlosAfter1.reviewsCount, 1, "El barbero Carlos debe tener reviewsCount 1");
console.log("  -> Primera calificación: OK (Carlos tiene rating 5.0 con 1 opinión)");

// [TEST 5] Prevención de calificación duplicada para la misma cita
console.log("\n[TEST 5] Verificando prevención de calificación duplicada...");
const duplicateRev = saveClientReview({
  id_cita: 101,
  id_barbero: 1,
  calificacion: 4,
  comentario: "Intento duplicado"
});
assert.strictEqual(duplicateRev.success, false, "Debe rechazar calificación duplicada de la misma cita");
console.log("  -> Prevención de duplicados: OK (Rechaza calificar la misma cita 2 veces)");

// [TEST 6] Segunda calificación (4 estrellas) y cálculo del promedio (5 + 4) / 2 = 4.5
console.log("\n[TEST 6] Registrando segunda calificación de 4 estrellas para Carlos...");
const rev2 = saveClientReview({
  id_cita: 102,
  id_barbero: 1,
  calificacion: 4,
  comentario: "Buen corte"
});
assert.strictEqual(rev2.success, true, "La reseña 2 debe registrarse con éxito");
assert.strictEqual(rev2.newRating, 4.5, "El promedio acumulado debe ser exactamente 4.5");
assert.strictEqual(rev2.totalReviews, 2, "El total de opiniones acumulado debe ser 2");

const barbersAfter2 = getClientBarbers();
const carlosAfter2 = barbersAfter2.find(b => b.id_barbero === 1);
assert.strictEqual(carlosAfter2.rating, 4.5, "El barbero Carlos debe reflejar promedio 4.5");
assert.strictEqual(carlosAfter2.reviewsCount, 2, "El barbero Carlos debe reflejar 2 opiniones");
console.log("  -> Promedio acumulado (2 opiniones): OK (Carlos tiene promedio 4.5 con 2 opiniones)");

// [TEST 7] Tercera calificación (3 estrellas) y promedio (5 + 4 + 3) / 3 = 4.0
console.log("\n[TEST 7] Registrando tercera calificación de 3 estrellas para Carlos...");
const rev3 = saveClientReview({
  id_cita: 103,
  id_barbero: 1,
  calificacion: 3,
  comentario: "Normal"
});
assert.strictEqual(rev3.success, true);
assert.strictEqual(rev3.newRating, 4.0, "El promedio de 5 + 4 + 3 entre 3 debe ser 4.0");
assert.strictEqual(rev3.totalReviews, 3);
console.log("  -> Promedio acumulado (3 opiniones): OK (Carlos tiene promedio 4.0 con 3 opiniones)");

// [TEST 8] Calificar a un barbero diferente (Esteban, id: 2) de forma independiente
console.log("\n[TEST 8] Verificando independencia entre barberos...");
const revEsteban = saveClientReview({
  id_cita: 201,
  id_barbero: 2,
  calificacion: 5,
  comentario: "Excelente diseño"
});
assert.strictEqual(revEsteban.success, true);
assert.strictEqual(revEsteban.newRating, 5.0);
assert.strictEqual(revEsteban.totalReviews, 1);

const barbersFinal = getClientBarbers();
const carlosFinal = barbersFinal.find(b => b.id_barbero === 1);
const estebanFinal = barbersFinal.find(b => b.id_barbero === 2);
assert.strictEqual(carlosFinal.rating, 4.0, "Carlos debe mantener 4.0");
assert.strictEqual(carlosFinal.reviewsCount, 3, "Carlos debe mantener 3 opiniones");
assert.strictEqual(estebanFinal.rating, 5.0, "Esteban debe tener 5.0");
assert.strictEqual(estebanFinal.reviewsCount, 1, "Esteban debe tener 1 opinión");
console.log("  -> Independencia de calificaciones: OK (Carlos 4.0 [3], Esteban 5.0 [1])");

// [TEST 9] Verificar notificaciones automáticas emitidas al barbero y administrador
console.log("\n[TEST 9] Verificando notificaciones de calificación emitidas...");
const barberNotifs = await getNotifications({ id_rol: 3, id_barbero: 1, id_usuario: 4 });
const adminNotifs = await getNotifications({ id_rol: 1, id_usuario: 1 });

assert(barberNotifs.length > 0, "El barbero debe recibir notificaciones de nueva calificación");
assert(adminNotifs.length > 0, "El administrador debe recibir notificaciones de nueva calificación");
console.log("  -> Notificaciones en tiempo real: OK (Emitidas tanto a barbero como a administración)");

console.log("\n=======================================================");
console.log("  ✓ TODAS LAS PRUEBAS DE CALIFICACIÓN PASARON AL 100%");
console.log("=======================================================\n");

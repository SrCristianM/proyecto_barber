/**
 * @file clientStorageService.js
 * Servicio centralizado de datos y sincronización para el Portal del Cliente.
 * Conectado con la arquitectura existente y persistencia en localStorage para compartir
 * información real (citas, barberos, horarios, servicios, paquetes, productos y ventas)
 * entre el Cliente y el Administrador.
 */

import { getCurrentUser, getStoredUsers, saveStoredUsers, updateUserProfile as authUpdateUserProfile } from "../../auth/services/authService.js";
import { getAppointments, createAppointment as apiCreateAppointment, updateAppointmentStatus as apiUpdateAppointmentStatus } from "../../admin/appointments/services/appointmentsService.js";
import { createSale as apiCreateSale } from "../../admin/sales/services/salesService.js";
import { createNotification } from "../../../shared/services/notificationService.js";
import { notifyDataChange, SYNC_ENTITIES } from "../../../shared/services/dataSyncService.js";
import { getServices } from "../../admin/services/services/servicesService.js";
import { getPackages } from "../../admin/services/services/packagesService.js";
import { getBarbers } from "../../admin/barbers/services/barbersService.js";
import { getSchedules } from "../../admin/schedules/services/schedulesService.js";
import { getProducts } from "../../admin/products/services/productsService.js";
import { getLocalDateString } from "../../../shared/utils/dateUtils.js";

// Claves de almacenamiento
const STORAGE_KEYS = {
  APPOINTMENTS: "barber_appointments_db",
  CLIENTS: "barber_clients_db",
  SALES: "barber_sales_db",
  SERVICES: "barber_services_db",
  PACKAGES: "barber_packages_db",
  PRODUCTS: "barber_products_db",
  BARBERS: "barber_barbers_db",
  SCHEDULES: "barber_schedules_db"
};

// Datos iniciales si aún no se han persistido
const INITIAL_SERVICES = [
  {
    id_servicio: 1,
    nombre: "Corte Clásico",
    id_categoria_servicio: 1,
    categoria: "Cortes",
    duracion_minutos: 30,
    precio: 15000,
    estado: 1,
    imagen_url: "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=600&auto=format&fit=crop&q=80"
  },
  {
    id_servicio: 2,
    nombre: "Corte + Barba",
    id_categoria_servicio: 4,
    categoria: "Combos",
    duracion_minutos: 45,
    precio: 25000,
    estado: 1,
    imagen_url: "https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=600&auto=format&fit=crop&q=80"
  },
  {
    id_servicio: 3,
    nombre: "Afeitado Premium",
    id_categoria_servicio: 2,
    categoria: "Barba",
    duracion_minutos: 35,
    precio: 20000,
    estado: 1,
    imagen_url: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=600&auto=format&fit=crop&q=80"
  },
  {
    id_servicio: 4,
    nombre: "Diseño y Color",
    id_categoria_servicio: 3,
    categoria: "Tratamientos",
    duracion_minutos: 60,
    precio: 30000,
    estado: 1,
    imagen_url: "https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=600&auto=format&fit=crop&q=80"
  }
];

const INITIAL_PACKAGES = [];

const INITIAL_PRODUCTS = [];

const INITIAL_BARBERS = [
  {
    id_barbero: 1,
    id_usuario: 4,
    nombre: "Carlos",
    apellido: "Rodríguez",
    correo: "barbero@tuturnobarber.com",
    telefono: "+57 302 345 6789",
    especialidad: "Corte Clásico & Fade",
    imagen_url: null,
    estado: 1
  },
  {
    id_barbero: 2,
    id_usuario: 12,
    nombre: "Esteban",
    apellido: "Mejía",
    correo: "esteban1235@gmail.com",
    telefono: "+57 312 456 5697",
    especialidad: "Corte Clásico, Diseño y Color",
    imagen_url: null,
    estado: 1
  }
];

const INITIAL_SCHEDULES = [
  // Carlos Rodríguez (1)
  { id_horario: 1, id_barbero: 1, dia_semana: "Lunes", hora_inicio: "08:00:00", hora_fin: "18:00:00", estado: 1, barbero_nombre: "Carlos Rodríguez" },
  { id_horario: 2, id_barbero: 1, dia_semana: "Martes", hora_inicio: "08:00:00", hora_fin: "18:00:00", estado: 1, barbero_nombre: "Carlos Rodríguez" },
  { id_horario: 3, id_barbero: 1, dia_semana: "Miercoles", hora_inicio: "08:00:00", hora_fin: "18:00:00", estado: 1, barbero_nombre: "Carlos Rodríguez" },
  { id_horario: 4, id_barbero: 1, dia_semana: "Jueves", hora_inicio: "08:00:00", hora_fin: "18:00:00", estado: 1, barbero_nombre: "Carlos Rodríguez" },
  { id_horario: 5, id_barbero: 1, dia_semana: "Viernes", hora_inicio: "08:00:00", hora_fin: "18:00:00", estado: 1, barbero_nombre: "Carlos Rodríguez" },
  { id_horario: 6, id_barbero: 1, dia_semana: "Sabado", hora_inicio: "08:00:00", hora_fin: "18:00:00", estado: 1, barbero_nombre: "Carlos Rodríguez" },
  // Esteban Gómez (2)
  { id_horario: 7, id_barbero: 2, dia_semana: "Lunes", hora_inicio: "09:00:00", hora_fin: "19:00:00", estado: 1, barbero_nombre: "Esteban Gómez" },
  { id_horario: 8, id_barbero: 2, dia_semana: "Martes", hora_inicio: "09:00:00", hora_fin: "19:00:00", estado: 1, barbero_nombre: "Esteban Gómez" },
  { id_horario: 9, id_barbero: 2, dia_semana: "Miercoles", hora_inicio: "09:00:00", hora_fin: "19:00:00", estado: 1, barbero_nombre: "Esteban Gómez" },
  { id_horario: 10, id_barbero: 2, dia_semana: "Jueves", hora_inicio: "09:00:00", hora_fin: "19:00:00", estado: 1, barbero_nombre: "Esteban Gómez" },
  { id_horario: 11, id_barbero: 2, dia_semana: "Viernes", hora_inicio: "09:00:00", hora_fin: "19:00:00", estado: 1, barbero_nombre: "Esteban Gómez" },
  { id_horario: 12, id_barbero: 2, dia_semana: "Sabado", hora_inicio: "09:00:00", hora_fin: "19:00:00", estado: 1, barbero_nombre: "Esteban Gómez" }
];


const INITIAL_CLIENTS = [];

const TODAY = getLocalDateString();

const INITIAL_APPOINTMENTS = [];

const INITIAL_SALES = [];

/** Lee o inicializa un array en localStorage */
function getOrInit(key, initialData) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      localStorage.setItem(key, JSON.stringify(initialData));
      return initialData;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : initialData;
  } catch (err) {
    console.error(`Error leyendo ${key} de localStorage:`, err);
    return initialData;
  }
}

/** Guarda datos en localStorage */
function save(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (err) {
    console.error(`Error guardando ${key} en localStorage:`, err);
  }
}

export async function syncCatalogsFromApi() {
  try {
    const [servRes, packRes, barbRes, schedRes, prodRes, aptsRes] = await Promise.allSettled([
      getServices(),
      getPackages(),
      getBarbers(),
      getSchedules(),
      getProducts(),
      getAppointments()
    ]);
    if (servRes.status === "fulfilled" && Array.isArray(servRes.value)) {
      save(STORAGE_KEYS.SERVICES, servRes.value);
    }
    if (packRes.status === "fulfilled" && Array.isArray(packRes.value)) {
      save(STORAGE_KEYS.PACKAGES, packRes.value);
    }
    if (barbRes.status === "fulfilled" && Array.isArray(barbRes.value)) {
      const current = getOrInit(STORAGE_KEYS.BARBERS, INITIAL_BARBERS);
      const map = new Map();
      current.forEach((b) => {
        if (b && b.id_barbero) map.set(Number(b.id_barbero), b);
      });
      barbRes.value.forEach((b) => {
        if (b && b.id_barbero) {
          const prev = map.get(Number(b.id_barbero)) || {};
          map.set(Number(b.id_barbero), { ...prev, ...b });
        }
      });
      save(STORAGE_KEYS.BARBERS, Array.from(map.values()));
    }
    if (schedRes.status === "fulfilled" && Array.isArray(schedRes.value)) {
      const current = getOrInit(STORAGE_KEYS.SCHEDULES, INITIAL_SCHEDULES);
      const map = new Map();
      current.forEach((s) => {
        if (s && s.id_horario) map.set(Number(s.id_horario), s);
      });
      schedRes.value.forEach((s) => {
        if (s && s.id_horario) {
          const prev = map.get(Number(s.id_horario)) || {};
          map.set(Number(s.id_horario), { ...prev, ...s });
        }
      });
      save(STORAGE_KEYS.SCHEDULES, Array.from(map.values()));
    }
    if (prodRes.status === "fulfilled" && Array.isArray(prodRes.value)) {
      save(STORAGE_KEYS.PRODUCTS, prodRes.value);
    }
    if (aptsRes.status === "fulfilled" && Array.isArray(aptsRes.value)) {
      const current = getOrInit(STORAGE_KEYS.APPOINTMENTS, []);
      const map = new Map();
      aptsRes.value.forEach((a) => map.set(Number(a.id_cita), a));
      current.forEach((a) => {
        if (a.id_cita && !map.has(Number(a.id_cita))) {
          map.set(Number(a.id_cita), a);
        }
      });
      save(STORAGE_KEYS.APPOINTMENTS, Array.from(map.values()));
    }
  } catch (e) {
    console.warn("[ClientStorage] Error al sincronizar catálogos:", e);
  }
}

// Sincronizador en segundo plano cuando se detectan eventos de datos
if (typeof window !== "undefined") {
  window.addEventListener("barber_data_sync", (event) => {
    const detail = event?.detail;
    if (!detail) return;
    try {
      if (detail.entity === "packages") {
        if (detail.payload?.deleted && detail.payload.id_paquete) {
          const current = getOrInit(STORAGE_KEYS.PACKAGES, []);
          const updated = current.filter((p) => p.id_paquete !== detail.payload.id_paquete);
          save(STORAGE_KEYS.PACKAGES, updated);
        } else {
          getPackages().then((pkgs) => {
            if (Array.isArray(pkgs)) save(STORAGE_KEYS.PACKAGES, pkgs);
          }).catch(() => { });
        }
      } else if (detail.entity === "services") {
        if (detail.payload?.deleted && detail.payload.id_servicio) {
          const current = getOrInit(STORAGE_KEYS.SERVICES, []);
          const updated = current.filter((s) => s.id_servicio !== detail.payload.id_servicio);
          save(STORAGE_KEYS.SERVICES, updated);
        } else {
          getServices().then((srvs) => {
            if (Array.isArray(srvs)) save(STORAGE_KEYS.SERVICES, srvs);
          }).catch(() => { });
        }
      } else if (detail.entity === "products") {
        if (detail.payload?.deleted && detail.payload.id_producto) {
          const current = getOrInit(STORAGE_KEYS.PRODUCTS, []);
          const updated = current.filter((p) => p.id_producto !== detail.payload.id_producto);
          save(STORAGE_KEYS.PRODUCTS, updated);
        } else {
          getProducts().then((prods) => {
            if (Array.isArray(prods)) save(STORAGE_KEYS.PRODUCTS, prods);
          }).catch(() => { });
        }
      } else if (detail.entity === "appointments") {
        getAppointments().then((apts) => {
          if (Array.isArray(apts)) {
            const current = getOrInit(STORAGE_KEYS.APPOINTMENTS, []);
            const map = new Map();
            apts.forEach((a) => map.set(Number(a.id_cita), a));
            current.forEach((a) => {
              if (a.id_cita && !map.has(Number(a.id_cita))) {
                map.set(Number(a.id_cita), a);
              }
            });
            save(STORAGE_KEYS.APPOINTMENTS, Array.from(map.values()));
          }
        }).catch(() => { });
      } else if (detail.entity === "barbers") {
        if (detail.payload?.deleted && detail.payload.id_barbero) {
          const current = getOrInit(STORAGE_KEYS.BARBERS, INITIAL_BARBERS);
          const updated = current.filter((b) => b.id_barbero !== detail.payload.id_barbero);
          save(STORAGE_KEYS.BARBERS, updated);
        } else if (detail.payload && detail.payload.id_barbero) {
          const current = getOrInit(STORAGE_KEYS.BARBERS, INITIAL_BARBERS);
          const map = new Map();
          current.forEach((b) => map.set(Number(b.id_barbero), b));
          map.set(Number(detail.payload.id_barbero), {
            ...(map.get(Number(detail.payload.id_barbero)) || {}),
            ...detail.payload
          });
          save(STORAGE_KEYS.BARBERS, Array.from(map.values()));
        }
        getBarbers().then((barbs) => {
          if (Array.isArray(barbs)) {
            const current = getOrInit(STORAGE_KEYS.BARBERS, INITIAL_BARBERS);
            const map = new Map();
            current.forEach((b) => map.set(Number(b.id_barbero), b));
            barbs.forEach((b) => {
              if (b && b.id_barbero) {
                map.set(Number(b.id_barbero), { ...(map.get(Number(b.id_barbero)) || {}), ...b });
              }
            });
            save(STORAGE_KEYS.BARBERS, Array.from(map.values()));
          }
        }).catch(() => { });
      } else if (detail.entity === "schedules") {
        if (detail.payload?.deleted && detail.payload.id_horario) {
          const current = getOrInit(STORAGE_KEYS.SCHEDULES, INITIAL_SCHEDULES);
          const updated = current.filter((s) => s.id_horario !== detail.payload.id_horario);
          save(STORAGE_KEYS.SCHEDULES, updated);
        } else if (detail.payload && detail.payload.id_horario) {
          const current = getOrInit(STORAGE_KEYS.SCHEDULES, INITIAL_SCHEDULES);
          const map = new Map();
          current.forEach((s) => map.set(Number(s.id_horario), s));
          map.set(Number(detail.payload.id_horario), {
            ...(map.get(Number(detail.payload.id_horario)) || {}),
            ...detail.payload
          });
          save(STORAGE_KEYS.SCHEDULES, Array.from(map.values()));
        }
        getSchedules().then((scheds) => {
          if (Array.isArray(scheds)) {
            const current = getOrInit(STORAGE_KEYS.SCHEDULES, INITIAL_SCHEDULES);
            const map = new Map();
            current.forEach((s) => map.set(Number(s.id_horario), s));
            scheds.forEach((s) => {
              if (s && s.id_horario) {
                map.set(Number(s.id_horario), { ...(map.get(Number(s.id_horario)) || {}), ...s });
              }
            });
            save(STORAGE_KEYS.SCHEDULES, Array.from(map.values()));
          }
        }).catch(() => { });
      }
    } catch (e) {
      console.warn("[ClientStorage] Error procesando evento reactivo de sincronización:", e);
    }
  });
}

// ==========================================
// CONSULTA DE CATÁLOGOS CON AUTO-REPARACIÓN DE IMÁGENES
// ==========================================

const DEFAULT_SERVICE_FALLBACKS = {
  1: "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=600&auto=format&fit=crop&q=80", // Corte Clásico
  2: "https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=600&auto=format&fit=crop&q=80", // Corte + Barba
  3: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=600&auto=format&fit=crop&q=80", // Afeitado Premium
  4: "https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=600&auto=format&fit=crop&q=80", // Diseño y Color
  5: "https://images.unsplash.com/photo-1517832606589-7629c3395909?w=600&auto=format&fit=crop&q=80"  // Corte Niño
};

const DEFAULT_PRODUCT_FALLBACKS = {
  1: "https://images.unsplash.com/photo-1598452963314-b09f397a5c48?w=600&auto=format&fit=crop&q=80", // Gel
  2: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&auto=format&fit=crop&q=80", // Cera Mate
  3: "https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?w=600&auto=format&fit=crop&q=80", // Shampoo
  4: "https://images.unsplash.com/photo-1621607512214-68297480165e?w=600&auto=format&fit=crop&q=80", // Aceite Barba
  5: "https://images.unsplash.com/photo-1512690459411-b9245aed614b?w=600&auto=format&fit=crop&q=80", // Navaja
  6: "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=600&auto=format&fit=crop&q=80", // Tijeras
  7: "https://images.unsplash.com/photo-1590439471364-192aa70c0b53?w=600&auto=format&fit=crop&q=80", // Peine
  8: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600&auto=format&fit=crop&q=80"  // Aftershave
};

export function getClientServices() {
  const services = getOrInit(STORAGE_KEYS.SERVICES, INITIAL_SERVICES);
  let changed = false;
  const healed = services.map((s) => {
    if (!s.imagen_url || s.imagen_url.trim() === "" || s.imagen_url.includes("placeholder")) {
      changed = true;
      return {
        ...s,
        imagen_url: DEFAULT_SERVICE_FALLBACKS[s.id_servicio] || "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=600&auto=format&fit=crop&q=80"
      };
    }
    return s;
  });
  if (changed) {
    save(STORAGE_KEYS.SERVICES, healed);
  }
  return healed.filter((s) => s.estado === 1);
}

export async function fetchClientPackages() {
  try {
    const pkgs = await getPackages();
    if (Array.isArray(pkgs)) {
      save(STORAGE_KEYS.PACKAGES, pkgs);
    }
  } catch (err) {
    console.warn("[ClientStorage] Error consultando paquetes desde API:", err.message);
  }
  return getClientPackages();
}

export async function fetchClientServices() {
  try {
    const srvs = await getServices();
    if (Array.isArray(srvs)) {
      save(STORAGE_KEYS.SERVICES, srvs);
    }
  } catch (err) {
    console.warn("[ClientStorage] Error consultando servicios desde API:", err.message);
  }
  return getClientServices();
}

export function getClientPackages() {
  const packages = getOrInit(STORAGE_KEYS.PACKAGES, INITIAL_PACKAGES).filter((p) => p.estado === 1);
  const services = getClientServices();

  return packages.map((pkg) => {
    // Si ya trae el listado poblado de servicios desde el backend
    const includedServices = (Array.isArray(pkg.servicios) && pkg.servicios.length > 0)
      ? pkg.servicios
      : (pkg.servicios_ids || []).map((id) =>
        services.find((s) => s.id_servicio === Number(id))
      ).filter(Boolean);

    const originalPrice = pkg.precio_base
      ? Number(pkg.precio_base)
      : includedServices.reduce((sum, s) => sum + Number(s.precio || 0), 0);

    const discount = Number(pkg.descuento_porcentaje || 0);

    const finalPrice = pkg.precio_final !== undefined
      ? Number(pkg.precio_final)
      : Math.round(originalPrice * (1 - discount / 100));

    const totalDuration = includedServices.reduce((sum, s) => sum + Number(s.duracion_minutos || 0), 0);

    return {
      ...pkg,
      servicios: includedServices,
      precioOriginal: originalPrice,
      precioFinal: finalPrice,
      ahorro: Math.max(0, originalPrice - finalPrice),
      duracionTotal: totalDuration
    };
  });
}

export function getClientProducts() {
  const products = getOrInit(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
  let changed = false;
  const healed = products.map((p) => {
    const isBadUrl =
      !p.imagen_url ||
      p.imagen_url.trim() === "" ||
      p.imagen_url.includes("placeholder") ||
      p.imagen_url.includes("photo-1608248597359-00f72365851d");
    if (isBadUrl) {
      changed = true;
      return {
        ...p,
        imagen_url:
          DEFAULT_PRODUCT_FALLBACKS[p.id_producto] ||
          "https://images.unsplash.com/photo-1621607512214-68297480165e?w=600&auto=format&fit=crop&q=80"
      };
    }
    return p;
  });
  if (changed) {
    save(STORAGE_KEYS.PRODUCTS, healed);
  }
  return healed.filter((p) => p.estado === 1);
}

export function getClientBarbers() {
  const stored = getOrInit(STORAGE_KEYS.BARBERS, INITIAL_BARBERS);
  // Asegurar que solo existan los barberos registrados en el sistema (limpiar solo posibles cuentas de pruebas ficticias)
  const barbers = stored.filter((b) => b.correo !== "mateo@tuturno.com");
  if (barbers.length !== stored.length) {
    save(STORAGE_KEYS.BARBERS, barbers);
  }

  const barberMetadata = {
    1: { rating: 4.9, reviewsCount: 148, badge: "Master Fade", nextSlot: "Hoy 16:00" },
    2: { rating: 4.8, reviewsCount: 112, badge: "Color & Tendencias", nextSlot: "Hoy 17:30" }
  };

  const cleanPhoto = (url) => {
    if (!url || typeof url !== "string") return null;
    const trimmed = url.trim();
    if (trimmed === "" || trimmed === "null" || trimmed === "undefined") return null;
    if (
      trimmed.includes("images.unsplash.com/photo-1534528741775-53994a69daeb") ||
      trimmed.includes("images.unsplash.com/photo-1507003211169-0a1dd7228f2d") ||
      trimmed.includes("images.unsplash.com/photo-1585747860715-2ba37e788b70")
    ) {
      return null;
    }
    return trimmed;
  };

  let changed = false;
  const healed = barbers.map((b) => {
    const cleanedImg = cleanPhoto(b.imagen_url);
    if (cleanedImg !== b.imagen_url) {
      changed = true;
    }
    const meta = barberMetadata[b.id_barbero] || {
      rating: 4.9,
      reviewsCount: 24,
      badge: b.especialidad ? b.especialidad.split(",")[0].trim() : "Barbero Profesional",
      nextSlot: "Disponible"
    };
    return {
      ...b,
      nombre: b.nombre || "Barbero",
      apellido: b.apellido || "",
      especialidad: b.especialidad || "Cortes & Barba Profesional",
      imagen_url: cleanedImg,
      rating: b.rating || meta.rating,
      reviewsCount: b.reviewsCount || meta.reviewsCount,
      badge: b.badge || meta.badge,
      nextSlot: meta.nextSlot
    };
  });
  if (changed) {
    save(STORAGE_KEYS.BARBERS, healed);
  }
  return healed.filter((b) => Number(b.estado) === 1 || b.estado === undefined || b.estado === "1");
}

/**
 * Consulta el estado y movimientos en tiempo real de los barberos en el salón.
 * Cruza los barberos registrados y activos con las citas programadas para el momento exacto.
 */
export function getLiveBarbersStatus() {
  const barbers = getClientBarbers();
  const allAppointments = getOrInit(STORAGE_KEYS.APPOINTMENTS, INITIAL_APPOINTMENTS);

  const now = new Date();
  const todayStr = getLocalDateString(now);
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  let busyCount = 0;

  const barbersWithStatus = barbers.map((b) => {
    // Buscar si tiene una cita activa hoy en este momento
    const currentAppointment = allAppointments.find((apt) => {
      if (Number(apt.id_barbero) !== Number(b.id_barbero)) return false;
      if (apt.fecha !== todayStr) return false;
      if (apt.estado === "Cancelada" || apt.estado === "Completada") return false;

      const [h, m] = (apt.hora || "00:00").split(":").map(Number);
      const startMin = (h || 0) * 60 + (m || 0);
      const duration = Number(apt.duracion || apt.duracion_minutos || 30);
      const endMin = startMin + duration;

      return currentMinutes >= startMin && currentMinutes < endMin;
    });

    if (currentAppointment) {
      busyCount++;
      const [h, m] = (currentAppointment.hora || "00:00").split(":").map(Number);
      const startMin = (h || 0) * 60 + (m || 0);
      const duration = Number(currentAppointment.duracion || currentAppointment.duracion_minutos || 30);
      const endMin = startMin + duration;
      const endHourStr = `${Math.floor(endMin / 60).toString().padStart(2, "0")}:${(endMin % 60).toString().padStart(2, "0")}`;

      return {
        ...b,
        isBusy: true,
        statusText: "Atendiendo cliente",
        movementDescription: `En atención con cliente (hasta ${endHourStr})`,
        serviceName: currentAppointment.servicioNombre || currentAppointment.nombre_item || "Corte",
        endsAt: endHourStr,
        remainingMinutes: Math.max(1, endMin - currentMinutes)
      };
    }

    return {
      ...b,
      isBusy: false,
      statusText: "En silla • Disponible",
      movementDescription: "En silla listo para atender",
      serviceName: null,
      endsAt: null,
      remainingMinutes: 0
    };
  });

  const totalBarbers = barbers.length;
  const freeBarbers = Math.max(0, totalBarbers - busyCount);

  let estimatedWaitTime = "Inmediata (Sin espera)";
  if (totalBarbers === 0) {
    estimatedWaitTime = "Sin servicio activo";
  } else if (freeBarbers === 0) {
    const remainingTimes = barbersWithStatus.map((b) => b.remainingMinutes).filter((t) => t > 0);
    const minWait = remainingTimes.length > 0 ? Math.min(...remainingTimes) : 15;
    estimatedWaitTime = `${minWait}-${minWait + 10} min`;
  }

  return {
    totalBarbers,
    busyCount,
    freeBarbers,
    estimatedWaitTime,
    barbers: barbersWithStatus
  };
}

export function getClientSchedules() {
  const current = getOrInit(STORAGE_KEYS.SCHEDULES, INITIAL_SCHEDULES);
  if (!Array.isArray(current)) {
    save(STORAGE_KEYS.SCHEDULES, INITIAL_SCHEDULES);
    return INITIAL_SCHEDULES;
  }
  return current.filter((s) => Number(s.estado) === 1 || s.estado === undefined || s.estado === "1");
}

// ==========================================
// PERFIL DEL CLIENTE ACTUAL
// ==========================================

export function getCurrentClientProfile() {
  const user = getCurrentUser();
  if (!user) return null;

  const clients = getOrInit(STORAGE_KEYS.CLIENTS, INITIAL_CLIENTS);
  const cleanEmail = (user.correo || "").trim().toLowerCase();
  let client = clients.find(
    (c) =>
      (user.id_usuario && Number(c.id_usuario) === Number(user.id_usuario)) ||
      (c.correo && c.correo.toLowerCase() === cleanEmail)
  );

  if (!client) {
    const nextId = Math.max(...clients.map((c) => Number(c.id_cliente) || 0), 0) + 1;
    client = {
      id_cliente: nextId,
      id_usuario: user.id_usuario,
      documento: user.documento || "",
      nombre: (user.nombre || "").trim(),
      apellido: (user.apellido || "").trim(),
      correo: cleanEmail,
      telefono: user.telefono || "",
      direccion: "No especificada",
      nivel_fidelidad: "Nuevo",
      puntos_fidelidad: 0,
      estado: 1
    };
    save(STORAGE_KEYS.CLIENTS, [...clients, client]);
  } else {
    // Sincronizar en caso de que los datos del usuario hayan sido actualizados
    let needsUpdate = false;
    if (client.puntos_fidelidad === undefined) {
      // Todo cliente nuevo inicia con 0 puntos; si tiene citas completadas previas se calculan
      const allAppointments = getOrInit(STORAGE_KEYS.APPOINTMENTS, []);
      const completedCount = allAppointments.filter(
        (a) =>
          a.estado === "Completada" &&
          ((a.id_cliente && Number(a.id_cliente) === Number(client.id_cliente)) ||
            (a.id_usuario && Number(a.id_usuario) === Number(user.id_usuario)) ||
            (a.cliente_correo && a.cliente_correo.toLowerCase() === cleanEmail))
      ).length;
      client.puntos_fidelidad = completedCount * 50;
      needsUpdate = true;
    }
    if (user.documento && client.documento !== user.documento.trim()) {
      client.documento = user.documento.trim();
      needsUpdate = true;
    }
    if (user.nombre && client.nombre !== user.nombre.trim()) {
      client.nombre = user.nombre.trim();
      needsUpdate = true;
    }
    if (user.apellido && client.apellido !== user.apellido.trim()) {
      client.apellido = user.apellido.trim();
      needsUpdate = true;
    }
    if (user.telefono && client.telefono !== user.telefono.trim()) {
      client.telefono = user.telefono.trim();
      needsUpdate = true;
    }
    if (user.correo && client.correo !== cleanEmail) {
      client.correo = cleanEmail;
      needsUpdate = true;
    }
    if (needsUpdate) {
      save(STORAGE_KEYS.CLIENTS, clients);
    }
  }

  return {
    ...client,
    puntos_fidelidad: Number(client.puntos_fidelidad ?? 0),
    nivel_fidelidad: client.nivel_fidelidad || "Nuevo",
    documento: user.documento || client.documento || "",
    nombre: user.nombre || client.nombre,
    apellido: user.apellido || client.apellido,
    correo: user.correo || client.correo,
    telefono: user.telefono || client.telefono
  };
}

export async function updateClientProfile(updatedData) {
  const user = getCurrentUser();
  if (!user) return { success: false, error: "No hay sesión activa." };

  // 1. Actualizar en lista de usuarios
  const users = getStoredUsers();
  const userIdx = users.findIndex((u) => u.id_usuario === user.id_usuario);
  if (userIdx >= 0) {
    users[userIdx] = {
      ...users[userIdx],
      documento: updatedData.documento ? updatedData.documento.trim() : users[userIdx].documento,
      nombre: updatedData.nombre.trim(),
      apellido: updatedData.apellido.trim(),
      telefono: updatedData.telefono ? updatedData.telefono.trim() : users[userIdx].telefono,
      direccion: updatedData.direccion ? updatedData.direccion.trim() : users[userIdx].direccion
    };
    if (updatedData.nuevaContrasena) {
      users[userIdx].contrasena = updatedData.nuevaContrasena;
    }
    saveStoredUsers(users);
  }

  // 2. Actualizar en lista de clientes
  const clients = getOrInit(STORAGE_KEYS.CLIENTS, INITIAL_CLIENTS);
  const clientIdx = clients.findIndex((c) => c.id_usuario === user.id_usuario || c.correo === user.correo);
  if (clientIdx >= 0) {
    clients[clientIdx] = {
      ...clients[clientIdx],
      documento: updatedData.documento ? updatedData.documento.trim() : clients[clientIdx].documento,
      nombre: updatedData.nombre.trim(),
      apellido: updatedData.apellido.trim(),
      telefono: updatedData.telefono ? updatedData.telefono.trim() : clients[clientIdx].telefono,
      direccion: updatedData.direccion ? updatedData.direccion.trim() : clients[clientIdx].direccion
    };
    save(STORAGE_KEYS.CLIENTS, clients);
  }

  // 3. Actualizar sesión actual
  const refreshedUser = users[userIdx] || { ...user, ...updatedData };
  localStorage.setItem("barber_current_user", JSON.stringify(refreshedUser));

  // 4. Sincronizar con API backend
  try {
    await authUpdateUserProfile(updatedData);
  } catch (e) {
    console.warn("[ClientStorage] Error al sincronizar actualización con backend:", e);
  }

  return { success: true, profile: getCurrentClientProfile() };
}

// ==========================================
// CITAS DEL CLIENTE Y GESTIÓN
// ==========================================

export function getClientAppointments() {
  const client = getCurrentClientProfile();
  if (!client) return [];

  const allAppointments = getOrInit(STORAGE_KEYS.APPOINTMENTS, INITIAL_APPOINTMENTS);
  const barbers = getClientBarbers();
  const services = getClientServices();
  const packages = getClientPackages();

  // Filtrar citas correspondientes a este cliente
  return allAppointments
    .filter(
      (apt) =>
        Number(apt.id_cliente) === Number(client.id_cliente) ||
        (client.id_usuario && Number(apt.id_usuario) === Number(client.id_usuario)) ||
        (apt.cliente_correo && client.correo && apt.cliente_correo.toLowerCase() === client.correo.toLowerCase())
    )
    .map((apt) => {
      const barber = barbers.find((b) => b.id_barbero === Number(apt.id_barbero)) || {
        nombre: "Barbero Profesional",
        especialidad: "Estilismo"
      };

      const service = services.find((s) => s.id_servicio === Number(apt.id_servicio));
      const pkg = apt.id_paquete ? packages.find((p) => p.id_paquete === Number(apt.id_paquete)) : null;

      const title = apt.nombre_item || (pkg ? pkg.nombre : service ? service.nombre : "Servicio de Barbería");

      return {
        ...apt,
        barberoNombre: `${barber.nombre} ${barber.apellido || ""}`.trim(),
        barberoEspecialidad: barber.especialidad || "General",
        barberoFoto: barber.imagen_url || "",
        tituloItem: title,
        servicioNombre: service ? service.nombre : title,
        paqueteNombre: pkg ? pkg.nombre : null,
        duracion: service ? service.duracion_minutos : pkg ? pkg.duracionTotal : 30
      };
    })
    .sort((a, b) => new Date(`${b.fecha} ${b.hora}`) - new Date(`${a.fecha} ${a.hora}`));
}

/**
 * Calcula los horarios disponibles reales para un barbero en una fecha determinada.
 * Cruza los horarios configurados del barbero con las citas ocupadas de ese día.
 */
export function getAvailableSlots(id_barbero, isoDate) {
  if (!id_barbero || !isoDate) return [];

  const schedules = getClientSchedules();
  const allAppointments = getOrInit(STORAGE_KEYS.APPOINTMENTS, INITIAL_APPOINTMENTS);

  // Determinar día de la semana en español
  const dateObj = new Date(isoDate + "T12:00:00");
  const daysMap = ["Domingo", "Lunes", "Martes", "Miercoles", "Jueves", "Viernes", "Sabado"];
  const dayName = daysMap[dateObj.getDay()];

  // Buscar turno del barbero para este día de la semana (soporta dia_semana o dias_semana)
  const norm = (str) =>
    String(str || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

  const barberSchedule = schedules.find((s) => {
    if (Number(s.id_barbero) !== Number(id_barbero)) return false;
    if (Number(s.estado) === 0) return false;
    if (s.dia_semana && norm(s.dia_semana) === norm(dayName)) return true;
    if (Array.isArray(s.dias_semana) && s.dias_semana.some((d) => norm(d) === norm(dayName))) return true;
    return false;
  });

  if (!barberSchedule) {
    return []; // No labora ese día
  }

  const startHour = parseInt((barberSchedule.hora_inicio || "08:00").substring(0, 2), 10);
  const endHour = parseInt((barberSchedule.hora_fin || "18:00").substring(0, 2), 10);

  // Generar slots de 45 min / 1h dentro de la jornada
  const possibleSlots = [];
  for (let hour = startHour; hour < endHour; hour++) {
    possibleSlots.push(`${hour.toString().padStart(2, "0")}:00`);
    if (hour + 1 <= endHour) {
      possibleSlots.push(`${hour.toString().padStart(2, "0")}:30`);
    }
  }

  // Verificar novedades aprobadas del barbero (Ausencia, Permiso, Cambio de turno) en la fecha
  let approvedNovelty = null;
  try {
    const rawNov = localStorage.getItem("barber_novelties_db");
    const novelties = rawNov ? JSON.parse(rawNov) : [];
    approvedNovelty = novelties.find(
      (n) =>
        Number(n.id_barbero) === Number(id_barbero) &&
        n.fecha === isoDate &&
        (n.estado === "Aprobado" || n.estado === "Aprobada")
    );
  } catch (err) {
    approvedNovelty = null;
  }

  if (approvedNovelty) {
    // Novedad aprobada: inhabilita la agenda completa para este barbero en este día
    return possibleSlots.map((slot) => ({
      hora: slot,
      disponible: false,
      bloqueadoPorNovedad: true,
      novedadMotivo: approvedNovelty.motivo || approvedNovelty.tipo || "Permiso o Ausencia Concedida"
    }));
  }

  // Filtrar citas ya agendadas de ese barbero en esa fecha (excluyendo canceladas)
  const busyTimes = allAppointments
    .filter(
      (a) =>
        Number(a.id_barbero) === Number(id_barbero) &&
        a.fecha === isoDate &&
        a.estado !== "Cancelada"
    )
    .map((a) => a.hora.substring(0, 5));

  return possibleSlots.map((slot) => ({
    hora: slot,
    disponible: !busyTimes.includes(slot),
    bloqueadoPorNovedad: false
  }));
}

/**
 * Consulta si un barbero tiene alguna novedad aprobada para una fecha específica.
 */
export function checkBarberApprovedNovelty(id_barbero, isoDate) {
  if (!id_barbero || !isoDate) return null;
  try {
    const rawNov = localStorage.getItem("barber_novelties_db");
    const novelties = rawNov ? JSON.parse(rawNov) : [];
    return novelties.find(
      (n) =>
        Number(n.id_barbero) === Number(id_barbero) &&
        n.fecha === isoDate &&
        (n.estado === "Aprobado" || n.estado === "Aprobada")
    ) || null;
  } catch {
    return null;
  }
}

/**
 * Normaliza nombres de días (elimina tildes, minúsculas, espacios)
 */
function normalizeDayName(d) {
  return String(d || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

/**
 * Determina si un barbero tiene jornada laboral configurada y activa en una fecha específica.
 * @param {number|string} id_barbero
 * @param {string} isoDate - formato YYYY-MM-DD
 * @returns {{ isWorking: boolean, schedule: object|null }}
 */
export function isBarberWorkingOnDate(id_barbero, isoDate) {
  if (!id_barbero || !isoDate) return { isWorking: false, schedule: null };

  const dateObj = new Date(isoDate + "T12:00:00");
  const daysMap = ["domingo", "lunes", "martes", "miercoles", "jueves", "viernes", "sabado"];
  const targetDay = daysMap[dateObj.getDay()];

  const schedules = getClientSchedules();
  const schedule = schedules.find((s) => {
    if (Number(s.id_barbero) !== Number(id_barbero)) return false;
    if (Number(s.estado) === 0) return false;
    if (s.dia_semana && normalizeDayName(s.dia_semana) === targetDay) return true;
    if (Array.isArray(s.dias_semana) && s.dias_semana.some((d) => normalizeDayName(d) === targetDay)) return true;
    return false;
  });

  return {
    isWorking: Boolean(schedule),
    schedule: schedule || null
  };
}

/**
 * Obtiene los días y horario laboral configurados por el administrador para un barbero.
 * Genera un resumen legible como "Lun, Mar, Mié • 08:00 - 18:00" o "Lun a Sáb • 09:00 - 18:00".
 * @param {number|string} id_barbero
 */
export function getBarberWorkingDays(id_barbero) {
  if (!id_barbero) {
    return { days: [], summary: "Sin horario asignado", hours: "", hasSchedules: false };
  }

  const schedules = getClientSchedules().filter(
    (s) => Number(s.id_barbero) === Number(id_barbero) && (Number(s.estado) === 1 || s.estado === undefined || s.estado === "1")
  );

  if (schedules.length === 0) {
    return { days: [], summary: "Sin horario asignado", hours: "", hasSchedules: false };
  }

  const dayOrder = ["lunes", "martes", "miercoles", "jueves", "viernes", "sabado", "domingo"];
  const dayNamesDisplay = {
    lunes: "Lun",
    martes: "Mar",
    miercoles: "Mié",
    jueves: "Jue",
    viernes: "Vie",
    sabado: "Sáb",
    domingo: "Dom"
  };

  const presentDays = new Set();
  let minStart = null;
  let maxEnd = null;

  schedules.forEach((s) => {
    if (s.dia_semana) presentDays.add(normalizeDayName(s.dia_semana));
    if (Array.isArray(s.dias_semana)) s.dias_semana.forEach((d) => presentDays.add(normalizeDayName(d)));

    if (s.hora_inicio) {
      const h = String(s.hora_inicio).substring(0, 5);
      if (!minStart || h < minStart) minStart = h;
    }
    if (s.hora_fin) {
      const h = String(s.hora_fin).substring(0, 5);
      if (!maxEnd || h > maxEnd) maxEnd = h;
    }
  });

  const sortedDays = dayOrder.filter((d) => presentDays.has(d));
  if (sortedDays.length === 0) {
    return { days: [], summary: "Sin horario asignado", hours: "", hasSchedules: false };
  }

  let daysSummary = "";
  if (sortedDays.length === 6 && !presentDays.has("domingo")) {
    daysSummary = "Lun a Sáb";
  } else if (sortedDays.length === 5 && !presentDays.has("sabado") && !presentDays.has("domingo")) {
    daysSummary = "Lun a Vie";
  } else if (sortedDays.length === 7) {
    daysSummary = "Todos los días";
  } else {
    daysSummary = sortedDays.map((d) => dayNamesDisplay[d] || d).join(", ");
  }

  const hoursSummary = minStart && maxEnd ? `${minStart} - ${maxEnd}` : "";
  const fullSummary = hoursSummary ? `${daysSummary} • ${hoursSummary}` : daysSummary;

  return {
    days: sortedDays,
    summary: fullSummary,
    hours: hoursSummary,
    hasSchedules: true
  };
}

/**
 * Agenda una nueva cita para el cliente actual.
 */
export function bookAppointment({ id_barbero, id_servicio = null, id_paquete = null, nombre_item, fecha, hora, precio, notas = "" }) {
  const client = getCurrentClientProfile();
  if (!client) return { success: false, error: "Debes iniciar sesión para agendar una cita." };

  const allAppointments = getOrInit(STORAGE_KEYS.APPOINTMENTS, INITIAL_APPOINTMENTS);

  // Validar si el slot sigue disponible
  const isSlotTaken = allAppointments.some(
    (a) =>
      Number(a.id_barbero) === Number(id_barbero) &&
      a.fecha === fecha &&
      a.hora.substring(0, 5) === hora.substring(0, 5) &&
      a.estado !== "Cancelada"
  );

  if (isSlotTaken) {
    return { success: false, error: "El horario seleccionado ya no se encuentra disponible. Por favor elige otro." };
  }

  const nextId = Math.max(...allAppointments.map((a) => a.id_cita || 0), 100) + 1;
  const clientFullName = `${client.nombre || ""} ${client.apellido || ""}`.trim() || "Cliente Registrado";

  const newAppointment = {
    id_cita: nextId,
    id_cliente: client.id_cliente,
    id_usuario: client.id_usuario,
    cliente_nombre: clientFullName,
    cliente_telefono: client.telefono || "",
    cliente_correo: client.correo || "",
    cliente_direccion: client.direccion || "",
    cliente_fidelidad: client.nivel_fidelidad || "Nuevo",
    id_barbero: Number(id_barbero),
    id_servicio: id_servicio ? Number(id_servicio) : null,
    id_paquete: id_paquete ? Number(id_paquete) : null,
    nombre_item: nombre_item || "Servicio de Barbería",
    fecha,
    hora: hora.length === 5 ? `${hora}:00` : hora,
    estado: "Programada",
    precio: Number(precio) || 0,
    fecha_registro: new Date().toISOString().replace("T", " ").substring(0, 19),
    notas: notas.trim()
  };

  const updatedAppointments = [newAppointment, ...allAppointments];
  save(STORAGE_KEYS.APPOINTMENTS, updatedAppointments);

  // Despachar notificaciones en tiempo real para todos los roles involucrados
  try {
    // 1. A Administración y Recepción
    createNotification({
      type: "appointment",
      title: "Nueva cita agendada",
      description: `El cliente ${clientFullName} agendó cita para el ${fecha} a las ${hora.substring(0, 5)} con ${newAppointment.nombre_item}.`,
      targetRole: [1, 2],
      route: "/admin/citas"
    });
    // 2. Al Barbero
    createNotification({
      type: "appointment",
      title: "Nueva cita asignada",
      description: `Tienes una nueva cita agendada con ${clientFullName} para el ${fecha} a las ${hora.substring(0, 5)}.`,
      targetRole: 3,
      route: "/barbero/agenda"
    });
    // 3. Al Cliente
    if (client.id_usuario) {
      createNotification({
        type: "appointment",
        title: "¡Cita agendada con éxito!",
        description: `Tu turno para ${newAppointment.nombre_item} ha sido programado para el ${fecha} a las ${hora.substring(0, 5)}.`,
        targetUserId: client.id_usuario,
        route: "/portal/mis-citas"
      });
    }
  } catch (err) {
    console.warn("[ClientStorage] Error al despachar notificación de cita:", err);
  }

  apiCreateAppointment({
    id_cliente: client.id_cliente,
    id_barbero: Number(id_barbero),
    id_servicio: id_servicio ? Number(id_servicio) : null,
    id_paquete: id_paquete ? Number(id_paquete) : null,
    fecha,
    hora: hora.length === 5 ? `${hora}:00` : hora,
    notas: notas.trim(),
    cliente_nombre: clientFullName,
    cliente_telefono: client.telefono || "",
    cliente_correo: client.correo || ""
  }).catch((err) => {
    console.warn("[ClientStorage] Cita sincronizada localmente (API fallback):", err.message);
  });

  notifyDataChange(SYNC_ENTITIES.APPOINTMENTS);
  return { success: true, appointment: newAppointment };
}

/**
 * Reagenda una cita existente comprobando disponibilidad.
 */
export function rescheduleAppointment(id_cita, { nuevaFecha, nuevaHora }) {
  const allAppointments = getOrInit(STORAGE_KEYS.APPOINTMENTS, INITIAL_APPOINTMENTS);
  const aptIndex = allAppointments.findIndex((a) => a.id_cita === Number(id_cita));

  if (aptIndex === -1) {
    return { success: false, error: "Cita no encontrada." };
  }

  const apt = allAppointments[aptIndex];

  // Validar disponibilidad en el nuevo horario
  const isTaken = allAppointments.some(
    (a) =>
      a.id_cita !== apt.id_cita &&
      a.id_barbero === apt.id_barbero &&
      a.fecha === nuevaFecha &&
      a.hora.substring(0, 5) === nuevaHora.substring(0, 5) &&
      a.estado !== "Cancelada"
  );

  if (isTaken) {
    return { success: false, error: "El nuevo horario ya no está disponible para este barbero." };
  }

  allAppointments[aptIndex] = {
    ...apt,
    fecha: nuevaFecha,
    hora: nuevaHora.length === 5 ? `${nuevaHora}:00` : nuevaHora,
    estado: "Reprogramada"
  };

  save(STORAGE_KEYS.APPOINTMENTS, allAppointments);

  try {
    createNotification({
      type: "appointment",
      title: "Cita reprogramada",
      description: `La cita de ${apt.cliente_nombre || "Cliente"} fue reprogramada para el ${nuevaFecha} a las ${nuevaHora.substring(0, 5)}.`,
      targetRole: [1, 2],
      route: "/admin/citas"
    });
    createNotification({
      type: "appointment",
      title: "Cita reprogramada",
      description: `Tu cita con ${apt.cliente_nombre || "Cliente"} fue reprogramada para el ${nuevaFecha} a las ${nuevaHora.substring(0, 5)}.`,
      targetRole: 3,
      route: "/barbero/agenda"
    });
    if (apt.id_usuario) {
      createNotification({
        type: "appointment",
        title: "Cita reprogramada con éxito",
        description: `Tu turno ha sido reprogramado para el ${nuevaFecha} a las ${nuevaHora.substring(0, 5)}.`,
        targetUserId: apt.id_usuario,
        route: "/portal/mis-citas"
      });
    }
  } catch (err) {
    console.warn("[ClientStorage] Error al despachar notificación de reprogramación:", err);
  }

  notifyDataChange(SYNC_ENTITIES.APPOINTMENTS);
  return { success: true, appointment: allAppointments[aptIndex] };
}

/**
 * Cancela una cita cambiando su estado a "Cancelada".
 */
export function cancelAppointment(id_cita, motivo = "Cancelada por el cliente") {
  const allAppointments = getOrInit(STORAGE_KEYS.APPOINTMENTS, INITIAL_APPOINTMENTS);
  const aptIndex = allAppointments.findIndex((a) => a.id_cita === Number(id_cita));

  if (aptIndex === -1) {
    return { success: false, error: "Cita no encontrada." };
  }

  allAppointments[aptIndex] = {
    ...allAppointments[aptIndex],
    estado: "Cancelada",
    motivo_cancelacion: motivo
  };

  save(STORAGE_KEYS.APPOINTMENTS, allAppointments);

  try {
    const apt = allAppointments[aptIndex];
    createNotification({
      type: "appointment",
      title: "Cita cancelada",
      description: `La cita de ${apt.cliente_nombre || "Cliente"} para el ${apt.fecha} ha sido cancelada.`,
      targetRole: [1, 2],
      route: "/admin/citas"
    });
    createNotification({
      type: "appointment",
      title: "Cita cancelada",
      description: `Tu cita con ${apt.cliente_nombre || "Cliente"} para el ${apt.fecha} fue cancelada.`,
      targetRole: 3,
      route: "/barbero/agenda"
    });
    if (apt.id_usuario) {
      createNotification({
        type: "appointment",
        title: "Cita cancelada",
        description: `Has cancelado tu cita del ${apt.fecha}. Puedes agendar un nuevo turno cuando desees.`,
        targetUserId: apt.id_usuario,
        route: "/portal/mis-citas"
      });
    }
  } catch (err) {
    console.warn("[ClientStorage] Error despachando cancelación:", err);
  }

  apiUpdateAppointmentStatus(id_cita, "Cancelada").catch((err) => {
    console.warn("[ClientStorage] Cita cancelada localmente (API fallback):", err.message);
  });

  notifyDataChange(SYNC_ENTITIES.APPOINTMENTS);
  return { success: true, appointment: allAppointments[aptIndex] };
}

// ==========================================
// COMPRAS DEL CLIENTE ACTUAL
// ==========================================

export function getClientPurchases() {
  const client = getCurrentClientProfile();
  if (!client) return [];

  const allSales = getOrInit(STORAGE_KEYS.SALES, INITIAL_SALES);
  return allSales
    .filter(
      (s) =>
        Number(s.id_cliente) === Number(client.id_cliente) ||
        (client.id_usuario && Number(s.id_usuario) === Number(client.id_usuario)) ||
        (s.cliente_correo && client.correo && s.cliente_correo.toLowerCase() === client.correo.toLowerCase())
    )
    .sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
}

/**
 * Crea una compra de productos para el cliente actual,
 * descontando el stock correspondiente y registrando la orden en la base de datos de ventas.
 */
export function createClientPurchase({
  items,
  metodoPago = "Efectivo / Datáfono en Salón",
  metodoEntrega = "Retiro en Salón Físico",
  direccionEnvio = "Salón Físico / Negocio Presencial",
  notas = ""
}) {
  const client = getCurrentClientProfile();
  if (!client) {
    return { success: false, error: "No hay una sesión de cliente activa." };
  }

  if (!items || items.length === 0) {
    return { success: false, error: "El carrito de compras está vacío." };
  }

  const allProducts = getOrInit(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
  const allSales = getOrInit(STORAGE_KEYS.SALES, INITIAL_SALES);

  // Verificar stock disponible para cada producto
  for (const item of items) {
    const prod = allProducts.find((p) => p.id_producto === item.id_producto);
    if (!prod) {
      return { success: false, error: `El producto "${item.nombre}" no está disponible.` };
    }
    if (Number(prod.stock || 0) < Number(item.cantidad || 1)) {
      return {
        success: false,
        error: `Solo quedan ${prod.stock} unidades disponibles de "${item.nombre}".`
      };
    }
  }

  // Descontar inventario
  const updatedProducts = allProducts.map((p) => {
    const purchasedItem = items.find((it) => it.id_producto === p.id_producto);
    if (purchasedItem) {
      return {
        ...p,
        stock: Math.max(0, Number(p.stock || 0) - Number(purchasedItem.cantidad || 1))
      };
    }
    return p;
  });
  save(STORAGE_KEYS.PRODUCTS, updatedProducts);

  // Generar ID único de venta
  const maxSaleId = allSales.reduce((max, s) => Math.max(max, Number(s.id_venta || 0)), 0);
  const newSaleId = maxSaleId + 1;

  const now = new Date();
  const dateStr = getLocalDateString(now);
  const timeStr = now.toTimeString().split(" ")[0];
  const fullDateTime = `${dateStr} ${timeStr}`;

  const totalCalculado = items.reduce(
    (sum, item) => sum + Number(item.precio || 0) * Number(item.cantidad || 1),
    0
  );

  const detalles = items.map((item, idx) => ({
    id_venta_detalle: Date.now() + idx,
    id_venta: newSaleId,
    tipo_item: "Producto",
    id_producto: item.id_producto,
    cantidad: item.cantidad,
    precio_unitario: item.precio,
    subtotal: Number(item.precio) * Number(item.cantidad),
    nombre: item.nombre
  }));

  const clientFullName = `${client.nombre || ""} ${client.apellido || ""}`.trim() || "Cliente Registrado";

  const newSale = {
    id_venta: newSaleId,
    id_cliente: client.id_cliente,
    id_usuario: client.id_usuario || 1,
    cliente_nombre: clientFullName,
    cliente_telefono: client.telefono || "",
    cliente_correo: client.correo || "",
    cliente_fidelidad: client.nivel_fidelidad || "Nuevo",
    id_cita: null,
    fecha: fullDateTime,
    total: totalCalculado,
    estado: "Activa",
    metodo_pago: metodoPago,
    metodo_entrega: metodoEntrega || "Retiro en Salón Físico",
    direccion_envio: direccionEnvio || "Salón Físico / Negocio Presencial",
    notas: notas,
    detalles: detalles
  };

  allSales.unshift(newSale);
  save(STORAGE_KEYS.SALES, allSales);

  apiCreateSale({
    id_cliente: client.id_cliente,
    id_barbero: 1,
    metodo_pago: metodoPago,
    total: totalCalculado,
    cliente_nombre: clientFullName,
    detalles: items.map((it) => ({
      tipo_item: "Producto",
      id_producto: it.id_producto || null,
      id_servicio: it.id_servicio || null,
      id_paquete: it.id_paquete || null,
      cantidad: Number(it.cantidad || 1),
      precio_unitario: Number(it.precio || 0)
    }))
  }).catch((err) => {
    console.warn("[ClientStorage] Venta sincronizada localmente (API fallback):", err.message);
  });

  notifyDataChange(SYNC_ENTITIES.SALES);
  notifyDataChange(SYNC_ENTITIES.PRODUCTS);
  return { success: true, sale: newSale };
}

// ==========================================
// LOOKBOOK DE ESTILOS & TENDENCIAS
// ==========================================

const INITIAL_LOOKBOOK = [
  {
    id: "look-1",
    titulo: "Mid Skin Fade Texturizado",
    categoria: "Corte",
    servicioId: 1, // Corte Clásico o Fade
    descripcion: "Degradado medio a piel limpia con textura marcada en la parte superior. Ideal para cabello liso o ligeramente ondulado.",
    tipoCabello: "Todo tipo",
    tiempoEstimado: "45 min",
    imagen: "https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=600&auto=format&fit=crop&q=80",
    etiquetas: ["Moderno", "Urbano", "Degradado"]
  },
  {
    id: "look-2",
    titulo: "Barba Esculpida & Toalla Caliente",
    categoria: "Barba",
    servicioId: 2, // Arreglo de Barba
    descripcion: "Perfilado milimétrico a navaja libre con tratamiento de aceites esenciales hidratantes y toalla caliente aromática.",
    tipoCabello: "Barba media/larga",
    tiempoEstimado: "30 min",
    imagen: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=600&auto=format&fit=crop&q=80",
    etiquetas: ["Elegante", "Navaja", "Spa"]
  },
  {
    id: "look-3",
    titulo: "Executive Side Part & Fade",
    categoria: "Corte",
    servicioId: 1,
    descripcion: "Raya lateral clásica con acabado pomada brillante, ideal para reuniones formales y estilo corporativo refinado.",
    tipoCabello: "Lacio / Ondulado",
    tiempoEstimado: "40 min",
    imagen: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=600&auto=format&fit=crop&q=80",
    etiquetas: ["Ejecutivo", "Clásico", "Formal"]
  },
  {
    id: "look-4",
    titulo: "Combo VIP: Fade + Barba + Mascarilla",
    categoria: "Combos",
    servicioId: 1,
    paqueteId: 1,
    descripcion: "Experiencia total de barbería con corte degradado, diseño de barba y mascarilla purificante de carbón activado.",
    tipoCabello: "Todos",
    tiempoEstimado: "70 min",
    imagen: "https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=600&auto=format&fit=crop&q=80",
    etiquetas: ["VIP", "Completo", "Relajante"]
  }
];

export function getClientLookbook() {
  const looks = getOrInit("tu_turno_client_lookbook", INITIAL_LOOKBOOK);
  let changed = false;
  const healed = looks.map((l) => {
    if (!l.imagen || l.imagen.includes("photo-1517832606589-7629c3395909")) {
      changed = true;
      return {
        ...l,
        imagen: "https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=600&auto=format&fit=crop&q=80"
      };
    }
    return l;
  });
  if (changed) {
    save("tu_turno_client_lookbook", healed);
  }
  return healed;
}

// ==========================================
// BITÁCORA DE ESTILO PERSONAL ("Mi Último Look")
// ==========================================

const INITIAL_STYLE_LOG = {
  fecha: "2026-08-20",
  barbero: "Carlos Rodríguez",
  corte: "Mid Fade con caída natural",
  guiaLateral: "Máquina #1.5 degradada a #0.5",
  superior: "Tijera 3cm con textura en puntas",
  barba: "Perfilado cuadrado bajo con toalla caliente",
  productoUsado: "Cera efecto mate fijación fuerte"
};

export function getClientStyleLog() {
  return getOrInit("tu_turno_client_style_log", INITIAL_STYLE_LOG);
}

export function saveClientStyleLog(data) {
  save("tu_turno_client_style_log", data);
  return data;
}

// ==========================================
// RESEÑAS & CALIFICACIÓN POST-CITA
// ==========================================

export function getClientReviews() {
  return getOrInit("tu_turno_client_reviews", [
    {
      id: "rev-1",
      id_cita: 98,
      barberoNombre: "Carlos Rodríguez",
      calificacion: 5,
      comentario: "Excelente corte, muy puntual y la atención con café estuvo impecable.",
      fecha: "2026-08-20"
    }
  ]);
}

export function saveClientReview(reviewData) {
  const client = getCurrentClientProfile();
  const reviews = getClientReviews();
  const clientFullName = client ? `${client.nombre || ""} ${client.apellido || ""}`.trim() : "Cliente";

  const newReview = {
    id: `rev-${Date.now()}`,
    fecha: getLocalDateString(),
    id_cliente: client?.id_cliente || null,
    id_usuario: client?.id_usuario || null,
    cliente_nombre: clientFullName,
    cliente_correo: client?.correo || "",
    ...reviewData
  };
  reviews.unshift(newReview);
  save("tu_turno_client_reviews", reviews);
  return { success: true, review: newReview };
}

// ==========================================
// DETALLES DE FIDELIZACIÓN (Club VIP - Sistema de Cortes y Sellos)
// ==========================================

export function getClientLoyaltyDetails() {
  const profile = getCurrentClientProfile();
  const appointments = getClientAppointments();
  const completed = appointments.filter((a) => a.estado === "Completada").length;

  const targetCortes = 5; // Tarjeta de sellos: cada 5 cortes se gana una recompensa
  const sellosCiclo = completed > 0 && completed % 5 === 0 ? 5 : completed % 5;
  const cortesFaltantes = 5 - sellosCiclo;
  const progressPercent = Math.min(100, Math.round((sellosCiclo / targetCortes) * 100));
  const cicloActual = Math.floor((completed - (sellosCiclo === 5 ? 1 : 0)) / 5) + 1;

  let nextBenefitText = "";
  if (completed === 0) {
    nextBenefitText = "Completa tu primer servicio para empezar a sellar tu tarjeta virtual.";
  } else if (cortesFaltantes === 0 || sellosCiclo === 5) {
    nextBenefitText = "¡Felicidades! Completaste los 5 cortes. Reclama tu 5° Corte Gratis.";
  } else if (cortesFaltantes === 1) {
    nextBenefitText = "¡Solo te falta 1 corte para tu 5° Corte Gratis!";
  } else {
    nextBenefitText = `Te faltan ${cortesFaltantes} cortes para tu 5° Corte Gratis.`;
  }

  // Nivel de fidelidad: todo cliente recién registrado inicia en 'Nuevo' (con 0 puntos)
  const currentPoints = Number(profile?.puntos_fidelidad ?? (completed * 50));
  let currentTier = profile?.nivel_fidelidad || "Nuevo";
  if (!profile?.nivel_fidelidad || profile.nivel_fidelidad === "Nuevo") {
    if (currentPoints >= 750 || completed >= 15) currentTier = "Oro";
    else if (currentPoints >= 350 || completed >= 8) currentTier = "Plata";
    else if (currentPoints >= 150 || completed >= 3) currentTier = "Bronce";
    else currentTier = "Nuevo";
  }

  const perksByTier = {
    Nuevo: [
      "Registro inicial en el Club de Fidelidad Tu Turno (0 pts)",
      "Suma sellos y +50 puntos automáticos por cada corte completado",
      "Tu 5° corte del ciclo con beneficio especial"
    ],
    Bronce: [
      "Bebida de cortesía en sala de espera",
      "5% de descuento en ceras y fijadores",
      "Acceso anticipado a combos de temporada"
    ],
    Plata: [
      "Prioridad en lista de espera y citas VIP",
      "Bebida de cortesía en sala VIP",
      "10% de descuento en ceras y pomadas"
    ],
    Oro: [
      "Atención VIP preferencial y reservas express",
      "Bebida premium ilimitada en sala VIP",
      "15% de descuento en productos y servicios",
      "Corte de cumpleaños gratuito"
    ]
  };

  return {
    tier: currentTier,
    puntos: currentPoints,
    serviciosRealizados: completed,
    targetCortes,
    sellosCiclo,
    cortesFaltantes,
    cicloActual,
    progressPercent,
    visitsCount: completed,
    nextBenefit: nextBenefitText,
    unlockedPerks: perksByTier[currentTier] || perksByTier.Nuevo,
    badges: [
      { id: "b1", name: "Primer Corte", icon: "Scissors", unlocked: completed >= 1 },
      { id: "b2", name: "Estilo Frecuente (3 cortes)", icon: "Scissors", unlocked: completed >= 3 },
      { id: "b3", name: "Miembro VIP (5 cortes)", icon: "Crown", unlocked: completed >= 5 }
    ]
  };
}

// ==========================================
// RECOMPENSAS Y GAMIFICACIÓN ("Barber Rewards por Servicios")
// ==========================================

const INITIAL_REWARDS = [
  {
    id: "rew-1",
    titulo: "Bebida Especial de Cortesía VIP",
    descripcion: "Disfruta de café espresso recién molido o cerveza artesanal fría durante tu servicio.",
    serviciosRequeridos: 3,
    icono: "Coffee",
    canjeado: false,
    categoria: "Experiencia"
  },
  {
    id: "rew-2",
    titulo: "¡5° Corte Clásico o Barba GRATIS!",
    descripcion: "Corte de cabello clásico o arreglo completo de barba 100% gratis por completar 5 visitas.",
    serviciosRequeridos: 5,
    icono: "Crown",
    canjeado: false,
    categoria: "Corte Gratis"
  },
  {
    id: "rew-3",
    titulo: "Toalla Facial Spa + 20% OFF en Productos",
    descripcion: "Ritual aromático al vapor con aceites esenciales y descuento en ceras o pomadas.",
    serviciosRequeridos: 8,
    icono: "Sparkles",
    canjeado: false,
    categoria: "Bienestar y Estilo"
  },
  {
    id: "rew-4",
    titulo: "Combo Supremo VIP de Lujo Gratis",
    descripcion: "Corte prémium + Perfilado de barba + Limpieza facial purificante 100% patrocinado.",
    serviciosRequeridos: 10,
    icono: "Gift",
    canjeado: false,
    categoria: "Premio Supremo"
  }
];

export function getClientRewards() {
  const existing = getOrInit("tu_turno_client_rewards", INITIAL_REWARDS);
  // Auto-migración si existen recompensas antiguas basadas en puntos
  if (Array.isArray(existing) && existing.some((r) => !r.serviciosRequeridos && r.puntosRequeridos)) {
    const migrated = INITIAL_REWARDS.map((initial) => {
      const match = existing.find((e) => e.id === initial.id);
      return match ? { ...initial, canjeado: !!match.canjeado, fechaCanje: match.fechaCanje } : initial;
    });
    save("tu_turno_client_rewards", migrated);
    return migrated;
  }
  return existing;
}

export function claimClientReward(rewardId) {
  const rewards = getClientRewards();
  const loyalty = getClientLoyaltyDetails();
  const reward = rewards.find((r) => r.id === rewardId);

  if (!reward) {
    return { success: false, error: "Recompensa no encontrada." };
  }

  if (reward.canjeado) {
    return { success: false, error: "Esta recompensa ya fue canjeada." };
  }

  if (loyalty.serviciosRealizados < reward.serviciosRequeridos) {
    const faltan = reward.serviciosRequeridos - loyalty.serviciosRealizados;
    return {
      success: false,
      error: `Te faltan ${faltan} ${faltan === 1 ? "corte o servicio" : "cortes o servicios"} para desbloquear este beneficio.`
    };
  }

  const updated = rewards.map((r) =>
    r.id === rewardId ? { ...r, canjeado: true, fechaCanje: getLocalDateString() } : r
  );
  save("tu_turno_client_rewards", updated);
  return { success: true, reward: { ...reward, canjeado: true } };
}



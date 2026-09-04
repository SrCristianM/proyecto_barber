/**
 * @file clientStorageService.js
 * Servicio centralizado de datos y sincronización para el Portal del Cliente.
 * Conectado con la arquitectura existente y persistencia en localStorage para compartir
 * información real (citas, barberos, horarios, servicios, paquetes, productos y ventas)
 * entre el Cliente y el Administrador.
 */

import { getCurrentUser, getStoredUsers, saveStoredUsers } from "../../auth/services/authService.js";

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
  { id_servicio: 1, nombre: "Corte Clásico", id_categoria_servicio: 1, categoria: "Cortes", precio: 15000, duracion_minutos: 30, descripcion: "Corte tradicional a tijera o máquina con acabado y perfilado profesional.", imagen_url: "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=600&auto=format&fit=crop&q=80", estado: 1 },
  { id_servicio: 2, nombre: "Corte + Barba", id_categoria_servicio: 3, categoria: "Paquetes", precio: 25000, duracion_minutos: 45, descripcion: "Corte completo personalizado más arreglo y perfilado de barba con toalla caliente.", imagen_url: "https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=600&auto=format&fit=crop&q=80", estado: 1 },
  { id_servicio: 3, nombre: "Afeitado Premium", id_categoria_servicio: 2, categoria: "Barba", precio: 20000, duracion_minutos: 35, descripcion: "Afeitado clásico a navaja tradicional con vapor ozono, toalla caliente y bálsamo hidratante.", imagen_url: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=600&auto=format&fit=crop&q=80", estado: 1 },
  { id_servicio: 4, nombre: "Diseño y Color", id_categoria_servicio: 4, categoria: "Especiales", precio: 30000, duracion_minutos: 60, descripcion: "Líneas, figuras freestyle, decoloración o matización de color con productos de alta gama.", imagen_url: "https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=600&auto=format&fit=crop&q=80", estado: 1 },
  { id_servicio: 5, nombre: "Corte Niño", id_categoria_servicio: 1, categoria: "Cortes", precio: 12000, duracion_minutos: 20, descripcion: "Corte de cabello para niños hasta 12 años, con paciencia y estilo.", imagen_url: "", estado: 1 }
];

const INITIAL_PACKAGES = [
  {
    id_paquete: 1,
    nombre: "Paquete Básico",
    descripcion: "Combinación ideal para mantener tu estilo fresco y cuidado esencial.",
    descuento_porcentaje: 10,
    estado: 1,
    servicios_ids: [1, 3] // Corte Clásico (15.000) + Afeitado Premium (20.000) = 35.000 -> 31.500
  },
  {
    id_paquete: 2,
    nombre: "Paquete Premium",
    descripcion: "El tratamiento definitivo de barbería: corte y barba más diseño personalizado.",
    descuento_porcentaje: 20,
    estado: 1,
    servicios_ids: [2, 4] // Corte+Barba (25.000) + Diseño y Color (30.000) = 55.000 -> 44.000
  },
  {
    id_paquete: 3,
    nombre: "Paquete Especial Caballero",
    descripcion: "Corte de temporada acompañado de perfilado completo de barba.",
    descuento_porcentaje: 15,
    estado: 1,
    servicios_ids: [1, 2] // Corte Clásico (15.000) + Corte+Barba (25.000) = 40.000 -> 34.000
  }
];

const INITIAL_PRODUCTS = [
  { id_producto: 1, nombre: "Gel para Cabello Extra Fijación", id_categoria_producto: 1, categoria: "Estilizado", stock: 25, precio: 15000, descripcion: "Fijación duradera 24h sin dejar residuos ni descamación con brillo natural.", imagen_url: "https://images.unsplash.com/photo-1598452963314-b09f397a5c48?w=500&auto=format&fit=crop&q=80", estado: 1 },
  { id_producto: 2, nombre: "Cera Modeladora Mate", id_categoria_producto: 1, categoria: "Estilizado", stock: 8, precio: 18000, descripcion: "Acabado mate natural y textura maleable, ideal para peinados modernos.", imagen_url: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=500&auto=format&fit=crop&q=80", estado: 1 },
  { id_producto: 3, nombre: "Shampoo Anticaída con Biotina", id_categoria_producto: 2, categoria: "Cuidado", stock: 15, precio: 22000, descripcion: "Fortalece la raíz y revitaliza el cuero cabelludo dejando frescura de mentol.", imagen_url: "https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?w=500&auto=format&fit=crop&q=80", estado: 1 },
  { id_producto: 4, nombre: "Aceite Nutritivo para Barba", id_categoria_producto: 3, categoria: "Barba", stock: 12, precio: 25000, descripcion: "Fórmula enriquecida con aceite de argán y jojoba para hidratar y suavizar la barba.", imagen_url: "https://images.unsplash.com/photo-1608248597359-00f72365851d?w=500&auto=format&fit=crop&q=80", estado: 1 },
  { id_producto: 5, nombre: "Navaja de Afeitar Clásica", id_categoria_producto: 4, categoria: "Herramientas", stock: 5, precio: 45000, descripcion: "Navaja de acero inoxidable con mango ergonómico para afeitados de precisión.", imagen_url: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=500&auto=format&fit=crop&q=80", estado: 1 },
  { id_producto: 6, nombre: "Tijeras Profesionales de Corte", id_categoria_producto: 4, categoria: "Herramientas", stock: 10, precio: 65000, descripcion: "Acero japonés con filo dulce para cortes limpios y ergonómicos.", imagen_url: "", estado: 1 },
  { id_producto: 7, nombre: "Peine Antiestático de Carbono", id_categoria_producto: 4, categoria: "Herramientas", stock: 30, precio: 8000, descripcion: "Resistente al calor y a productos químicos, desenredo suave.", imagen_url: "", estado: 1 },
  { id_producto: 8, nombre: "Bálsamo Calmante Aftershave", id_categoria_producto: 3, categoria: "Barba", stock: 18, precio: 20000, descripcion: "Alivia la irritación post-afeitado con aloe vera y manzanilla.", imagen_url: "", estado: 1 }
];

const INITIAL_BARBERS = [
  { id_barbero: 1, id_usuario: 4, nombre: "Carlos", apellido: "Rodríguez", correo: "carlos@example.com", telefono: "+57 300 123 4567", especialidad: "Corte Clásico", imagen_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80", estado: 1 },
  { id_barbero: 2, id_usuario: 5, nombre: "Miguel", apellido: "Ángel", correo: "miguel@example.com", telefono: "+57 301 234 5678", especialidad: "Diseño y Color", imagen_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80", estado: 1 },
  { id_barbero: 3, id_usuario: 6, nombre: "Javier", apellido: "Torres", correo: "javier@example.com", telefono: "+57 302 345 6789", especialidad: "Barba Premium", imagen_url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80", estado: 1 }
];

const INITIAL_SCHEDULES = [
  { id_horario: 1, id_barbero: 1, dias_semana: ["Lunes", "Martes", "Miercoles", "Jueves", "Viernes", "Sabado"], hora_inicio: "08:00:00", hora_fin: "18:00:00", estado: 1 },
  { id_horario: 2, id_barbero: 2, dias_semana: ["Lunes", "Martes", "Miercoles", "Viernes", "Sabado"], hora_inicio: "09:00:00", hora_fin: "19:00:00", estado: 1 },
  { id_horario: 3, id_barbero: 3, dias_semana: ["Martes", "Miercoles", "Jueves", "Viernes", "Sabado"], hora_inicio: "10:00:00", hora_fin: "19:00:00", estado: 1 }
];

const INITIAL_CLIENTS = [
  { id_cliente: 1, id_usuario: 7, nombre: "Pedro", apellido: "López", correo: "cliente@example.com", telefono: "3001234567", direccion: "Calle 10 # 5-20", nivel_fidelidad: "Oro", estado: 1 },
  { id_cliente: 2, id_usuario: 8, nombre: "Ana", apellido: "Martínez", correo: "ana.m@example.com", telefono: "3012345678", direccion: "Carrera 15 # 45-12", nivel_fidelidad: "Plata", estado: 1 },
  { id_cliente: 3, id_usuario: 9, nombre: "Roberto", apellido: "Sánchez", correo: "roberto@example.com", telefono: "3023456789", direccion: "Av. Siempre Viva 123", nivel_fidelidad: "Bronce", estado: 1 }
];

const TODAY = new Date().toISOString().split("T")[0];

const INITIAL_APPOINTMENTS = [
  {
    id_cita: 101,
    id_cliente: 1,
    id_barbero: 1,
    id_servicio: 1,
    id_paquete: null,
    nombre_item: "Corte Clásico",
    fecha: TODAY,
    hora: "10:00",
    estado: "Programada",
    precio: 15000,
    fecha_registro: "2026-06-01 08:00:00",
    notas: "Cliente prefiere corte bajo a los lados."
  },
  {
    id_cita: 102,
    id_cliente: 1,
    id_barbero: 2,
    id_servicio: 2,
    id_paquete: null,
    nombre_item: "Corte + Barba",
    fecha: "2026-05-20",
    hora: "15:00",
    estado: "Completada",
    precio: 25000,
    fecha_registro: "2026-05-18 10:30:00",
    notas: ""
  },
  {
    id_cita: 103,
    id_cliente: 1,
    id_barbero: 3,
    id_servicio: 3,
    id_paquete: null,
    nombre_item: "Afeitado Premium",
    fecha: "2026-04-10",
    hora: "11:00",
    estado: "Completada",
    precio: 20000,
    fecha_registro: "2026-04-08 14:15:00",
    notas: ""
  }
];

const INITIAL_SALES = [
  {
    id_venta: 1,
    id_cliente: 1,
    id_usuario: 1,
    id_cita: 102,
    fecha: "2026-05-20 15:45:00",
    total: 43000,
    estado: "Activa",
    detalles: [
      { id_venta_detalle: 1, id_venta: 1, tipo_item: "Servicio", id_servicio: 2, cantidad: 1, precio_unitario: 25000, subtotal: 25000, nombre: "Corte + Barba" },
      { id_venta_detalle: 2, id_venta: 1, tipo_item: "Producto", id_producto: 2, cantidad: 1, precio_unitario: 18000, subtotal: 18000, nombre: "Cera Modeladora Mate" }
    ]
  },
  {
    id_venta: 2,
    id_cliente: 1,
    id_usuario: 1,
    id_cita: 103,
    fecha: "2026-04-10 11:35:00",
    total: 35000,
    estado: "Activa",
    detalles: [
      { id_venta_detalle: 3, id_venta: 2, tipo_item: "Servicio", id_servicio: 3, cantidad: 1, precio_unitario: 20000, subtotal: 20000, nombre: "Afeitado Premium" },
      { id_venta_detalle: 4, id_venta: 2, tipo_item: "Producto", id_producto: 1, cantidad: 1, precio_unitario: 15000, subtotal: 15000, nombre: "Gel para Cabello Extra Fijación" }
    ]
  }
];

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

// ==========================================
// CONSULTA DE CATÁLOGOS
// ==========================================

export function getClientServices() {
  return getOrInit(STORAGE_KEYS.SERVICES, INITIAL_SERVICES).filter((s) => s.estado === 1);
}

export function getClientPackages() {
  const packages = getOrInit(STORAGE_KEYS.PACKAGES, INITIAL_PACKAGES).filter((p) => p.estado === 1);
  const services = getClientServices();

  return packages.map((pkg) => {
    const includedServices = (pkg.servicios_ids || []).map((id) =>
      services.find((s) => s.id_servicio === id)
    ).filter(Boolean);

    const originalPrice = includedServices.reduce((sum, s) => sum + Number(s.precio || 0), 0);
    const discount = Number(pkg.descuento_porcentaje || 0);
    const finalPrice = Math.round(originalPrice * (1 - discount / 100));
    const totalDuration = includedServices.reduce((sum, s) => sum + Number(s.duracion_minutos || 0), 0);

    return {
      ...pkg,
      servicios: includedServices,
      precioOriginal: originalPrice,
      precioFinal: finalPrice,
      ahorro: originalPrice - finalPrice,
      duracionTotal: totalDuration
    };
  });
}

export function getClientProducts() {
  return getOrInit(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS).filter((p) => p.estado === 1);
}

export function getClientBarbers() {
  return getOrInit(STORAGE_KEYS.BARBERS, INITIAL_BARBERS).filter((b) => b.estado === 1);
}

export function getClientSchedules() {
  return getOrInit(STORAGE_KEYS.SCHEDULES, INITIAL_SCHEDULES).filter((s) => s.estado === 1);
}

// ==========================================
// PERFIL DEL CLIENTE ACTUAL
// ==========================================

export function getCurrentClientProfile() {
  const user = getCurrentUser();
  if (!user) return null;

  const clients = getOrInit(STORAGE_KEYS.CLIENTS, INITIAL_CLIENTS);
  let client = clients.find((c) => c.id_usuario === user.id_usuario || c.correo === user.correo);

  if (!client) {
    // Si el usuario es rol 4 pero no tiene fila en cliente, se auto-crea
    const nextId = Math.max(...clients.map((c) => c.id_cliente || 0), 0) + 1;
    client = {
      id_cliente: nextId,
      id_usuario: user.id_usuario,
      nombre: user.nombre,
      apellido: user.apellido,
      correo: user.correo,
      telefono: user.telefono || "",
      direccion: "No especificada",
      nivel_fidelidad: "Nuevo",
      estado: 1
    };
    save(STORAGE_KEYS.CLIENTS, [...clients, client]);
  }

  return {
    ...client,
    nombre: user.nombre || client.nombre,
    apellido: user.apellido || client.apellido,
    correo: user.correo || client.correo,
    telefono: user.telefono || client.telefono
  };
}

export function updateClientProfile(updatedData) {
  const user = getCurrentUser();
  if (!user) return { success: false, error: "No hay sesión activa." };

  // 1. Actualizar en lista de usuarios
  const users = getStoredUsers();
  const userIdx = users.findIndex((u) => u.id_usuario === user.id_usuario);
  if (userIdx >= 0) {
    users[userIdx] = {
      ...users[userIdx],
      nombre: updatedData.nombre.trim(),
      apellido: updatedData.apellido.trim(),
      telefono: updatedData.telefono ? updatedData.telefono.trim() : users[userIdx].telefono
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
    .filter((apt) => apt.id_cliente === client.id_cliente)
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

  // Buscar turno del barbero para este día de la semana
  const barberSchedule = schedules.find(
    (s) => s.id_barbero === Number(id_barbero) && (s.dias_semana || []).includes(dayName)
  );

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

  // Filtrar citas ya agendadas de ese barbero en esa fecha (excluyendo canceladas)
  const busyTimes = allAppointments
    .filter(
      (a) =>
        a.id_barbero === Number(id_barbero) &&
        a.fecha === isoDate &&
        a.estado !== "Cancelada"
    )
    .map((a) => a.hora.substring(0, 5));

  return possibleSlots.map((slot) => ({
    hora: slot,
    disponible: !busyTimes.includes(slot)
  }));
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
      a.id_barbero === Number(id_barbero) &&
      a.fecha === fecha &&
      a.hora.substring(0, 5) === hora.substring(0, 5) &&
      a.estado !== "Cancelada"
  );

  if (isSlotTaken) {
    return { success: false, error: "El horario seleccionado ya no se encuentra disponible. Por favor elige otro." };
  }

  const nextId = Math.max(...allAppointments.map((a) => a.id_cita || 0), 100) + 1;
  const newAppointment = {
    id_cita: nextId,
    id_cliente: client.id_cliente,
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
    .filter((s) => s.id_cliente === client.id_cliente)
    .sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
}

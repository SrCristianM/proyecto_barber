/**
 * @file barberStorageService.js
 * Servicio centralizado de datos y persistencia para el Portal del Barbero.
 * Conectado con la arquitectura existente en localStorage (citas, barberos, horarios, servicios, paquetes, novedades)
 * garantizando que el Barbero acceda únicamente a sus propios datos sin permisos administrativos.
 */

import { getCurrentUser } from "../../auth/services/authService.js";

const STORAGE_KEYS = {
  APPOINTMENTS: "barber_appointments_db",
  CLIENTS: "barber_clients_db",
  SERVICES: "barber_services_db",
  PACKAGES: "barber_packages_db",
  BARBERS: "barber_barbers_db",
  SCHEDULES: "barber_schedules_db",
  NOVELTIES: "barber_novelties_db"
};

const TODAY = new Date().toISOString().split("T")[0];

const INITIAL_BARBERS = [
  {
    id_barbero: 1,
    id_usuario: 4,
    nombre: "Carlos",
    apellido: "Rodríguez",
    correo: "barbero@tuturnobarber.com",
    telefono: "+57 302 345 6789",
    especialidad: "Corte Clásico & Fade",
    imagen_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80",
    estado: 1
  }
];

const INITIAL_SERVICES = [];

const INITIAL_PACKAGES = [];

const INITIAL_SCHEDULES = [];

const INITIAL_CLIENTS = [];

const INITIAL_BARBER_APPOINTMENTS = [];

const INITIAL_NOVELTIES = [];

/** Helper para leer/inicializar localStorage */
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

/** Helper para guardar en localStorage */
function save(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (err) {
    console.error(`Error guardando ${key} en localStorage:`, err);
  }
}

// ==========================================
// 1. PERFIL DEL BARBERO AUTENTICADO
// ==========================================

export function getCurrentBarberProfile() {
  const user = getCurrentUser();
  const barbers = getOrInit(STORAGE_KEYS.BARBERS, INITIAL_BARBERS);

  // Identificar por id_barbero, id_usuario o correo
  let barber = barbers.find(
    (b) =>
      b.id_barbero === user?.id_barbero ||
      b.id_usuario === user?.id_usuario ||
      (b.correo && user?.correo && b.correo.toLowerCase() === user.correo.toLowerCase())
  );

  // Si no se encuentra pero el rol es barbero (rol 3), asociar con Carlos Rodríguez (id_barbero: 1)
  if (!barber && user && Number(user.id_rol) === 3) {
    barber = barbers.find((b) => b.id_barbero === 1) || barbers[0];
  }

  if (!barber) {
    barber = INITIAL_BARBERS[0];
  }

  return {
    ...barber,
    nombre: user?.nombre || barber.nombre,
    apellido: user?.apellido || barber.apellido,
    correo: user?.correo || barber.correo,
    telefono: user?.telefono || barber.telefono,
    rol: "Barbero Profesional"
  };
}

// ==========================================
// 2. CITAS DEL BARBERO
// ==========================================

export function getBarberAppointments() {
  const barber = getCurrentBarberProfile();
  let appointments = getOrInit(STORAGE_KEYS.APPOINTMENTS, INITIAL_BARBER_APPOINTMENTS);

  // Asegurar que existan citas del barbero si el array fue inicializado sin ellas
  const hasBarberAppointments = appointments.some((a) => Number(a.id_barbero) === Number(barber.id_barbero));
  if (!hasBarberAppointments) {
    appointments = [...appointments, ...INITIAL_BARBER_APPOINTMENTS];
    save(STORAGE_KEYS.APPOINTMENTS, appointments);
  }

  const clients = getOrInit(STORAGE_KEYS.CLIENTS, INITIAL_CLIENTS);
  const services = getOrInit(STORAGE_KEYS.SERVICES, INITIAL_SERVICES);
  const packages = getOrInit(STORAGE_KEYS.PACKAGES, INITIAL_PACKAGES);

  // Filtrar exclusivamente citas de este barbero
  return appointments
    .filter((a) => Number(a.id_barbero) === Number(barber.id_barbero))
    .map((apt) => {
      // 1. Si la cita ya contiene los datos reales guardados en bookAppointment, priorizarlos
      let clientName = (apt.cliente_nombre || "").trim();
      let clientPhone = apt.cliente_telefono || "";
      let clientEmail = apt.cliente_correo || "";
      let clientFidelity = apt.cliente_fidelidad || "";

      // 2. Buscar en base de datos local de clientes (barber_clients_db)
      const client = clients.find(
        (c) =>
          (apt.id_cliente && Number(c.id_cliente) === Number(apt.id_cliente)) ||
          (apt.id_usuario && Number(c.id_usuario) === Number(apt.id_usuario)) ||
          (apt.cliente_correo && c.correo && c.correo.toLowerCase() === apt.cliente_correo.toLowerCase())
      );

      if (client) {
        if (!clientName || clientName === "Cliente") clientName = `${client.nombre} ${client.apellido || ""}`.trim();
        if (!clientPhone) clientPhone = client.telefono || "";
        if (!clientEmail) clientEmail = client.correo || "";
        if (!clientFidelity) clientFidelity = client.nivel_fidelidad || "Nuevo";
      }

      // 3. Fallback a usuarios registrados (barber_users_db)
      if (!clientName || clientName === "Cliente") {
        try {
          const rawUsers = localStorage.getItem("barber_users_db");
          const users = rawUsers ? JSON.parse(rawUsers) : [];
          const matchedUser = users.find(
            (u) =>
              (apt.id_usuario && Number(u.id_usuario) === Number(apt.id_usuario)) ||
              (apt.cliente_correo && u.correo && u.correo.toLowerCase() === apt.cliente_correo.toLowerCase())
          );
          if (matchedUser) {
            clientName = `${matchedUser.nombre} ${matchedUser.apellido || ""}`.trim();
            if (!clientPhone) clientPhone = matchedUser.telefono || "";
            if (!clientEmail) clientEmail = matchedUser.correo || "";
          }
        } catch {
          // fallback silencioso
        }
      }

      if (!clientName) clientName = "Cliente Registrado";
      if (!clientPhone) clientPhone = "No especificado";
      if (!clientFidelity) clientFidelity = "Nuevo";

      const service = apt.id_servicio
        ? services.find((s) => Number(s.id_servicio) === Number(apt.id_servicio))
        : null;

      const pkg = apt.id_paquete
        ? packages.find((p) => Number(p.id_paquete) === Number(apt.id_paquete))
        : null;

      return {
        ...apt,
        cliente_nombre: clientName,
        cliente_telefono: clientPhone,
        cliente_correo: clientEmail,
        cliente_fidelidad: clientFidelity,
        servicio_nombre: service ? service.nombre : apt.nombre_item || "Servicio General",
        servicio_precio: service ? service.precio : apt.precio,
        servicio_duracion: service ? service.duracion_minutos : 30,
        paquete_nombre: pkg ? pkg.nombre : null,
        es_paquete: Boolean(pkg || apt.id_paquete)
      };
    })
    .sort((a, b) => {
      // Ordenar por fecha y hora descendente
      const dateA = new Date(`${a.fecha}T${a.hora.length === 5 ? a.hora + ":00" : a.hora}`);
      const dateB = new Date(`${b.fecha}T${b.hora.length === 5 ? b.hora + ":00" : b.hora}`);
      return dateB - dateA;
    });
}

/**
 * Marca una cita como Completada/Atendida en la base de datos local
 */
export function completeBarberAppointment(id_cita) {
  const barber = getCurrentBarberProfile();
  const appointments = getOrInit(STORAGE_KEYS.APPOINTMENTS, INITIAL_BARBER_APPOINTMENTS);

  const index = appointments.findIndex(
    (a) => Number(a.id_cita) === Number(id_cita) && Number(a.id_barbero) === Number(barber.id_barbero)
  );

  if (index === -1) {
    return { success: false, error: "Cita no encontrada o no pertenece a tu perfil." };
  }

  appointments[index] = {
    ...appointments[index],
    estado: "Completada"
  };

  save(STORAGE_KEYS.APPOINTMENTS, appointments);
  return { success: true, appointment: appointments[index] };
}

// ==========================================
// 3. AGENDA DEL DÍA Y SLOTS HORARIOS
// ==========================================

export function getBarberAgendaForDate(targetDate = TODAY) {
  const appointments = getBarberAppointments().filter((a) => a.fecha === targetDate);

  // Rango de horas estándar de operación: 08:00 a 18:00
  const standardHours = [
    "08:00",
    "09:00",
    "10:00",
    "11:00",
    "12:00",
    "13:00",
    "14:00",
    "15:00",
    "16:00",
    "17:00",
    "18:00"
  ];

  const slots = standardHours.map((hour) => {
    // Buscar cita cuya hora coincida (ej: "10:00" o "10:30" entra en el bloque)
    const matchingAppt = appointments.find((apt) => {
      const aptHour = apt.hora.substring(0, 2);
      const slotHour = hour.substring(0, 2);
      return aptHour === slotHour;
    });

    if (matchingAppt) {
      return {
        hora: matchingAppt.hora,
        slotBase: hour,
        estadoSlot: "Ocupado",
        cita: matchingAppt
      };
    }

    return {
      hora: hour,
      slotBase: hour,
      estadoSlot: "Libre",
      cita: null
    };
  });

  // Cálculo de ocupación de la jornada diaria
  const activeApts = appointments.filter(
    (a) => a.estado === "Programada" || a.estado === "Reprogramada" || a.estado === "Completada"
  );
  const totalDurationMinutes = activeApts.reduce((acc, a) => acc + (a.servicio_duracion || 30), 0);
  const totalShiftMinutes = 10 * 60; // 08:00 a 18:00 = 600 min (10h)
  const occupancyPercentage = Math.min(100, Math.round((totalDurationMinutes / totalShiftMinutes) * 100));
  const occupiedHours = (totalDurationMinutes / 60).toFixed(1);
  const freeHours = Math.max(0, (totalShiftMinutes - totalDurationMinutes) / 60).toFixed(1);

  return {
    fecha: targetDate,
    slots,
    totalCitas: appointments.length,
    citasProgramadas: appointments.filter((a) => a.estado === "Programada" || a.estado === "Reprogramada").length,
    occupancyPercentage,
    occupiedHours,
    freeHours,
    totalDurationMinutes
  };
}

// ==========================================
// 4. HORARIO SEMANAL DEL BARBERO
// ==========================================

export function getBarberWeeklySchedule() {
  const barber = getCurrentBarberProfile();
  const allSchedules = getOrInit(STORAGE_KEYS.SCHEDULES, INITIAL_SCHEDULES);
  
  const schedule = allSchedules.find((s) => Number(s.id_barbero) === Number(barber.id_barbero)) || INITIAL_SCHEDULES[0];

  const daysOfWeek = [
    { key: "Lunes", label: "Lunes" },
    { key: "Martes", label: "Martes" },
    { key: "Miercoles", label: "Miércoles" },
    { key: "Jueves", label: "Jueves" },
    { key: "Viernes", label: "Viernes" },
    { key: "Sabado", label: "Sábado" },
    { key: "Domingo", label: "Domingo" }
  ];

  const diasConfigurados = schedule.dias_semana || [];

  const weeklySchedule = daysOfWeek.map((day) => {
    const isWorking = diasConfigurados.some(
      (d) => d.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") ===
             day.key.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    );

    if (isWorking) {
      return {
        dia: day.label,
        key: day.key,
        tipo: "Turno Asignado",
        horaInicio: schedule.hora_inicio ? schedule.hora_inicio.substring(0, 5) : "08:00",
        horaFin: schedule.hora_fin ? schedule.hora_fin.substring(0, 5) : "18:00",
        descanso: false
      };
    }

    return {
      dia: day.label,
      key: day.key,
      tipo: "Descanso",
      horaInicio: null,
      horaFin: null,
      descanso: true
    };
  });

  return {
    barberoNombre: `${barber.nombre} ${barber.apellido || ""}`.trim(),
    vigenciaInicio: schedule.fecha_inicio_vigencia || "01/01/2026",
    vigenciaFin: schedule.fecha_fin_vigencia || "31/12/2026",
    dias: weeklySchedule,
    estadoHorario: schedule.estado === 1 ? "Activo" : "Inactivo"
  };
}

// ==========================================
// 5. PAQUETES DE SERVICIOS (SOLO LECTURA)
// ==========================================

export function getBarberPackages() {
  const packages = getOrInit(STORAGE_KEYS.PACKAGES, INITIAL_PACKAGES);
  const services = getOrInit(STORAGE_KEYS.SERVICES, INITIAL_SERVICES);

  const packageImages = {
    1: "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=600&auto=format&fit=crop&q=80",
    2: "https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=600&auto=format&fit=crop&q=80",
    3: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=600&auto=format&fit=crop&q=80"
  };

  return packages
    .filter((pkg) => pkg.estado === 1)
    .map((pkg) => {
      const serviciosIncluidos = (pkg.servicios_ids || []).map((sId) =>
        services.find((s) => s.id_servicio === sId)
      ).filter(Boolean);

      const precioBase = serviciosIncluidos.reduce((acc, s) => acc + (s.precio || 0), 0);
      const descuento = pkg.descuento_porcentaje || 0;
      const precioFinal = Math.round(precioBase * (1 - descuento / 100));
      const duracionTotal = serviciosIncluidos.reduce((acc, s) => acc + (s.duracion_minutos || 0), 0);

      return {
        ...pkg,
        servicios: serviciosIncluidos,
        precioBase,
        descuento_porcentaje: descuento,
        precioFinal,
        duracion_minutos: duracionTotal,
        imagen_url: packageImages[pkg.id_paquete] || packageImages[1]
      };
    });
}

// ==========================================
// 6. NOVEDADES DE HORARIO (SOLICITUDES)
// ==========================================

export function getBarberNovelties() {
  const barber = getCurrentBarberProfile();
  const novelties = getOrInit(STORAGE_KEYS.NOVELTIES, INITIAL_NOVELTIES);

  // Filtrar exclusivamente novedades de este barbero
  return novelties
    .filter((n) => Number(n.id_barbero) === Number(barber.id_barbero))
    .sort((a, b) => (b.id_novedad || 0) - (a.id_novedad || 0));
}

export function createBarberNovelty(noveltyData) {
  const barber = getCurrentBarberProfile();
  const novelties = getOrInit(STORAGE_KEYS.NOVELTIES, INITIAL_NOVELTIES);

  const nextId = Math.max(...novelties.map((n) => n.id_novedad || 0), 0) + 1;
  const newNovelty = {
    id_novedad: nextId,
    id_barbero: barber.id_barbero,
    tipo: noveltyData.tipo || "Permiso",
    fecha: noveltyData.fecha || TODAY,
    cita_relacionada: noveltyData.cita_relacionada ? noveltyData.cita_relacionada.trim() : "Ninguna",
    motivo: noveltyData.motivo ? noveltyData.motivo.trim() : "",
    descripcion: noveltyData.descripcion ? noveltyData.descripcion.trim() : "",
    estado: "Pendiente",
    fecha_registro: new Date().toISOString().replace("T", " ").substring(0, 19),
    respuesta_admin: null
  };

  const updated = [newNovelty, ...novelties];
  save(STORAGE_KEYS.NOVELTIES, updated);

  return { success: true, novelty: newNovelty };
}

export function updateBarberNovelty(id_novedad, updatedData) {
  const barber = getCurrentBarberProfile();
  const novelties = getOrInit(STORAGE_KEYS.NOVELTIES, INITIAL_NOVELTIES);

  const index = novelties.findIndex(
    (n) => n.id_novedad === Number(id_novedad) && Number(n.id_barbero) === Number(barber.id_barbero)
  );

  if (index === -1) {
    return { success: false, error: "Solicitud de novedad no encontrada." };
  }

  if (novelties[index].estado !== "Pendiente") {
    return {
      success: false,
      error: "Solo se pueden editar solicitudes que se encuentren en estado Pendiente."
    };
  }

  novelties[index] = {
    ...novelties[index],
    tipo: updatedData.tipo || novelties[index].tipo,
    fecha: updatedData.fecha || novelties[index].fecha,
    cita_relacionada: updatedData.cita_relacionada !== undefined ? updatedData.cita_relacionada : novelties[index].cita_relacionada,
    motivo: updatedData.motivo ? updatedData.motivo.trim() : novelties[index].motivo,
    descripcion: updatedData.descripcion ? updatedData.descripcion.trim() : novelties[index].descripcion
  };

  save(STORAGE_KEYS.NOVELTIES, novelties);
  return { success: true, novelty: novelties[index] };
}

export function cancelBarberNovelty(id_novedad) {
  const barber = getCurrentBarberProfile();
  const novelties = getOrInit(STORAGE_KEYS.NOVELTIES, INITIAL_NOVELTIES);

  const index = novelties.findIndex(
    (n) => n.id_novedad === Number(id_novedad) && Number(n.id_barbero) === Number(barber.id_barbero)
  );

  if (index === -1) {
    return { success: false, error: "Solicitud no encontrada." };
  }

  if (novelties[index].estado !== "Pendiente") {
    return {
      success: false,
      error: "Solo puedes cancelar solicitudes que se encuentren en estado Pendiente."
    };
  }

  novelties[index].estado = "Cancelada";
  save(STORAGE_KEYS.NOVELTIES, novelties);

  return { success: true, novelty: novelties[index] };
}

// ==========================================
// 7. REPORTES DEL BARBERO
// ==========================================

export function getBarberReports() {
  const appointments = getBarberAppointments();

  const citasProgramadas = appointments.filter(
    (a) => a.estado === "Programada" || a.estado === "Reprogramada"
  );

  const citasCompletadas = appointments.filter(
    (a) => a.estado === "Completada"
  );

  const citasCanceladas = appointments.filter(
    (a) => a.estado === "Cancelada"
  );

  return {
    totalProgramadas: citasProgramadas.length,
    totalCompletadas: citasCompletadas.length,
    totalCanceladas: citasCanceladas.length,
    citasProgramadas,
    citasCompletadas
  };
}

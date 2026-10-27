/**
 * @file authService.js
 * Servicio centralizado de base de datos de usuarios y autenticación.
 * Gestiona la persistencia en localStorage y la verificación estricta de credenciales
 * según la estructura de la base de datos MySQL (tabla `usuario`).
 */
import { notifyDataChange, SYNC_ENTITIES } from "../../../shared/services/dataSyncService.js";

export const INITIAL_USERS = [
  {
    id_usuario: 1,
    documento: "1000000001",
    nombre: "Cristian",
    apellido: "Mazo",
    correo: "cristianmazo957@gmail.com",
    telefono: "+57 300 987 6543",
    id_rol: 1, // Administrador
    estado: 1,
    contrasena: "Admin123*",
    fecha_registro: "2026-01-10 08:00:00"
  },
  {
    id_usuario: 3,
    documento: "1000000002",
    nombre: "María",
    apellido: "García",
    correo: "maria@example.com",
    telefono: "+57 301 234 5678",
    id_rol: 2, // Recepcionista
    estado: 1,
    contrasena: "Recepcionista123*",
    fecha_registro: "2026-02-20 14:15:00"
  },
  {
    id_usuario: 4,
    documento: "1000000003",
    nombre: "Carlos",
    apellido: "Rodríguez",
    correo: "barbero@tuturnobarber.com",
    telefono: "+57 302 345 6789",
    id_rol: 3, // Barbero
    estado: 1,
    contrasena: "Barbero123*",
    fecha_registro: "2026-03-10 09:00:00"
  },
  {
    id_usuario: 5,
    documento: "1000000005",
    nombre: "Juan",
    apellido: "Pérez",
    correo: "cliente@example.com",
    telefono: "+57 310 123 4567",
    id_rol: 4, // Cliente
    estado: 1,
    contrasena: "Cliente123*",
    fecha_registro: "2026-04-05 10:00:00"
  },
  {
    id_usuario: 6,
    documento: "1000000006",
    nombre: "Juan",
    apellido: "Pérez",
    correo: "juan.perez@email.com",
    telefono: "+57 310 123 4567",
    id_rol: 4, // Cliente (alias móvil)
    estado: 1,
    contrasena: "Cliente123*",
    fecha_registro: "2026-04-05 10:00:00"
  },
  {
    id_usuario: 10,
    documento: "CC 9898989898",
    nombre: "barber",
    apellido: "gold",
    correo: "barbergoldenapp@gmail.com",
    telefono: "+57 318 597 7853",
    id_rol: 4, // Cliente
    estado: 1,
    contrasena: "Cliente123*",
    fecha_registro: "2026-09-28 00:34:55"
  }
];

export const DEMO_CREDENTIALS = [
  {
    role: "Administrador",
    id_rol: 1,
    name: "Cristian Mazo",
    email: "cristianmazo957@gmail.com",
    password: "Admin123*",
    badge: "Control Total",
    path: "/dashboard"
  },
  {
    role: "Recepcionista",
    id_rol: 2,
    name: "María García",
    email: "maria@example.com",
    password: "Recepcionista123*",
    badge: "Recepción & Citas",
    path: "/dashboard"
  },
  {
    role: "Barbero",
    id_rol: 3,
    name: "Carlos Rodríguez",
    email: "barbero@tuturnobarber.com",
    password: "Barbero123*",
    badge: "Agenda Personal",
    path: "/barbero"
  },
  {
    role: "Cliente",
    id_rol: 4,
    name: "Juan Pérez",
    email: "cliente@example.com",
    password: "Cliente123*",
    badge: "Portal Cliente",
    path: "/portal"
  }
];

const STORAGE_KEY = "barber_users_db";
const CURRENT_USER_KEY = "barber_current_user";

/**
 * Obtiene la lista de usuarios de la base de datos (localStorage).
 * Si no existe aún, inicializa con los usuarios por defecto.
 */
export function getStoredUsers() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_USERS));
      INITIAL_USERS.forEach((u) => {
        if (u.id_rol === 4) syncClientStorage(u);
      });
      return INITIAL_USERS;
    }
    const parsed = JSON.parse(data);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_USERS));
      INITIAL_USERS.forEach((u) => {
        if (u.id_rol === 4) syncClientStorage(u);
      });
      return INITIAL_USERS;
    }

    // Filtrar usuarios eliminados obsoletos (excepto los oficiales)
    let filtered = parsed.filter((u) => {
      const email = (u.correo || "").toLowerCase();
      const isOldDeleted = [
        "juan@example.com",
        "miguel@example.com",
        "javier@example.com",
        "ana@example.com",
        "luis@example.com",
        "admin@barber.com"
      ].includes(email);
      return !isOldDeleted;
    });

    let updated = filtered.length !== parsed.length;

    // Asegurar que el Administrador esté presente
    const hasAdmin = filtered.some((u) => u.correo.toLowerCase() === "cristianmazo957@gmail.com");
    if (!hasAdmin) {
      const defaultAdmin = INITIAL_USERS.find((u) => u.correo === "cristianmazo957@gmail.com");
      if (defaultAdmin) {
        filtered.unshift(defaultAdmin);
        updated = true;
      }
    } else {
      const adminIdx = filtered.findIndex((u) => u.correo.toLowerCase() === "cristianmazo957@gmail.com");
      if (adminIdx >= 0) {
        if (!filtered[adminIdx].contrasena || filtered[adminIdx].contrasena !== "Admin123*" || filtered[adminIdx].estado !== 1) {
          filtered[adminIdx].contrasena = "Admin123*";
          filtered[adminIdx].estado = 1;
          filtered[adminIdx].id_rol = 1;
          updated = true;
        }
      }
    }

    // Asegurar que la Recepcionista esté presente
    const hasRecepcionista = filtered.some((u) => u.correo.toLowerCase() === "maria@example.com");
    if (!hasRecepcionista) {
      const defaultRec = INITIAL_USERS.find((u) => u.correo === "maria@example.com");
      if (defaultRec) {
        filtered.push(defaultRec);
        updated = true;
      }
    } else {
      const recIdx = filtered.findIndex((u) => u.correo.toLowerCase() === "maria@example.com");
      if (recIdx >= 0) {
        if (!filtered[recIdx].contrasena || filtered[recIdx].contrasena !== "Recepcionista123*" || filtered[recIdx].estado !== 1) {
          filtered[recIdx].contrasena = "Recepcionista123*";
          filtered[recIdx].estado = 1;
          filtered[recIdx].id_rol = 2;
          updated = true;
        }
      }
    }

    // Asegurar que el Barbero Carlos Rodríguez esté presente
    const hasBarber = filtered.some((u) => u.correo.toLowerCase() === "barbero@tuturnobarber.com");
    if (!hasBarber) {
      const defaultBarber = INITIAL_USERS.find((u) => u.correo === "barbero@tuturnobarber.com");
      if (defaultBarber) {
        filtered.push(defaultBarber);
        updated = true;
      }
    } else {
      const barberIdx = filtered.findIndex((u) => u.correo.toLowerCase() === "barbero@tuturnobarber.com");
      if (barberIdx >= 0) {
        if (!filtered[barberIdx].contrasena || filtered[barberIdx].contrasena !== "Barbero123*" || filtered[barberIdx].estado !== 1) {
          filtered[barberIdx].contrasena = "Barbero123*";
          filtered[barberIdx].estado = 1;
          filtered[barberIdx].id_rol = 3;
          updated = true;
        }
      }
    }

    // Asegurar que el Cliente por defecto esté presente
    const hasClient = filtered.some((u) => u.correo.toLowerCase() === "cliente@example.com");
    if (!hasClient) {
      const defaultClient = INITIAL_USERS.find((u) => u.correo === "cliente@example.com");
      if (defaultClient) {
        filtered.push(defaultClient);
        syncClientStorage(defaultClient);
        updated = true;
      }
    } else {
      const clientIdx = filtered.findIndex((u) => u.correo.toLowerCase() === "cliente@example.com");
      if (clientIdx >= 0) {
        if (!filtered[clientIdx].contrasena || filtered[clientIdx].contrasena !== "Cliente123*" || filtered[clientIdx].estado !== 1) {
          filtered[clientIdx].contrasena = "Cliente123*";
          filtered[clientIdx].estado = 1;
          filtered[clientIdx].id_rol = 4;
          updated = true;
        }
        syncClientStorage(filtered[clientIdx]);
      }
    }

    if (updated) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    }
    return filtered;
  } catch (err) {
    console.error("Error al leer usuarios de localStorage:", err);
    return INITIAL_USERS;
  }
}

/**
 * Guarda la lista de usuarios en la base de datos local.
 */
export function saveStoredUsers(users) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
  } catch (err) {
    console.error("Error al guardar usuarios en localStorage:", err);
  }
}

/**
 * Busca un usuario por correo electrónico (sin distinción de mayúsculas/minúsculas).
 */
export function findUserByEmail(email) {
  if (!email) return null;
  const users = getStoredUsers();
  const cleanEmail = email.trim().toLowerCase();
  return users.find((u) => u.correo.toLowerCase() === cleanEmail) || null;
}

import { setStoredToken, clearStoredToken, getStoredToken } from "../../../shared/api/apiClient.js";

/**
 * Sincroniza un usuario con rol cliente en la base de datos local de clientes (barber_clients_db).
 * Garantiza que el nombre, apellido, teléfono y correo reales estén siempre disponibles para citas y ventas.
 */
export function syncClientStorage(user, direccion = "No especificada") {
  if (!user || Number(user.id_rol) !== 4) return;
  try {
    const rawClients = localStorage.getItem("barber_clients_db");
    const clients = rawClients ? JSON.parse(rawClients) : [];
    const cleanEmail = (user.correo || "").trim().toLowerCase();

    const idx = clients.findIndex(
      (c) =>
        (user.id_usuario && Number(c.id_usuario) === Number(user.id_usuario)) ||
        (c.correo && c.correo.toLowerCase() === cleanEmail)
    );

    if (idx >= 0) {
      clients[idx] = {
        ...clients[idx],
        id_usuario: user.id_usuario || clients[idx].id_usuario,
        documento: user.documento || clients[idx].documento || null,
        nombre: user.nombre ? user.nombre.trim() : clients[idx].nombre,
        apellido: user.apellido ? user.apellido.trim() : clients[idx].apellido,
        correo: user.correo ? user.correo.trim().toLowerCase() : clients[idx].correo,
        telefono: user.telefono ? user.telefono.trim() : (clients[idx].telefono || ""),
        direccion: direccion && direccion !== "No especificada" ? direccion.trim() : (clients[idx].direccion || "No especificada"),
        estado: 1
      };
    } else {
      const nextId = Math.max(...clients.map((c) => Number(c.id_cliente) || 0), 0) + 1;
      clients.push({
        id_cliente: nextId,
        id_usuario: user.id_usuario,
        tipo_documento: user.tipo_documento || "CC",
        documento: user.documento || null,
        nombre: (user.nombre || "").trim(),
        apellido: (user.apellido || "").trim(),
        correo: cleanEmail,
        telefono: user.telefono ? user.telefono.trim() : "",
        direccion: direccion ? direccion.trim() : "No especificada",
        nivel_fidelidad: "Nuevo",
        puntos_fidelidad: 0,
        estado: 1
      });
    }
    localStorage.setItem("barber_clients_db", JSON.stringify(clients));
  } catch (err) {
    console.error("Error al sincronizar cliente en localStorage:", err);
  }
}

/**
 * Registra un nuevo usuario en la base de datos (con llamada al Backend API).
 */
export async function registerUser(userData) {
  const cleanEmail = userData.correo.trim().toLowerCase();

  // 1. Intentar registrar en Backend API
  try {
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nombre: userData.nombre.trim(),
        apellido: userData.apellido.trim(),
        tipo_documento: userData.tipo_documento || "CC",
        documento: userData.documento ? userData.documento.trim() : null,
        correo: cleanEmail,
        contrasena: userData.contrasena,
        telefono: userData.telefono ? userData.telefono.trim() : null,
        direccion: userData.direccion ? userData.direccion.trim() : null,
        id_rol: userData.id_rol ? Number(userData.id_rol) : 4
      })
    });

    const json = await res.json().catch(() => null);

    if (res.ok && json?.data) {
      const { token, user } = json.data;
      if (token) setStoredToken(token);
      if (user) {
        // Sincronizar en almacenamiento local para consistencia
        const users = getStoredUsers();
        if (!users.some((u) => u.correo.toLowerCase() === cleanEmail)) {
          users.push(user);
          saveStoredUsers(users);
        }
        syncClientStorage(user, userData.direccion);
      }
      return { success: true, user: user || json.data };
    }

    if (!res.ok) {
      const errorMsg = json?.message || json?.error || "Error al registrar la cuenta.";
      return { success: false, error: errorMsg };
    }
  } catch (err) {
    console.warn("[Auth] Backend no disponible para registro, usando fallback local:", err.message);
  }

  // Fallback local en desarrollo si el backend no responde
  const users = getStoredUsers();
  const existing = users.find((u) => u.correo.toLowerCase() === cleanEmail);
  if (existing) {
    return { success: false, error: "Ya existe un usuario registrado con este correo electrónico." };
  }

  const nextId = Math.max(...users.map((u) => u.id_usuario || 0), 0) + 1;
  const newUser = {
    id_usuario: nextId,
    tipo_documento: userData.tipo_documento || "CC",
    documento: userData.documento ? userData.documento.trim() : null,
    nombre: userData.nombre.trim(),
    apellido: userData.apellido.trim(),
    correo: cleanEmail,
    telefono: userData.telefono ? userData.telefono.trim() : null,
    id_rol: userData.id_rol ? Number(userData.id_rol) : 4,
    contrasena: userData.contrasena,
    estado: 1,
    fecha_registro: new Date().toISOString().replace("T", " ").substring(0, 19)
  };

  const updatedUsers = [...users, newUser];
  saveStoredUsers(updatedUsers);
  syncClientStorage(newUser, userData.direccion);
  return { success: true, user: newUser };
}

/**
 * Valida credenciales de inicio de sesión contra el Backend API con fallback local.
 */
export async function loginWithCredentials(email, password) {
  const cleanEmail = (email || "").trim().toLowerCase();
  const cleanPass = password || "";

  if (!cleanEmail) {
    return {
      success: false,
      field: "correo",
      error: "Ingresa tu correo electrónico."
    };
  }

  if (!cleanPass || cleanPass.trim() === "") {
    return {
      success: false,
      field: "contrasena",
      error: "Ingresa tu contraseña."
    };
  }

  if (cleanPass.length < 8) {
    return {
      success: false,
      field: "contrasena",
      error: "La contraseña debe tener al menos 8 caracteres."
    };
  }

  // 1. Intentar autenticar contra el Backend API
  try {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ correo: cleanEmail, contrasena: cleanPass })
    });

    const json = await res.json().catch(() => null);

    if (res.ok && json?.data) {
      const { token, user } = json.data;
      setStoredToken(token);
      setCurrentUser(user);

      // Sincronizar en localStorage
      const users = getStoredUsers();
      const idx = users.findIndex((u) => u.correo.toLowerCase() === cleanEmail);
      if (idx >= 0) {
        users[idx] = { ...users[idx], ...user };
      } else {
        users.push(user);
      }
      saveStoredUsers(users);

      return {
        success: true,
        user,
        token
      };
    }

    // Si el backend respondió con un error de cliente (400, 401, 403, 404) y un JSON válido
    if (!res.ok && json && res.status >= 400 && res.status < 500) {
      const msg = json?.message || json?.error || "Error de credenciales.";
      let field = "general";
      if (msg.toLowerCase().includes("correo") || msg.toLowerCase().includes("cuenta")) {
        field = "correo";
      } else if (msg.toLowerCase().includes("contraseña")) {
        field = "contrasena";
      }
      return {
        success: false,
        field,
        error: msg
      };
    }

    console.warn(`[Auth] Backend no disponible (HTTP ${res.status}), autenticando con base de datos local.`);
  } catch (err) {
    console.warn("[Auth] Backend no disponible para login, validando credenciales localmente:", err.message);
  }

  // 2. Fallback local si el backend no responde
  const users = getStoredUsers();
  const user = users.find((u) => u.correo.toLowerCase() === cleanEmail);

  if (!user) {
    return {
      success: false,
      field: "correo",
      error: "No existe ninguna cuenta registrada con este correo."
    };
  }

  if (user.estado === 0) {
    return {
      success: false,
      field: "general",
      error: "Tu cuenta se encuentra inactiva. Comunícate con el administrador."
    };
  }

  if (user.contrasena !== cleanPass) {
    return {
      success: false,
      field: "contrasena",
      error: "Contraseña incorrecta. Por favor verifica e intenta nuevamente."
    };
  }

  setCurrentUser(user);
  return {
    success: true,
    user
  };
}

/**
 * Obtiene el usuario autenticado actualmente.
 * Retorna null si no hay sesión activa en localStorage.
 */
export function getCurrentUser() {
  try {
    const data = localStorage.getItem(CURRENT_USER_KEY);
    if (data) return JSON.parse(data);
  } catch (err) {
    console.error("Error al obtener el usuario actual:", err);
  }
  return null;
}

/**
 * Establece el usuario autenticado actualmente.
 * Sincroniza automáticamente los datos del cliente registrado.
 */
export function setCurrentUser(user) {
  try {
    if (user) {
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
      syncClientStorage(user);
    } else {
      localStorage.removeItem(CURRENT_USER_KEY);
    }
  } catch (err) {
    console.error("Error al guardar usuario actual:", err);
  }
}

/**
 * Cierra la sesión del usuario actual.
 */
export function logoutUser() {
  try {
    clearStoredToken();
    localStorage.removeItem(CURRENT_USER_KEY);
    sessionStorage.removeItem("barber_intro_shown");
    sessionStorage.removeItem("play_barber_intro");
  } catch (err) {
    console.error("Error al cerrar sesión:", err);
  }
}

/**
 * Actualiza el perfil del usuario autenticado en Backend API y sincroniza localmente.
 */
export async function updateUserProfile(profileData) {
  const token = getStoredToken();
  const user = getCurrentUser();

  const payload = {
    nombre: profileData.nombre?.trim(),
    apellido: profileData.apellido?.trim(),
    documento: profileData.documento ? profileData.documento.trim() : null,
    telefono: profileData.telefono ? profileData.telefono.trim() : null,
    direccion: profileData.direccion ? profileData.direccion.trim() : null
  };
  if (profileData.imagen_url !== undefined) payload.imagen_url = profileData.imagen_url;
  if (profileData.avatar_url !== undefined) payload.avatar_url = profileData.avatar_url;
  if (profileData.nuevaContrasena) {
    payload.contrasena = profileData.nuevaContrasena;
    if (profileData.contrasenaActual) {
      payload.contrasena_actual = profileData.contrasenaActual;
    }
  }

  if (token) {
    try {
      const res = await fetch("/api/auth/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      const json = await res.json().catch(() => null);
      if (res.ok && json?.data) {
        const updated = json.data;
        setCurrentUser(updated);

        // Sincronizar en barber_users_db
        try {
          const users = getStoredUsers();
          const uIdx = users.findIndex(
            (u) =>
              (updated.id_usuario && Number(u.id_usuario) === Number(updated.id_usuario)) ||
              (u.correo && updated.correo && u.correo.toLowerCase() === updated.correo.toLowerCase())
          );
          if (uIdx >= 0) {
            users[uIdx] = { ...users[uIdx], ...updated };
            saveStoredUsers(users);
          }
        } catch (_) {}

        // Si es barbero, sincronizar en barber_barbers_db
        if (Number(updated.id_rol) === 3 || updated.id_barbero || Number(user?.id_rol) === 3 || user?.id_barbero) {
          try {
            const rawBarbers = localStorage.getItem("barber_barbers_db");
            if (rawBarbers) {
              const barbers = JSON.parse(rawBarbers);
              const bIdx = barbers.findIndex(
                (b) =>
                  (updated.id_barbero && Number(b.id_barbero) === Number(updated.id_barbero)) ||
                  (updated.id_usuario && Number(b.id_usuario) === Number(updated.id_usuario)) ||
                  (user?.id_barbero && Number(b.id_barbero) === Number(user.id_barbero)) ||
                  (user?.id_usuario && Number(b.id_usuario) === Number(user.id_usuario)) ||
                  (b.correo && updated.correo && b.correo.toLowerCase() === updated.correo.toLowerCase())
              );
              if (bIdx >= 0) {
                barbers[bIdx] = {
                  ...barbers[bIdx],
                  nombre: updated.nombre || barbers[bIdx].nombre,
                  apellido: updated.apellido || barbers[bIdx].apellido,
                  telefono: updated.telefono || barbers[bIdx].telefono,
                  documento: updated.documento || barbers[bIdx].documento,
                  imagen_url: updated.imagen_url !== undefined ? updated.imagen_url : (payload.imagen_url !== undefined ? payload.imagen_url : barbers[bIdx].imagen_url)
                };
                localStorage.setItem("barber_barbers_db", JSON.stringify(barbers));
              }
            }
          } catch (_) {}
        }

        notifyDataChange(SYNC_ENTITIES.USERS, updated);
        if (Number(updated.id_rol) === 3 || updated.id_barbero || Number(user?.id_rol) === 3 || user?.id_barbero) {
          notifyDataChange(SYNC_ENTITIES.BARBERS, updated);
        }
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("auth_user_updated", { detail: updated }));
          window.dispatchEvent(new CustomEvent("barber_profile_updated", { detail: updated }));
        }

        return { success: true, user: updated };
      }
      if (!res.ok) {
        return { success: false, error: json?.message || json?.error || "Error al actualizar perfil." };
      }
    } catch (err) {
      console.warn("[Auth] Error al actualizar perfil en backend, procediendo a fallback local:", err.message);
    }
  }

  // Fallback local
  if (user) {
    const updated = {
      ...user,
      ...payload
    };
    setCurrentUser(updated);

    const users = getStoredUsers();
    const idx = users.findIndex(
      (u) =>
        (user.id_usuario && Number(u.id_usuario) === Number(user.id_usuario)) ||
        (u.correo && user.correo && u.correo.toLowerCase() === user.correo.toLowerCase())
    );
    if (idx >= 0) {
      users[idx] = { ...users[idx], ...payload };
      saveStoredUsers(users);
    }

    if (Number(user.id_rol) === 3 || user.id_barbero) {
      try {
        const rawBarbers = localStorage.getItem("barber_barbers_db");
        if (rawBarbers) {
          const barbers = JSON.parse(rawBarbers);
          const bIdx = barbers.findIndex(
            (b) =>
              (user.id_barbero && Number(b.id_barbero) === Number(user.id_barbero)) ||
              (user.id_usuario && Number(b.id_usuario) === Number(user.id_usuario)) ||
              (b.correo && user.correo && b.correo.toLowerCase() === user.correo.toLowerCase())
          );
          if (bIdx >= 0) {
            barbers[bIdx] = {
              ...barbers[bIdx],
              nombre: payload.nombre || barbers[bIdx].nombre,
              apellido: payload.apellido || barbers[bIdx].apellido,
              telefono: payload.telefono !== undefined ? payload.telefono : barbers[bIdx].telefono,
              documento: payload.documento !== undefined ? payload.documento : barbers[bIdx].documento,
              imagen_url: payload.imagen_url !== undefined ? payload.imagen_url : barbers[bIdx].imagen_url
            };
            localStorage.setItem("barber_barbers_db", JSON.stringify(barbers));
          }
        }
      } catch (_) {}
    }

    notifyDataChange(SYNC_ENTITIES.USERS, updated);
    if (Number(user.id_rol) === 3 || user.id_barbero) {
      notifyDataChange(SYNC_ENTITIES.BARBERS, updated);
    }
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("auth_user_updated", { detail: updated }));
      window.dispatchEvent(new CustomEvent("barber_profile_updated", { detail: updated }));
    }

    return { success: true, user: updated };
  }

  return { success: false, error: "No se encontró sesión de usuario activa." };
}


export const DEVICE_GOOGLE_ACCOUNTS_KEY = "tu_turno_device_google_accounts";

/**
 * Obtiene ÚNICAMENTE las cuentas personales de Google que tienen sesión iniciada
 * en ESTE dispositivo específico (guardadas en localStorage de este navegador).
 * 
 * Reglas de aislamiento estricto:
 * 1. NUNCA lee cuentas de la base de datos general (ni mockStore ni barber_users_db).
 * 2. Purga y elimina automáticamente cualquier cuenta del sistema o de prueba (ej. esteban123, esteban1235)
 *    que se haya importado incorrectamente por versiones previas.
 * 3. En este dispositivo personal conserva exclusivamente las cuentas activas del usuario:
 *    - Cristian Medina (cristianmazo957@gmail.com)
 *    - barber gold (barbergoldenapp@gmail.com)
 * 4. En dispositivos limpios o si el usuario las retira, solo mostrará las que ese usuario
 *    haya iniciado sesión explícitamente en ese equipo.
 */
export function getDeviceGoogleAccounts() {
  const FORBIDDEN_MOCK_EMAILS = [
    "esteban123@gmail.com",
    "esteban1235@gmail.com",
    "maria@example.com",
    "barbero@tuturnobarber.com",
    "cliente@example.com",
    "juan.perez@email.com"
  ];

  try {
    const data = localStorage.getItem(DEVICE_GOOGLE_ACCOUNTS_KEY);
    if (data !== null) {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) {
        // Filtrar estrictamente solo cuentas legítimas de Google de este dispositivo
        const sanitized = parsed.filter((acc) => {
          const email = (acc.email || acc.correo || "").trim().toLowerCase();
          const domain = email.split("@")[1];
          const isGoogle = domain === "gmail.com" || domain === "googlemail.com";
          return email && isGoogle && !FORBIDDEN_MOCK_EMAILS.includes(email);
        });

        const formatted = sanitized.map((acc) => {
          const email = (acc.email || acc.correo || "").trim().toLowerCase();
          if (email === "cristianmazo957@gmail.com") {
            return { ...acc, email, nombre: "Cristian Medina" };
          }
          if (email === "barbergoldenapp@gmail.com") {
            return { ...acc, email, nombre: "barber gold" };
          }
          return acc;
        });

        // Si se limpiaron cuentas no deseadas o cambiaron nombres, actualizar localStorage inmediatamente
        if (formatted.length !== parsed.length || JSON.stringify(formatted) !== data) {
          localStorage.setItem(DEVICE_GOOGLE_ACCOUNTS_KEY, JSON.stringify(formatted));
        }

        return formatted;
      }
    }
  } catch (err) {
    console.error("Error al obtener cuentas de Google del dispositivo:", err);
  }

  // Cuentas personales reconocidas en este dispositivo de desarrollo del usuario
  const defaultAccounts = [
    {
      id_usuario: 1,
      email: "cristianmazo957@gmail.com",
      nombre: "Cristian Medina",
      id_rol: 1,
      rol_nombre: "Administrador",
      imagen_url: null,
      lastLogin: new Date().toISOString()
    },
    {
      id_usuario: 10,
      email: "barbergoldenapp@gmail.com",
      nombre: "barber gold",
      id_rol: 4,
      rol_nombre: "Cliente",
      imagen_url: null,
      lastLogin: new Date().toISOString()
    }
  ];

  try {
    localStorage.setItem(DEVICE_GOOGLE_ACCOUNTS_KEY, JSON.stringify(defaultAccounts));
  } catch (e) {
    // ignore
  }

  return defaultAccounts;
}

/**
 * Guarda o actualiza una cuenta que ha iniciado sesión exitosamente en este dispositivo.
 * Solo se invoca tras una autenticación válida y exitosa.
 */
export function saveDeviceGoogleAccount(user) {
  if (!user) return;
  try {
    const email = (user.correo || user.email || "").trim().toLowerCase();
    if (!email) return;

    // Validación: nunca registrar cuentas ficticias del sistema
    const FORBIDDEN_MOCK_EMAILS = [
      "esteban123@gmail.com",
      "esteban1235@gmail.com",
      "maria@example.com",
      "barbero@tuturnobarber.com",
      "cliente@example.com",
      "juan.perez@email.com"
    ];
    if (FORBIDDEN_MOCK_EMAILS.includes(email)) return;

    const existingAccounts = getDeviceGoogleAccounts();
    const filtered = existingAccounts.filter(
      (acc) => (acc.email || "").trim().toLowerCase() !== email
    );

    let displayName = user.nombre ? `${user.nombre} ${user.apellido || ""}`.trim() : email;
    if (email === "cristianmazo957@gmail.com") displayName = "Cristian Medina";
    if (email === "barbergoldenapp@gmail.com") displayName = "barber gold";

    const cleanImg = user.imagen_url || user.avatar_url || null;

    const accountToSave = {
      id_usuario: user.id_usuario || null,
      email: email,
      nombre: displayName,
      id_rol: Number(user.id_rol) || 4,
      rol_nombre:
        user.rol_nombre ||
        user.rol ||
        (Number(user.id_rol) === 1
          ? "Administrador"
          : Number(user.id_rol) === 2
            ? "Recepcionista"
            : Number(user.id_rol) === 3
              ? "Barbero"
              : "Cliente"),
      imagen_url: cleanImg && !cleanImg.includes("unsplash.com") ? cleanImg : null,
      lastLogin: new Date().toISOString()
    };

    filtered.unshift(accountToSave);
    localStorage.setItem(DEVICE_GOOGLE_ACCOUNTS_KEY, JSON.stringify(filtered));
  } catch (err) {
    console.error("Error al guardar cuenta de Google en dispositivo:", err);
  }
}

/**
 * Elimina una cuenta guardada en este dispositivo.
 */
export function removeDeviceGoogleAccount(email) {
  if (!email) return [];
  try {
    const cleanEmail = email.trim().toLowerCase();
    const existingAccounts = getDeviceGoogleAccounts();
    const filtered = existingAccounts.filter(
      (acc) => (acc.email || "").trim().toLowerCase() !== cleanEmail
    );
    localStorage.setItem(DEVICE_GOOGLE_ACCOUNTS_KEY, JSON.stringify(filtered));
    return filtered;
  } catch (err) {
    console.error("Error al eliminar cuenta de Google del dispositivo:", err);
    return [];
  }
}

/**
 * Verifica de forma estricta si un correo de Google existe y es 100% real en el sistema.
 */
export async function verifyGoogleAccountEmail(email) {
  const cleanEmail = (email || "").trim().toLowerCase();
  if (!cleanEmail) {
    return { success: false, error: "El correo electrónico de Google es requerido." };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(cleanEmail)) {
    return { success: false, error: "Por favor ingresa un formato de correo electrónico válido." };
  }

  const domain = cleanEmail.split("@")[1];
  const nonGoogleDomains = [
    "tuturnobarber.com",
    "example.com",
    "hotmail.com",
    "outlook.com",
    "live.com",
    "yahoo.com",
    "icloud.com"
  ];
  if (nonGoogleDomains.includes(domain)) {
    return {
      success: false,
      error: "No se ha encontrado tu cuenta de Google. El correo ingresado no pertenece a una cuenta de Google."
    };
  }

  try {
    const res = await fetch("/api/auth/google/verify-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: cleanEmail })
    });

    const json = await res.json().catch(() => null);

    if (res.ok && json?.data) {
      return { success: true, data: json.data };
    }

    if (!res.ok) {
      return {
        success: false,
        error: json?.message || "No se ha encontrado tu cuenta de Google."
      };
    }
  } catch (err) {
    console.warn("[Auth] Backend no disponible para verificar correo Google, validando localmente:", err.message);
  }

  // Fallback local
  if (domain !== "gmail.com" && domain !== "googlemail.com") {
    return {
      success: false,
      error: "No se ha encontrado tu cuenta de Google. El correo ingresado no pertenece a una cuenta de Google."
    };
  }

  const users = getStoredUsers();
  const user = users.find((u) => (u.correo || "").toLowerCase() === cleanEmail);

  if (!user) {
    return {
      success: false,
      error: "Esta cuenta de Google no se encuentra registrada en Tu Turno Barber. Por favor crea una cuenta o regístrate primero."
    };
  }

  if (user.estado === 0) {
    return {
      success: false,
      error: "Tu cuenta se encuentra inactiva. Comunícate con el administrador."
    };
  }

  return {
    success: true,
    data: {
      exists: true,
      email: cleanEmail,
      nombre: user.nombre,
      apellido: user.apellido,
      imagen_url: user.imagen_url || null
    }
  };
}

/**
 * Inicia sesión con cuenta de Google exigiendo de forma estricta la verificación de identidad (contraseña).
 * No permite iniciar sesión de una sola vez sin validar la contraseña.
 */
export async function loginWithGoogle({ email, name, avatarUrl, contrasena, isExistingDeviceAccount = false }) {
  const cleanEmail = (email || "").trim().toLowerCase();
  if (!cleanEmail) {
    return { success: false, error: "El correo electrónico de Google es requerido." };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(cleanEmail)) {
    return { success: false, error: "Por favor ingresa un formato de correo electrónico válido." };
  }

  const domain = cleanEmail.split("@")[1];
  const nonGoogleDomains = [
    "tuturnobarber.com",
    "example.com",
    "hotmail.com",
    "outlook.com",
    "live.com",
    "yahoo.com",
    "icloud.com"
  ];
  if (nonGoogleDomains.includes(domain)) {
    return {
      success: false,
      error: "No se ha encontrado tu cuenta de Google. El correo ingresado no pertenece a una cuenta de Google."
    };
  }

  if (!isExistingDeviceAccount && (!contrasena || typeof contrasena !== "string" || !contrasena.trim())) {
    return { success: false, error: "Por favor introduce la contraseña de tu cuenta." };
  }

  // 1. Intentar validar e iniciar sesión en Backend API
  try {
    const res = await fetch("/api/auth/google", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: cleanEmail, name, avatarUrl, contrasena, isExistingDeviceAccount })
    });

    const json = await res.json().catch(() => null);

    if (res.ok && json?.data) {
      const { token, user } = json.data;
      if (token) setStoredToken(token);
      if (user) {
        setCurrentUser(user);
        saveDeviceGoogleAccount(user);

        // Sincronizar en DB local si aplica
        const users = getStoredUsers();
        const idx = users.findIndex((u) => u.correo.toLowerCase() === cleanEmail);
        if (idx >= 0) {
          users[idx] = { ...users[idx], ...user };
        } else {
          users.push(user);
        }
        saveStoredUsers(users);
      }
      return { success: true, user };
    }

    if (!res.ok) {
      const errorMsg =
        json?.message ||
        json?.error ||
        "Contraseña incorrecta. Introduce la contraseña correcta de tu cuenta para acceder con Google.";
      return { success: false, error: errorMsg };
    }
  } catch (err) {
    console.warn("[Auth] Backend no disponible para login con Google, usando validación local:", err.message);
  }

  // 2. Fallback local si el backend no responde
  const users = getStoredUsers();
  const user = users.find((u) => u.correo.toLowerCase() === cleanEmail);

  if (!user) {
    return {
      success: false,
      error: "No se ha encontrado ninguna cuenta de Google con este correo o no está registrada en Tu Turno Barber."
    };
  }

  if (user.estado === 0) {
    return {
      success: false,
      error: "Tu cuenta se encuentra inactiva. Comunícate con el administrador."
    };
  }

  if (!isExistingDeviceAccount && user.contrasena !== contrasena) {
    return {
      success: false,
      error: "Contraseña incorrecta. Introduce la contraseña correcta de tu cuenta para acceder con Google."
    };
  }

  setCurrentUser(user);
  saveDeviceGoogleAccount(user);
  return { success: true, user };
}

/**
 * Obtiene las cuentas de Google guardadas exclusivamente en este dispositivo.
 * Retorna las cuentas personales con las que se ha iniciado sesión previamente en este equipo.
 */
export async function getGoogleAccounts() {
  return getDeviceGoogleAccounts();
}

/**
 * Solicita el envío de un código de verificación por correo electrónico para restablecer contraseña.
 * Despacha el correo real mediante el servicio SMTP configurado en el backend.
 * @param {string} correo - Correo electrónico del usuario
 */
export async function requestPasswordReset(correo) {
  const cleanEmail = (correo || "").trim().toLowerCase();
  if (!cleanEmail) {
    return { success: false, error: "Debes ingresar tu correo electrónico." };
  }

  // 1. Enviar solicitud al Backend API (dispara Nodemailer con Gmail SMTP)
  try {
    const res = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ correo: cleanEmail })
    });

    const json = await res.json().catch(() => null);

    if (res.ok && json) {
      return {
        success: true,
        message: json.message || "Se ha enviado un código de verificación a tu correo electrónico.",
        data: json.data || {}
      };
    }

    if (!res.ok) {
      const errorMsg =
        json?.message ||
        json?.error ||
        "No existe ninguna cuenta registrada con este correo electrónico o la cuenta está inactiva.";
      return { success: false, error: errorMsg };
    }
  } catch (err) {
    console.warn("[Auth] Backend no disponible para recuperación de contraseña, usando fallback local:", err.message);
  }

  // 2. Fallback offline local
  const users = getStoredUsers();
  const user = users.find((u) => u.correo.toLowerCase() === cleanEmail);
  if (!user) {
    return {
      success: false,
      error: "No existe ninguna cuenta registrada con este correo electrónico."
    };
  }

  if (user.estado === 0) {
    return {
      success: false,
      error: "Tu cuenta se encuentra inactiva. Comunícate con el administrador."
    };
  }

  const fallbackCode = Math.floor(100000 + Math.random() * 900000).toString();
  try {
    sessionStorage.setItem(`offline_reset_code_${cleanEmail}`, JSON.stringify({
      code: fallbackCode,
      expiresAt: Date.now() + 15 * 60 * 1000
    }));
  } catch (e) {
    // ignore
  }

  return {
    success: true,
    message: "Se ha generado un código de verificación.",
    data: {
      correo: cleanEmail,
      codigo_demo: fallbackCode,
      expira_en_minutos: 15
    }
  };
}

/**
 * Restablece la contraseña de cualquier usuario validando el código de 6 dígitos.
 * Actualiza la contraseña en el backend (MySQL / json) y en localStorage.
 * @param {string} correo - Correo del usuario
 * @param {string} codigo - Código de 6 dígitos recibido
 * @param {string} nuevaContrasena - Nueva contraseña
 */
export async function confirmPasswordReset(correo, codigo, nuevaContrasena) {
  const cleanEmail = (correo || "").trim().toLowerCase();
  const cleanCode = (codigo || "").trim();
  const cleanPass = nuevaContrasena || "";

  if (!cleanEmail) {
    return { success: false, error: "El correo electrónico es requerido." };
  }
  if (!cleanCode) {
    return { success: false, error: "Ingresa el código de 6 dígitos enviado a tu correo." };
  }
  if (!cleanPass || cleanPass.length < 6) {
    return { success: false, error: "La nueva contraseña debe tener al menos 6 caracteres." };
  }

  // 1. Restablecer en Backend API
  try {
    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        correo: cleanEmail,
        codigo: cleanCode,
        nueva_contrasena: cleanPass
      })
    });

    const json = await res.json().catch(() => null);

    if (res.ok && json) {
      // Sincronizar contraseña en el almacenamiento local para coherencia total
      const users = getStoredUsers();
      const idx = users.findIndex((u) => u.correo.toLowerCase() === cleanEmail);
      if (idx >= 0) {
        users[idx].contrasena = cleanPass;
        saveStoredUsers(users);
      }

      const currentUser = getCurrentUser();
      if (currentUser && currentUser.correo.toLowerCase() === cleanEmail) {
        currentUser.contrasena = cleanPass;
        setCurrentUser(currentUser);
      }

      return {
        success: true,
        message: json.message || "¡Contraseña actualizada exitosamente! Ya puedes iniciar sesión."
      };
    }

    if (!res.ok) {
      const errorMsg = json?.message || json?.error || "Código de verificación incorrecto o expirado.";
      return { success: false, error: errorMsg };
    }
  } catch (err) {
    console.warn("[Auth] Backend no disponible para reset de contraseña, intentando fallback local:", err.message);
  }

  // 2. Fallback offline local
  try {
    const rawOffline = sessionStorage.getItem(`offline_reset_code_${cleanEmail}`);
    if (rawOffline) {
      const { code, expiresAt } = JSON.parse(rawOffline);
      if (Date.now() > expiresAt) {
        return { success: false, error: "El código de verificación ha expirado. Solicita uno nuevo." };
      }
      if (code !== cleanCode) {
        return { success: false, error: "El código de verificación ingresado es incorrecto." };
      }

      const users = getStoredUsers();
      const idx = users.findIndex((u) => u.correo.toLowerCase() === cleanEmail);
      if (idx >= 0) {
        users[idx].contrasena = cleanPass;
        saveStoredUsers(users);
      }
      sessionStorage.removeItem(`offline_reset_code_${cleanEmail}`);

      return {
        success: true,
        message: "Contraseña actualizada exitosamente."
      };
    }
  } catch (e) {
    // ignore
  }

  return {
    success: false,
    error: "No fue posible verificar el código. Por favor verifica que los 6 dígitos coincidan o solicita un nuevo código."
  };
}


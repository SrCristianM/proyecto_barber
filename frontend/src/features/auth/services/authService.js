/**
 * @file authService.js
 * Servicio centralizado de base de datos de usuarios y autenticación.
 * Gestiona la persistencia en localStorage y la verificación estricta de credenciales
 * según la estructura de la base de datos MySQL (tabla `usuario`).
 */

export const INITIAL_USERS = [
  {
    id_usuario: 1,
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
    id_usuario: 2,
    nombre: "Juan",
    apellido: "Pérez",
    correo: "juan@example.com",
    telefono: "+57 300 123 4567",
    id_rol: 1, // Administrador
    estado: 1,
    contrasena: "Admin123*",
    fecha_registro: "2026-01-15 10:30:00"
  },
  {
    id_usuario: 3,
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
    nombre: "Ana",
    apellido: "Torres",
    correo: "ana@example.com",
    telefono: "+57 303 456 7890",
    id_rol: 3, // Barbero
    estado: 1,
    contrasena: "Barbero123*",
    fecha_registro: "2026-04-05 16:45:00"
  },
  {
    id_usuario: 6,
    nombre: "Luis",
    apellido: "Martínez",
    correo: "luis@example.com",
    telefono: "+57 304 567 8901",
    id_rol: 3, // Barbero
    estado: 0, // Inactivo
    contrasena: "Barbero123*",
    fecha_registro: "2026-05-12 11:20:00"
  },
  {
    id_usuario: 7,
    nombre: "Pedro",
    apellido: "López",
    correo: "cliente@example.com",
    telefono: "3001234567",
    id_rol: 4, // Cliente
    estado: 1, // Activo
    contrasena: "Cliente123*",
    fecha_registro: "2026-06-01 08:00:00"
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
      return INITIAL_USERS;
    }
    const parsed = JSON.parse(data);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_USERS));
      return INITIAL_USERS;
    }
    let updated = false;
    // Asegurar que el usuario cliente por defecto esté disponible si no existía previamente
    if (!parsed.some((u) => u.correo === "cliente@example.com")) {
      const clientUser = INITIAL_USERS.find((u) => u.correo === "cliente@example.com");
      if (clientUser) {
        parsed.push(clientUser);
        updated = true;
      }
    }
    // Asegurar que el usuario barbero por defecto esté disponible para pruebas
    const hasBarber = parsed.some((u) => u.correo.toLowerCase() === "barbero@tuturnobarber.com");
    if (!hasBarber) {
      const defaultBarber = INITIAL_USERS.find((u) => u.correo === "barbero@tuturnobarber.com") || {
        id_usuario: 4,
        nombre: "Carlos",
        apellido: "Rodríguez",
        correo: "barbero@tuturnobarber.com",
        telefono: "+57 302 345 6789",
        id_rol: 3,
        estado: 1,
        contrasena: "Barbero123*",
        fecha_registro: "2026-03-10 09:00:00"
      };
      parsed.push(defaultBarber);
      updated = true;
    }
    if (updated) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
    }
    return parsed;
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

import { setStoredToken, clearStoredToken } from "../../../shared/api/apiClient.js";

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
        nombre: (user.nombre || "").trim(),
        apellido: (user.apellido || "").trim(),
        correo: cleanEmail,
        telefono: user.telefono ? user.telefono.trim() : "",
        direccion: direccion ? direccion.trim() : "No especificada",
        nivel_fidelidad: "Nuevo",
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

    if (!res.ok) {
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
  } catch (err) {
    console.error("Error al cerrar sesión:", err);
  }
}

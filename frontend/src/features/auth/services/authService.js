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
    correo: "carlos@example.com",
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
    // Asegurar que el usuario cliente por defecto esté disponible si no existía previamente
    if (!parsed.some((u) => u.correo === "cliente@example.com")) {
      const clientUser = INITIAL_USERS.find((u) => u.correo === "cliente@example.com");
      if (clientUser) {
        parsed.push(clientUser);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
      }
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

/**
 * Registra un nuevo usuario en la base de datos.
 */
export function registerUser(userData) {
  const users = getStoredUsers();
  const cleanEmail = userData.correo.trim().toLowerCase();

  const existing = users.find((u) => u.correo.toLowerCase() === cleanEmail);
  if (existing) {
    return { success: false, error: "Ya existe un usuario registrado con este correo electrónico." };
  }

  const nextId = Math.max(...users.map((u) => u.id_usuario || 0), 0) + 1;
  const newUser = {
    id_usuario: nextId,
    nombre: userData.nombre.trim(),
    apellido: userData.apellido.trim(),
    correo: userData.correo.trim(),
    telefono: userData.telefono ? userData.telefono.trim() : null,
    id_rol: userData.id_rol ? Number(userData.id_rol) : 4, // Rol 4: Cliente por defecto
    contrasena: userData.contrasena,
    estado: 1, // Activo
    fecha_registro: new Date().toISOString().replace("T", " ").substring(0, 19)
  };

  const updatedUsers = [...users, newUser];
  saveStoredUsers(updatedUsers);
  return { success: true, user: newUser };
}

/**
 * Valida credenciales de inicio de sesión contra la base de datos.
 */
export function loginWithCredentials(email, password) {
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

  // Guardar sesión actual
  setCurrentUser(user);

  return {
    success: true,
    user
  };
}

/**
 * Obtiene el usuario autenticado actualmente.
 */
export function getCurrentUser() {
  try {
    const data = localStorage.getItem(CURRENT_USER_KEY);
    if (data) return JSON.parse(data);
  } catch (err) {
    console.error("Error al obtener el usuario actual:", err);
  }
  return INITIAL_USERS[0]; // Retorna el admin principal si no hay sesión
}

/**
 * Establece el usuario autenticado actualmente.
 */
export function setCurrentUser(user) {
  try {
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
  } catch (err) {
    console.error("Error al guardar usuario actual:", err);
  }
}

/**
 * Cierra la sesión del usuario actual.
 */
export function logoutUser() {
  try {
    localStorage.removeItem(CURRENT_USER_KEY);
  } catch (err) {
    console.error("Error al cerrar sesión:", err);
  }
}

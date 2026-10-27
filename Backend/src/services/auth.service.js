import dns from "dns/promises";
import net from "net";
import { EmailService } from "./email.service.js";
import { PasswordResetRepository } from "../models/passwordReset.model.js";
import { AuthRepository } from "../models/auth.model.js";
import { NotificationsService } from "./notifications.service.js";
import { hashPassword, comparePassword } from "../utils/password.js";
import { signToken } from "../utils/jwt.js";
import { ApiError } from "../errors/apiError.js";
import { ROLES } from "../config/constants.js";

/**
 * Valida de forma estricta si un correo electrónico es una cuenta real de Google a nivel general:
 * 1. Comprueba si el dominio es @gmail.com, @googlemail.com o un dominio corporativo con servidores MX de Google.
 * 2. Consulta en tiempo real a los servidores de correo de Google (gmail-smtp-in.l.google.com).
 *    Si Google responde que la cuenta no existe ('550 NoSuchUser'), se rechaza inmediatamente.
 */
async function validateGlobalGoogleAccount(email) {
  const cleanEmail = (email || "").trim().toLowerCase();
  const domain = cleanEmail.split("@")[1];

  if (!domain) {
    throw ApiError.badRequest("El formato del correo electrónico es inválido.");
  }

  let isGoogle = domain === "gmail.com" || domain === "googlemail.com";
  let targetMx = "gmail-smtp-in.l.google.com";

  if (!isGoogle) {
    try {
      const records = await dns.resolveMx(domain);
      const googleMx = records.find(
        (r) =>
          r.exchange.toLowerCase().includes("google.com") ||
          r.exchange.toLowerCase().includes("googlemail.com")
      );
      if (googleMx) {
        isGoogle = true;
        targetMx = googleMx.exchange;
      }
    } catch (_) {
      isGoogle = false;
    }
  }

  if (!isGoogle) {
    throw ApiError.badRequest(
      "No se ha encontrado tu cuenta de Google. El correo ingresado no pertenece a una cuenta de Google."
    );
  }

  // Comprobar existencia real en servidores de Google vía handshake SMTP
  const existence = await checkGoogleSmtpExistence(cleanEmail, targetMx);
  if (!existence.exists) {
    throw ApiError.notFound(
      "No se ha encontrado tu cuenta de Google. Esta dirección de correo no existe en los servidores de Google."
    );
  }
}

function checkGoogleSmtpExistence(email, host = "gmail-smtp-in.l.google.com") {
  return new Promise((resolve) => {
    const socket = net.createConnection({ host, port: 25 });
    socket.setEncoding("utf8");
    socket.setTimeout(4500);

    let stage = 0;
    let finished = false;

    const done = (res) => {
      if (!finished) {
        finished = true;
        try { socket.write("QUIT\r\n"); } catch (_) {}
        try { socket.end(); } catch (_) {}
        try { socket.destroy(); } catch (_) {}
        resolve(res);
      }
    };

    socket.on("data", (data) => {
      const text = data.toString();
      if (text.includes("220 ") || text.includes("220-")) {
        stage = 1;
        socket.write("EHLO mail.google.com\r\n");
      } else if (stage === 1 && (text.includes("250 ") || text.includes("250-"))) {
        stage = 2;
        socket.write("MAIL FROM:<verify@gmail.com>\r\n");
      } else if (stage === 2 && text.includes("250")) {
        stage = 3;
        socket.write(`RCPT TO:<${email}>\r\n`);
      } else if (stage === 3) {
        if (text.includes("250 2.1.5")) {
          done({ exists: true });
        } else if (
          text.includes("550") ||
          text.includes("NoSuchUser") ||
          text.includes("does not exist")
        ) {
          done({ exists: false, reason: "NOT_FOUND_IN_GOOGLE" });
        } else {
          // Si el servidor de Google aplica greylisting o respuesta no terminal, se acepta
          done({ exists: true });
        }
      }
    });

    socket.on("timeout", () => done({ exists: true, fallback: true }));
    socket.on("error", () => done({ exists: true, fallback: true }));
  });
}

export class AuthService {

  static async getAvailableAccounts() {
    return await AuthRepository.getAllActiveUsers();
  }


  static async verifyGoogleAccount(email) {
    if (!email || typeof email !== "string" || !email.trim()) {
      throw ApiError.badRequest("El correo electrónico de Google es requerido.");
    }

    const cleanEmail = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      throw ApiError.badRequest("El formato del correo electrónico es inválido.");
    }

    // 1. Validar estrictamente que sea una cuenta real existente en Google a nivel global
    await validateGlobalGoogleAccount(cleanEmail);

    // 2. Validar que la cuenta de Google esté registrada en Tu Turno Barber
    const user = await AuthRepository.findByEmail(cleanEmail);
    if (!user) {
      throw ApiError.notFound(
        "Esta cuenta de Google no se encuentra registrada en Tu Turno Barber. Por favor crea una cuenta o regístrate primero.",
        "USER_NOT_REGISTERED"
      );
    }

    if (user.estado === 0) {
      throw ApiError.forbidden("Tu cuenta se encuentra inactiva. Comunícate con el administrador.", "USER_INACTIVE");
    }

    return {
      exists: true,
      email: cleanEmail,
      nombre: user.nombre,
      apellido: user.apellido,
      imagen_url: user.imagen_url || null
    };
  }

  static async googleLogin({ email, name, avatarUrl, contrasena, isExistingDeviceAccount }) {
    if (!email || typeof email !== "string" || !email.trim()) {
      throw ApiError.badRequest("El correo electrónico de Google es requerido.");
    }

    const cleanEmail = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      throw ApiError.badRequest("El formato del correo electrónico es inválido.");
    }

    // 1. Validar estrictamente que sea una cuenta real existente en Google a nivel global
    await validateGlobalGoogleAccount(cleanEmail);

    // 2. Validar que la cuenta de Google esté registrada en Tu Turno Barber
    let user = await AuthRepository.findByEmail(cleanEmail);
    if (!user) {
      throw ApiError.notFound(
        "Esta cuenta de Google no se encuentra registrada en Tu Turno Barber. Por favor crea una cuenta o regístrate primero.",
        "USER_NOT_REGISTERED"
      );
    }

    if (user.estado === 0) {
      throw ApiError.forbidden("Tu cuenta se encuentra inactiva. Comunícate con el administrador.", "USER_INACTIVE");
    }

    // Solo si NO es una cuenta recordada en el dispositivo (o sea, nueva cuenta que se agrega), exigir contraseña
    if (!isExistingDeviceAccount) {
      if (!contrasena || typeof contrasena !== "string" || !contrasena.trim()) {
        throw ApiError.badRequest("Por favor introduce la contraseña de tu cuenta.", "BAD_REQUEST");
      }

      const isMatch = await comparePassword(contrasena, user.contrasena);
      if (!isMatch) {
        throw ApiError.badRequest(
          "Contraseña incorrecta. Introduce la contraseña correcta de tu cuenta para acceder con Google.",
          "INVALID_CREDENTIALS"
        );
      }
    }

    const permisos = await AuthRepository.getUserPermissions(user.id_rol);
    const clientProfile = await AuthRepository.findClientByUserId(user.id_usuario);
    const barberProfile = await AuthRepository.findBarberByUserId(user.id_usuario);

    const id_cliente = clientProfile ? clientProfile.id_cliente : null;
    const id_barbero = barberProfile ? barberProfile.id_barbero : null;

    const tokenPayload = {
      id_usuario: user.id_usuario,
      correo: user.correo,
      id_rol: user.id_rol,
      rol: user.rol,
      nombre: user.nombre,
      apellido: user.apellido,
      documento: user.documento || null,
      permisos
    };

    const token = signToken(tokenPayload);
    const { contrasena: _userPassword, ...safeUser } = user;

    return {
      token,
      user: {
        ...safeUser,
        permisos,
        cliente: clientProfile,
        barbero: barberProfile,
        id_cliente,
        id_barbero
      },
      cliente: clientProfile,
      barbero: barberProfile,
      id_cliente,
      id_barbero,
      isNewUser: false
    };
  }

  static async login(email, password, ipAddress) {
    const user = await AuthRepository.findByEmail(email);

    if (!user) {
      throw ApiError.badRequest("No existe ninguna cuenta registrada con este correo.", "USER_NOT_FOUND");
    }

    if (user.estado === 0) {
      throw ApiError.forbidden("Tu cuenta se encuentra inactiva. Comunícate con el administrador.", "USER_INACTIVE");
    }

    const isMatch = await comparePassword(password, user.contrasena);
    if (!isMatch) {
      throw ApiError.badRequest("Contraseña incorrecta. Por favor verifica e intenta nuevamente.", "INVALID_CREDENTIALS");
    }

    // Obtener permisos asignados al rol
    const permisos = await AuthRepository.getUserPermissions(user.id_rol);

    // Generar token JWT
    const tokenPayload = {
      id_usuario: user.id_usuario,
      correo: user.correo,
      id_rol: user.id_rol,
      rol: user.rol,
      nombre: user.nombre,
      apellido: user.apellido,
      documento: user.documento || null,
      permisos
    };

    const token = signToken(tokenPayload);

    // Omitir contraseña en respuesta
    const { contrasena, ...safeUser } = user;
    const clientProfile = await AuthRepository.findClientByUserId(user.id_usuario);
    const barberProfile = await AuthRepository.findBarberByUserId(user.id_usuario);

    const id_cliente = clientProfile ? clientProfile.id_cliente : null;
    const id_barbero = barberProfile ? barberProfile.id_barbero : null;

    return {
      token,
      user: {
        ...safeUser,
        permisos,
        cliente: clientProfile,
        barbero: barberProfile,
        id_cliente,
        id_barbero
      },
      cliente: clientProfile,
      barbero: barberProfile,
      id_cliente,
      id_barbero
    };
  }

  static async register(userData, ipAddress) {
    const existing = await AuthRepository.findByEmail(userData.correo);
    if (existing) {
      throw ApiError.conflict("Ya existe un usuario registrado con este correo electrónico.", "EMAIL_ALREADY_EXISTS");
    }

    if (userData.documento) {
      const existingDoc = await AuthRepository.findByDocumento(userData.documento);
      if (existingDoc) {
        throw ApiError.conflict("Ya existe un usuario registrado con este documento de identidad.", "DOCUMENT_ALREADY_EXISTS");
      }
    }

    const hashedPassword = await hashPassword(userData.contrasena);
    const userId = await AuthRepository.create({
      ...userData,
      tipo_documento: userData.tipo_documento || "CC",
      documento: userData.documento || null,
      contrasena: hashedPassword,
      id_rol: userData.id_rol || ROLES.CLIENTE // Cliente por defecto
    });

    const user = await AuthRepository.findById(userId);
    const clientProfile = await AuthRepository.findClientByUserId(userId);
    const barberProfile = await AuthRepository.findBarberByUserId(userId);
    const id_cliente = clientProfile ? clientProfile.id_cliente : null;
    const id_barbero = barberProfile ? barberProfile.id_barbero : null;

    const tokenPayload = {
      id_usuario: user.id_usuario,
      correo: user.correo,
      id_rol: user.id_rol,
      rol: user.rol,
      nombre: user.nombre,
      apellido: user.apellido,
      tipo_documento: user.tipo_documento || userData.tipo_documento || "CC",
      documento: user.documento || null,
      permisos: []
    };

    const token = signToken(tokenPayload);

    return {
      token,
      user: {
        ...user,
        cliente: clientProfile,
        barbero: barberProfile,
        id_cliente,
        id_barbero
      },
      cliente: clientProfile,
      barbero: barberProfile,
      id_cliente,
      id_barbero
    };
  }

  static async getProfile(userId) {
    const user = await AuthRepository.findById(userId);
    if (!user) {
      throw ApiError.notFound("Usuario no encontrado", "USER_NOT_FOUND");
    }
    const permisos = await AuthRepository.getUserPermissions(user.id_rol);
    const clientProfile = await AuthRepository.findClientByUserId(userId);
    const barberProfile = await AuthRepository.findBarberByUserId(userId);

    return {
      ...user,
      permisos,
      cliente: clientProfile,
      barbero: barberProfile,
      id_cliente: clientProfile?.id_cliente || null,
      id_barbero: barberProfile?.id_barbero || null
    };
  }

  static async updateProfile(userId, profileData) {
    const user = await AuthRepository.findById(userId);
    if (!user) {
      throw ApiError.notFound("Usuario no encontrado");
    }

    if (profileData.documento && profileData.documento !== user.documento) {
      const existingDoc = await AuthRepository.findByDocumento(profileData.documento);
      if (existingDoc && existingDoc.id_usuario !== Number(userId)) {
        throw ApiError.conflict("Ya existe un usuario registrado con este documento de identidad.", "DOCUMENT_ALREADY_EXISTS");
      }
    }

    await AuthRepository.updateProfile(userId, profileData);
    return await AuthService.getProfile(userId);
  }

  static async changePassword(userId, currentPassword, newPassword) {
    const user = await AuthRepository.findById(userId);
    if (!user) {
      throw ApiError.notFound("Usuario no encontrado");
    }

    // Re-leer usuario con contraseña para validar
    const fullUser = await AuthRepository.findByEmail(user.correo);
    const isMatch = await comparePassword(currentPassword, fullUser.contrasena);
    if (!isMatch) {
      throw ApiError.badRequest("La contraseña actual proporcionada es incorrecta.");
    }

    const newHash = await hashPassword(newPassword);
    await AuthRepository.updatePassword(userId, newHash);
    return true;
  }

  static async forgotPassword(correo) {
    const user = await AuthRepository.findByEmail(correo);
    if (!user) {
      throw ApiError.notFound("No existe ninguna cuenta registrada con este correo electrónico.");
    }

    if (user.estado === 0) {
      throw ApiError.forbidden("La cuenta asociada a este correo se encuentra inactiva. Comunícate con el administrador.");
    }

    // Generar código numérico de 6 dígitos
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // Guardar en el repositorio con 15 minutos de expiración
    await PasswordResetRepository.saveCode(user.correo, code, 15);

    // Enviar correo electrónico con Nodemailer
    const emailResult = await EmailService.sendPasswordResetCode({
      to: user.correo,
      name: user.nombre,
      code,
      expiresMinutes: 15
    });

    // Despacho de notificación interna
    try {
      NotificationsService.createCustomNotification({
        type: "auth",
        title: "Código de recuperación enviado",
        description: `Hemos enviado un código de verificación a ${user.correo}. Válido por 15 minutos.`,
        id_usuario: user.id_usuario,
        route: "/login"
      });
    } catch (err) {
      console.warn("[AuthService] Error creando notificación de recuperación:", err.message);
    }

    return {
      correo: user.correo,
      enviado: true,
      mensaje: "Se ha enviado un código de verificación a tu correo electrónico.",
      expira_en_minutos: 15,
      preview_url: emailResult.previewUrl || null,
      codigo_demo: process.env.NODE_ENV !== "production" ? code : undefined
    };
  }

  static async resetPassword(correo, codigo, nuevaContrasena) {
    const user = await AuthRepository.findByEmail(correo);
    if (!user) {
      throw ApiError.notFound("No existe ninguna cuenta registrada con este correo electrónico.");
    }

    if (user.estado === 0) {
      throw ApiError.forbidden("Tu cuenta se encuentra inactiva. Comunícate con el administrador.");
    }

    // Validar código contra el repositorio
    const verification = await PasswordResetRepository.verifyCode(correo, codigo);
    if (!verification.valid) {
      throw ApiError.badRequest(verification.message || "Código de verificación inválido o expirado.");
    }

    // Actualizar contraseña
    const newHash = await hashPassword(nuevaContrasena);
    await AuthRepository.updatePassword(user.id_usuario, newHash);

    // Enviar correo de confirmación
    EmailService.sendPasswordChangedNotification({
      to: user.correo,
      name: user.nombre
    }).catch(() => { });

    try {
      NotificationsService.createCustomNotification({
        type: "auth",
        title: "Contraseña actualizada",
        description: "Tu contraseña ha sido restablecida correctamente. Ya puedes iniciar sesión.",
        id_usuario: user.id_usuario,
        route: "/login"
      });
    } catch (err) {
      console.warn("[AuthService] Error creando notificación de reset:", err.message);
    }

    return {
      correo: user.correo,
      restablecido: true,
      mensaje: "Contraseña restablecida exitosamente."
    };
  }

  static async logout(userId, ipAddress) {
    return true;
  }
}

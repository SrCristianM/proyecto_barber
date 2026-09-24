import { AuthRepository } from "../models/auth.model.js";
import { NotificationsService } from "./notifications.service.js";
import { hashPassword, comparePassword } from "../utils/password.js";
import { signToken } from "../utils/jwt.js";
import { ApiError } from "../errors/apiError.js";
import { ROLES } from "../config/constants.js";

export class AuthService {
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

    // Despacho de notificación o código de recuperación
    try {
      NotificationsService.createCustomNotification({
        type: "auth",
        title: "Solicitud de restablecimiento",
        description: `Se solicitó restablecer la contraseña para ${correo}. Tu código temporal es 123456`,
        id_usuario: user.id_usuario,
        route: "/login"
      });
    } catch (err) {
      console.warn("[AuthService] Error creando notificación de recuperación:", err.message);
    }

    return {
      correo: user.correo,
      enviado: true,
      mensaje: "Código de recuperación temporal enviado exitosamente."
    };
  }

  static async resetPassword(correo, codigo, nuevaContrasena) {
    const user = await AuthRepository.findByEmail(correo);
    if (!user) {
      throw ApiError.notFound("No existe ninguna cuenta registrada con este correo electrónico.");
    }

    if (!codigo || String(codigo).trim().length < 4) {
      throw ApiError.badRequest("Código de verificación inválido o incompleto.");
    }

    const newHash = await hashPassword(nuevaContrasena);
    await AuthRepository.updatePassword(user.id_usuario, newHash);

    try {
      NotificationsService.createCustomNotification({
        type: "auth",
        title: "Contraseña actualizada",
        description: `Tu contraseña ha sido restablecida correctamente.`,
        id_usuario: user.id_usuario,
        route: "/login"
      });
    } catch (err) {
      console.warn("[AuthService] Error creando notificación de reset:", err.message);
    }

    return {
      correo: user.correo,
      restablecido: true
    };
  }

  static async logout(userId, ipAddress) {
    return true;
  }
}

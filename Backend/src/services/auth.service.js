import { AuthRepository } from "../models/auth.model.js";
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
      permisos
    };

    const token = signToken(tokenPayload);

    // Registrar en bitácora
    await AuthRepository.logAccess(user.id_usuario, "Inicio de sesión", ipAddress);

    // Omitir contraseña en respuesta
    const { contrasena, ...safeUser } = user;
    const clientProfile = await AuthRepository.findClientByUserId(user.id_usuario);

    return {
      token,
      user: {
        ...safeUser,
        permisos,
        cliente: clientProfile
      },
      cliente: clientProfile
    };
  }

  static async register(userData, ipAddress) {
    const existing = await AuthRepository.findByEmail(userData.correo);
    if (existing) {
      throw ApiError.conflict("Ya existe un usuario registrado con este correo electrónico.", "EMAIL_ALREADY_EXISTS");
    }

    const hashedPassword = await hashPassword(userData.contrasena);
    const userId = await AuthRepository.create({
      ...userData,
      contrasena: hashedPassword,
      id_rol: userData.id_rol || ROLES.CLIENTE // Cliente por defecto
    });

    const user = await AuthRepository.findById(userId);
    const clientProfile = await AuthRepository.findClientByUserId(userId);
    const tokenPayload = {
      id_usuario: user.id_usuario,
      correo: user.correo,
      id_rol: user.id_rol,
      rol: user.rol,
      nombre: user.nombre,
      apellido: user.apellido,
      permisos: []
    };

    const token = signToken(tokenPayload);
    await AuthRepository.logAccess(userId, "Registro de usuario", ipAddress);

    return {
      token,
      user: {
        ...user,
        cliente: clientProfile
      },
      cliente: clientProfile
    };
  }

  static async getProfile(userId) {
    const user = await AuthRepository.findById(userId);
    if (!user) {
      throw ApiError.notFound("Usuario no encontrado", "USER_NOT_FOUND");
    }
    const permisos = await AuthRepository.getUserPermissions(user.id_rol);
    return { ...user, permisos };
  }

  static async updateProfile(userId, profileData) {
    const user = await AuthRepository.findById(userId);
    if (!user) {
      throw ApiError.notFound("Usuario no encontrado");
    }
    await AuthRepository.updateProfile(userId, profileData);
    return await AuthRepository.findById(userId);
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

  static async logout(userId, ipAddress) {
    if (userId) {
      await AuthRepository.logAccess(userId, "Cierre de sesión", ipAddress);
    }
    return true;
  }
}

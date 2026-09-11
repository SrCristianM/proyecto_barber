import { AuthService } from "../services/auth.service.js";
import { ApiResponse } from "../utils/apiResponse.js";

export class AuthController {
  static async login(req, res, next) {
    try {
      const { correo, contrasena } = req.body;
      const ip = req.ip || req.connection.remoteAddress;
      const result = await AuthService.login(correo, contrasena, ip);
      return ApiResponse.success(res, result, "Inicio de sesión exitoso");
    } catch (error) {
      next(error);
    }
  }

  static async register(req, res, next) {
    try {
      const ip = req.ip || req.connection.remoteAddress;
      const result = await AuthService.register(req.body, ip);
      return ApiResponse.created(res, result, "Cuenta creada exitosamente");
    } catch (error) {
      next(error);
    }
  }

  static async getProfile(req, res, next) {
    try {
      const user = await AuthService.getProfile(req.user.id_usuario);
      return ApiResponse.success(res, user, "Perfil de usuario obtenido");
    } catch (error) {
      next(error);
    }
  }

  static async updateProfile(req, res, next) {
    try {
      const user = await AuthService.updateProfile(req.user.id_usuario, req.body);
      return ApiResponse.success(res, user, "Perfil actualizado exitosamente");
    } catch (error) {
      next(error);
    }
  }

  static async changePassword(req, res, next) {
    try {
      const { actualContrasena, nuevaContrasena } = req.body;
      await AuthService.changePassword(req.user.id_usuario, actualContrasena, nuevaContrasena);
      return ApiResponse.success(res, null, "Contraseña actualizada correctamente");
    } catch (error) {
      next(error);
    }
  }

  static async logout(req, res, next) {
    try {
      const ip = req.ip || req.connection.remoteAddress;
      const userId = req.user ? req.user.id_usuario : null;
      await AuthService.logout(userId, ip);
      return ApiResponse.success(res, null, "Sesión cerrada exitosamente");
    } catch (error) {
      next(error);
    }
  }
}

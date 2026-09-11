import { UsersService } from "../services/users.service.js";
import { ApiResponse } from "../utils/apiResponse.js";

export class UsersController {
  static async getAll(req, res, next) {
    try {
      const filters = {
        search: req.query.search,
        status: req.query.status || "all",
        role: req.query.role || "all",
        sortField: req.query.sortField || "nombre",
        sortDir: req.query.sortDir || "asc"
      };
      const users = await UsersService.getAllUsers(filters);
      return ApiResponse.success(res, users, "Usuarios obtenidos exitosamente");
    } catch (error) {
      next(error);
    }
  }

  static async getById(req, res, next) {
    try {
      const user = await UsersService.getUserById(req.params.id);
      return ApiResponse.success(res, user, "Usuario obtenido exitosamente");
    } catch (error) {
      next(error);
    }
  }

  static async create(req, res, next) {
    try {
      const newUser = await UsersService.createUser(req.body);
      return ApiResponse.created(res, newUser, "Usuario creado exitosamente");
    } catch (error) {
      next(error);
    }
  }

  static async update(req, res, next) {
    try {
      const updatedUser = await UsersService.updateUser(req.params.id, req.body);
      return ApiResponse.success(res, updatedUser, "Usuario actualizado exitosamente");
    } catch (error) {
      next(error);
    }
  }

  static async toggleStatus(req, res, next) {
    try {
      const result = await UsersService.toggleStatus(req.params.id, req.body.estado);
      return ApiResponse.success(res, result, "Estado del usuario modificado");
    } catch (error) {
      next(error);
    }
  }

  static async delete(req, res, next) {
    try {
      await UsersService.deleteUser(req.params.id);
      return ApiResponse.success(res, null, "Usuario eliminado exitosamente");
    } catch (error) {
      next(error);
    }
  }
}

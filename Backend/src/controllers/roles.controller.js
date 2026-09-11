import { RolesService } from "../services/roles.service.js";
import { ApiResponse } from "../utils/apiResponse.js";

export class RolesController {
  static async getAll(req, res, next) {
    try {
      const roles = await RolesService.getAllRoles();
      return ApiResponse.success(res, roles, "Roles obtenidos exitosamente");
    } catch (error) {
      next(error);
    }
  }

  static async getById(req, res, next) {
    try {
      const role = await RolesService.getRoleById(req.params.id);
      return ApiResponse.success(res, role, "Rol obtenido exitosamente");
    } catch (error) {
      next(error);
    }
  }

  static async create(req, res, next) {
    try {
      const newRole = await RolesService.createRole(req.body);
      return ApiResponse.created(res, newRole, "Rol creado exitosamente");
    } catch (error) {
      next(error);
    }
  }

  static async update(req, res, next) {
    try {
      const updatedRole = await RolesService.updateRole(req.params.id, req.body);
      return ApiResponse.success(res, updatedRole, "Rol actualizado exitosamente");
    } catch (error) {
      next(error);
    }
  }

  static async toggleStatus(req, res, next) {
    try {
      const result = await RolesService.toggleRoleStatus(req.params.id);
      return ApiResponse.success(res, result, "Estado del rol modificado");
    } catch (error) {
      next(error);
    }
  }

  static async getModules(req, res, next) {
    try {
      const modules = await RolesService.getSystemModules();
      return ApiResponse.success(res, modules, "Módulos y permisos del sistema obtenidos");
    } catch (error) {
      next(error);
    }
  }
}

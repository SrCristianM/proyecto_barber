import { RolesRepository } from "../models/roles.model.js";
import { ApiError } from "../errors/apiError.js";

export class RolesService {
  static async getAllRoles() {
    return await RolesRepository.findAll();
  }

  static async getRoleById(id) {
    const role = await RolesRepository.findById(id);
    if (!role) {
      throw ApiError.notFound("Rol no encontrado");
    }
    return role;
  }

  static async createRole(roleData) {
    const newId = await RolesRepository.create(roleData);
    return await RolesRepository.findById(newId);
  }

  static async updateRole(id, roleData) {
    const role = await RolesRepository.findById(id);
    if (!role) {
      throw ApiError.notFound("Rol no encontrado");
    }
    await RolesRepository.update(id, roleData);
    return await RolesRepository.findById(id);
  }

  static async toggleRoleStatus(id) {
    const role = await RolesRepository.findById(id);
    if (!role) {
      throw ApiError.notFound("Rol no encontrado");
    }
    const newStatus = await RolesRepository.toggleStatus(id);
    return { id_rol: Number(id), estado: newStatus };
  }

  static async deleteRole(id) {
    const role = await RolesRepository.findById(id);
    if (!role) {
      throw ApiError.notFound("Rol no encontrado");
    }
    if ([1, 2, 3, 4].includes(Number(id))) {
      throw ApiError.badRequest("No se pueden eliminar los roles base del sistema.");
    }
    await RolesRepository.delete(id);
    return true;
  }

  static async getSystemModules() {
    return await RolesRepository.getSystemModules();
  }
}

import { UsersRepository } from "../models/users.model.js";
import { hashPassword } from "../utils/password.js";
import { ApiError } from "../errors/apiError.js";

export class UsersService {
  static async getAllUsers(filters) {
    return await UsersRepository.findAll(filters);
  }

  static async getUserById(id) {
    const user = await UsersRepository.findById(id);
    if (!user) {
      throw ApiError.notFound("Usuario no encontrado");
    }
    return user;
  }

  static async createUser(userData) {
    const existing = await UsersRepository.findByEmail(userData.correo);
    if (existing) {
      throw ApiError.conflict("Ya existe un usuario con este correo electrónico.");
    }

    const defaultPassword = userData.contrasena || "Barber123*";
    const hashedPassword = await hashPassword(defaultPassword);

    const newId = await UsersRepository.create({
      ...userData,
      contrasena: hashedPassword
    });

    return await UsersRepository.findById(newId);
  }

  static async updateUser(id, userData) {
    const user = await UsersRepository.findById(id);
    if (!user) {
      throw ApiError.notFound("Usuario no encontrado");
    }

    if (userData.correo && userData.correo.toLowerCase() !== user.correo.toLowerCase()) {
      const existing = await UsersRepository.findByEmail(userData.correo);
      if (existing) {
        throw ApiError.conflict("El correo electrónico ya está en uso por otro usuario.");
      }
    }

    const dataToUpdate = { ...userData };
    if (userData.contrasena) {
      dataToUpdate.contrasena = await hashPassword(userData.contrasena);
    }

    await UsersRepository.update(id, dataToUpdate);
    return await UsersRepository.findById(id);
  }

  static async toggleStatus(id, explicitStatus) {
    const user = await UsersRepository.findById(id);
    if (!user) {
      throw ApiError.notFound("Usuario no encontrado");
    }
    const newStatus = await UsersRepository.toggleStatus(id, explicitStatus);
    return { id_usuario: Number(id), estado: newStatus };
  }

  static async deleteUser(id) {
    const user = await UsersRepository.findById(id);
    if (!user) {
      throw ApiError.notFound("Usuario no encontrado");
    }
    await UsersRepository.delete(id);
    return true;
  }
}

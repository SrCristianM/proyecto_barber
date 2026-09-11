import { BarbersRepository } from "../models/barbers.model.js";
import { UsersRepository } from "../models/users.model.js";
import { hashPassword } from "../utils/password.js";
import { ApiError } from "../errors/apiError.js";

export class BarbersService {
  static async getAllBarbers(filters) {
    return await BarbersRepository.findAll(filters);
  }

  static async getBarberById(id) {
    const barber = await BarbersRepository.findById(id);
    if (!barber) {
      throw ApiError.notFound("Barbero no encontrado");
    }
    return barber;
  }

  static async createBarber(barberData) {
    const existing = await UsersRepository.findByEmail(barberData.correo);
    if (existing) {
      throw ApiError.conflict("Ya existe un usuario con este correo electrónico.");
    }

    const defaultPass = barberData.contrasena || "Barbero123*";
    const hashedPassword = await hashPassword(defaultPass);

    const newBarberId = await BarbersRepository.create(barberData, hashedPassword);
    return await BarbersRepository.findById(newBarberId);
  }

  static async updateBarber(id, barberData) {
    const barber = await BarbersRepository.findById(id);
    if (!barber) {
      throw ApiError.notFound("Barbero no encontrado");
    }

    if (barberData.correo && barberData.correo.toLowerCase() !== barber.correo.toLowerCase()) {
      const existing = await UsersRepository.findByEmail(barberData.correo);
      if (existing) {
        throw ApiError.conflict("El correo electrónico ya se encuentra registrado por otro usuario.");
      }
    }

    await BarbersRepository.update(id, barberData);
    return await BarbersRepository.findById(id);
  }

  static async toggleBarberStatus(id) {
    const barber = await BarbersRepository.findById(id);
    if (!barber) {
      throw ApiError.notFound("Barbero no encontrado");
    }
    const newStatus = await BarbersRepository.toggleStatus(id);
    return { id_barbero: Number(id), estado: newStatus };
  }
}

import { ClientsRepository } from "../models/clients.model.js";
import { UsersRepository } from "../models/users.model.js";
import { hashPassword } from "../utils/password.js";
import { ApiError } from "../errors/apiError.js";

export class ClientsService {
  static async getAllClients(filters) {
    return await ClientsRepository.findAll(filters);
  }

  static async getClientById(id) {
    const client = await ClientsRepository.findById(id);
    if (!client) {
      throw ApiError.notFound("Cliente no encontrado");
    }
    return client;
  }

  static async getClientByUserId(userId) {
    const client = await ClientsRepository.findByUserId(userId);
    if (!client) {
      throw ApiError.notFound("Cliente no asociado a este usuario");
    }
    return client;
  }

  static async createClient(clientData) {
    const existing = await UsersRepository.findByEmail(clientData.correo);
    if (existing) {
      throw ApiError.conflict("Ya existe un usuario con este correo electrónico.");
    }

    const defaultPass = clientData.contrasena || "Cliente123*";
    const hashedPassword = await hashPassword(defaultPass);

    const newClientId = await ClientsRepository.create(clientData, hashedPassword);
    return await ClientsRepository.findById(newClientId);
  }

  static async updateClient(id, clientData) {
    const client = await ClientsRepository.findById(id);
    if (!client) {
      throw ApiError.notFound("Cliente no encontrado");
    }

    if (clientData.correo && clientData.correo.toLowerCase() !== client.correo.toLowerCase()) {
      const existing = await UsersRepository.findByEmail(clientData.correo);
      if (existing) {
        throw ApiError.conflict("El correo electrónico ya se encuentra registrado por otro usuario.");
      }
    }

    await ClientsRepository.update(id, clientData);
    return await ClientsRepository.findById(id);
  }

  static async toggleClientStatus(id) {
    const client = await ClientsRepository.findById(id);
    if (!client) {
      throw ApiError.notFound("Cliente no encontrado");
    }
    const newStatus = await ClientsRepository.toggleStatus(id);
    return { id_cliente: Number(id), estado: newStatus };
  }
}

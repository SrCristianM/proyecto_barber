import { ClientsService } from "../services/clients.service.js";
import { ApiResponse } from "../utils/apiResponse.js";

export class ClientsController {
  static async getAll(req, res, next) {
    try {
      const filters = {
        search: req.query.search,
        status: req.query.status || "all",
        fidelity: req.query.fidelity || "all"
      };
      const clients = await ClientsService.getAllClients(filters);
      return ApiResponse.success(res, clients, "Clientes obtenidos exitosamente");
    } catch (error) {
      next(error);
    }
  }

  static async getById(req, res, next) {
    try {
      const client = await ClientsService.getClientById(req.params.id);
      return ApiResponse.success(res, client, "Cliente obtenido exitosamente");
    } catch (error) {
      next(error);
    }
  }

  static async getMyClientProfile(req, res, next) {
    try {
      const client = await ClientsService.getClientByUserId(req.user.id_usuario);
      return ApiResponse.success(res, client, "Perfil de cliente obtenido");
    } catch (error) {
      next(error);
    }
  }

  static async create(req, res, next) {
    try {
      const newClient = await ClientsService.createClient(req.body);
      return ApiResponse.created(res, newClient, "Cliente creado exitosamente");
    } catch (error) {
      next(error);
    }
  }

  static async update(req, res, next) {
    try {
      const updatedClient = await ClientsService.updateClient(req.params.id, req.body);
      return ApiResponse.success(res, updatedClient, "Cliente actualizado exitosamente");
    } catch (error) {
      next(error);
    }
  }

  static async toggleStatus(req, res, next) {
    try {
      const result = await ClientsService.toggleClientStatus(req.params.id);
      return ApiResponse.success(res, result, "Estado del cliente modificado");
    } catch (error) {
      next(error);
    }
  }

  static async delete(req, res, next) {
    try {
      await ClientsService.deleteClient(req.params.id);
      return ApiResponse.success(res, null, "Cliente eliminado exitosamente");
    } catch (error) {
      next(error);
    }
  }
}

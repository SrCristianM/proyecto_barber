import { ServicesRepository } from "../models/services.model.js";
import { ApiError } from "../errors/apiError.js";

export class ServicesService {
  static async getAllServices(filters) {
    return await ServicesRepository.findAll(filters);
  }

  static async getServiceById(id) {
    const service = await ServicesRepository.findById(id);
    if (!service) {
      throw ApiError.notFound("Servicio no encontrado");
    }
    return service;
  }

  static async createService(serviceData) {
    const newId = await ServicesRepository.create(serviceData);
    return await ServicesRepository.findById(newId);
  }

  static async updateService(id, serviceData) {
    const service = await ServicesRepository.findById(id);
    if (!service) {
      throw ApiError.notFound("Servicio no encontrado");
    }
    await ServicesRepository.update(id, serviceData);
    return await ServicesRepository.findById(id);
  }

  static async toggleServiceStatus(id) {
    const service = await ServicesRepository.findById(id);
    if (!service) {
      throw ApiError.notFound("Servicio no encontrado");
    }
    const newStatus = await ServicesRepository.toggleStatus(id);
    return { id_servicio: Number(id), estado: newStatus };
  }

  static async getAllCategories() {
    return await ServicesRepository.findAllCategories();
  }

  static async createCategory(nombre) {
    const newId = await ServicesRepository.createCategory(nombre);
    return { id_categoria_servicio: newId, nombre, estado: 1 };
  }
}

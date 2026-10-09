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

  static async deleteService(id) {
    const service = await ServicesRepository.findById(id);
    if (!service) {
      throw ApiError.notFound("Servicio no encontrado");
    }
    await ServicesRepository.delete(id);
    return true;
  }

  static async getAllCategories(filters = {}) {
    return await ServicesRepository.findAllCategories(filters);
  }

  static async createCategory(nombre) {
    const newId = await ServicesRepository.createCategory(nombre);
    return { id_categoria_servicio: newId, nombre, estado: 1 };
  }

  static async updateCategory(id, nombre) {
    await ServicesRepository.updateCategory(id, nombre);
    return { id_categoria_servicio: Number(id), nombre };
  }

  static async toggleCategoryStatus(id) {
    const newStatus = await ServicesRepository.toggleCategoryStatus(id);
    return { id_categoria_servicio: Number(id), estado: newStatus };
  }

  static async deleteCategory(id) {
    const services = await ServicesRepository.findAll({ category: id });
    if (services && services.length > 0) {
      throw ApiError.badRequest("No se puede eliminar la categoría porque tiene servicios asociados.");
    }
    await ServicesRepository.deleteCategory(id);
    return true;
  }
}

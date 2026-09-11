import { PackagesRepository } from "../models/packages.model.js";
import { ApiError } from "../errors/apiError.js";

export class PackagesService {
  static async getAllPackages(filters) {
    return await PackagesRepository.findAll(filters);
  }

  static async getPackageById(id) {
    const pkg = await PackagesRepository.findById(id);
    if (!pkg) {
      throw ApiError.notFound("Paquete no encontrado");
    }
    return pkg;
  }

  static async createPackage(packageData) {
    const newId = await PackagesRepository.create(packageData);
    return await PackagesRepository.findById(newId);
  }

  static async updatePackage(id, packageData) {
    const pkg = await PackagesRepository.findById(id);
    if (!pkg) {
      throw ApiError.notFound("Paquete no encontrado");
    }
    await PackagesRepository.update(id, packageData);
    return await PackagesRepository.findById(id);
  }

  static async togglePackageStatus(id) {
    const pkg = await PackagesRepository.findById(id);
    if (!pkg) {
      throw ApiError.notFound("Paquete no encontrado");
    }
    const newStatus = await PackagesRepository.toggleStatus(id);
    return { id_paquete: Number(id), estado: newStatus };
  }
}

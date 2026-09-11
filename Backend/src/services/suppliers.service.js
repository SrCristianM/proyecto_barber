import { SuppliersRepository } from "../models/suppliers.model.js";
import { ApiError } from "../errors/apiError.js";

export class SuppliersService {
  static async getAllSuppliers(filters) {
    return await SuppliersRepository.findAll(filters);
  }

  static async getSupplierById(id) {
    const supplier = await SuppliersRepository.findById(id);
    if (!supplier) {
      throw ApiError.notFound("Proveedor no encontrado");
    }
    return supplier;
  }

  static async createSupplier(supplierData) {
    if (supplierData.nit) {
      const existing = await SuppliersRepository.findByNit(supplierData.nit);
      if (existing) {
        throw ApiError.conflict("Ya existe un proveedor registrado con este NIT.");
      }
    }

    const newId = await SuppliersRepository.create(supplierData);
    return await SuppliersRepository.findById(newId);
  }

  static async updateSupplier(id, supplierData) {
    const supplier = await SuppliersRepository.findById(id);
    if (!supplier) {
      throw ApiError.notFound("Proveedor no encontrado");
    }

    if (supplierData.nit && supplierData.nit !== supplier.nit) {
      const existing = await SuppliersRepository.findByNit(supplierData.nit);
      if (existing) {
        throw ApiError.conflict("El NIT ingresado ya pertenece a otro proveedor registrado.");
      }
    }

    await SuppliersRepository.update(id, supplierData);
    return await SuppliersRepository.findById(id);
  }

  static async toggleSupplierStatus(id) {
    const supplier = await SuppliersRepository.findById(id);
    if (!supplier) {
      throw ApiError.notFound("Proveedor no encontrado");
    }
    const newStatus = await SuppliersRepository.toggleStatus(id);
    return { id_proveedor: Number(id), estado: newStatus };
  }
}

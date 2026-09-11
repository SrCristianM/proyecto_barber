import { SuppliersService } from "../services/suppliers.service.js";
import { ApiResponse } from "../utils/apiResponse.js";

export class SuppliersController {
  static async getAll(req, res, next) {
    try {
      const filters = {
        search: req.query.search,
        status: req.query.status || "all"
      };
      const suppliers = await SuppliersService.getAllSuppliers(filters);
      return ApiResponse.success(res, suppliers, "Proveedores obtenidos exitosamente");
    } catch (error) {
      next(error);
    }
  }

  static async getById(req, res, next) {
    try {
      const supplier = await SuppliersService.getSupplierById(req.params.id);
      return ApiResponse.success(res, supplier, "Proveedor obtenido exitosamente");
    } catch (error) {
      next(error);
    }
  }

  static async create(req, res, next) {
    try {
      const newSupplier = await SuppliersService.createSupplier(req.body);
      return ApiResponse.created(res, newSupplier, "Proveedor registrado exitosamente");
    } catch (error) {
      next(error);
    }
  }

  static async update(req, res, next) {
    try {
      const updated = await SuppliersService.updateSupplier(req.params.id, req.body);
      return ApiResponse.success(res, updated, "Proveedor actualizado exitosamente");
    } catch (error) {
      next(error);
    }
  }

  static async toggleStatus(req, res, next) {
    try {
      const result = await SuppliersService.toggleSupplierStatus(req.params.id);
      return ApiResponse.success(res, result, "Estado del proveedor modificado");
    } catch (error) {
      next(error);
    }
  }
}

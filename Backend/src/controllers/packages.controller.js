import { PackagesService } from "../services/packages.service.js";
import { ApiResponse } from "../utils/apiResponse.js";

export class PackagesController {
  static async getAll(req, res, next) {
    try {
      const filters = {
        status: req.query.status || "all"
      };
      const packages = await PackagesService.getAllPackages(filters);
      return ApiResponse.success(res, packages, "Paquetes obtenidos exitosamente");
    } catch (error) {
      next(error);
    }
  }

  static async getById(req, res, next) {
    try {
      const pkg = await PackagesService.getPackageById(req.params.id);
      return ApiResponse.success(res, pkg, "Paquete obtenido exitosamente");
    } catch (error) {
      next(error);
    }
  }

  static async create(req, res, next) {
    try {
      const newPkg = await PackagesService.createPackage(req.body);
      return ApiResponse.created(res, newPkg, "Paquete creado exitosamente");
    } catch (error) {
      next(error);
    }
  }

  static async update(req, res, next) {
    try {
      const updated = await PackagesService.updatePackage(req.params.id, req.body);
      return ApiResponse.success(res, updated, "Paquete actualizado exitosamente");
    } catch (error) {
      next(error);
    }
  }

  static async toggleStatus(req, res, next) {
    try {
      const result = await PackagesService.togglePackageStatus(req.params.id);
      return ApiResponse.success(res, result, "Estado del paquete modificado");
    } catch (error) {
      next(error);
    }
  }

  static async delete(req, res, next) {
    try {
      await PackagesService.deletePackage(req.params.id);
      return ApiResponse.success(res, null, "Paquete eliminado exitosamente");
    } catch (error) {
      next(error);
    }
  }
}

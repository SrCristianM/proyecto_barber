import { ServicesService } from "../services/services.service.js";
import { ApiResponse } from "../utils/apiResponse.js";

export class ServicesController {
  static async getAll(req, res, next) {
    try {
      const filters = {
        search: req.query.search,
        status: req.query.status || "all",
        category: req.query.category || "all"
      };
      const services = await ServicesService.getAllServices(filters);
      return ApiResponse.success(res, services, "Servicios obtenidos exitosamente");
    } catch (error) {
      next(error);
    }
  }

  static async getById(req, res, next) {
    try {
      const service = await ServicesService.getServiceById(req.params.id);
      return ApiResponse.success(res, service, "Servicio obtenido exitosamente");
    } catch (error) {
      next(error);
    }
  }

  static async create(req, res, next) {
    try {
      const newService = await ServicesService.createService(req.body);
      return ApiResponse.created(res, newService, "Servicio creado exitosamente");
    } catch (error) {
      next(error);
    }
  }

  static async update(req, res, next) {
    try {
      const updated = await ServicesService.updateService(req.params.id, req.body);
      return ApiResponse.success(res, updated, "Servicio actualizado exitosamente");
    } catch (error) {
      next(error);
    }
  }

  static async toggleStatus(req, res, next) {
    try {
      const result = await ServicesService.toggleServiceStatus(req.params.id);
      return ApiResponse.success(res, result, "Estado del servicio modificado");
    } catch (error) {
      next(error);
    }
  }

  static async delete(req, res, next) {
    try {
      await ServicesService.deleteService(req.params.id);
      return ApiResponse.success(res, null, "Servicio eliminado exitosamente");
    } catch (error) {
      next(error);
    }
  }

  static async getCategories(req, res, next) {
    try {
      const categories = await ServicesService.getAllCategories();
      return ApiResponse.success(res, categories, "Categorías de servicio obtenidas");
    } catch (error) {
      next(error);
    }
  }

  static async createCategory(req, res, next) {
    try {
      const newCat = await ServicesService.createCategory(req.body.nombre);
      return ApiResponse.created(res, newCat, "Categoría creada exitosamente");
    } catch (error) {
      next(error);
    }
  }
}

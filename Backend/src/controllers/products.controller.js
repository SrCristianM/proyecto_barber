import { ProductsService } from "../services/products.service.js";
import { ApiResponse } from "../utils/apiResponse.js";

export class ProductsController {
  static async getAll(req, res, next) {
    try {
      const filters = {
        search: req.query.search,
        status: req.query.status || "all",
        category: req.query.category || "all",
        lowStock: req.query.lowStock === "true"
      };
      const products = await ProductsService.getAllProducts(filters);
      return ApiResponse.success(res, products, "Productos obtenidos exitosamente");
    } catch (error) {
      next(error);
    }
  }

  static async getById(req, res, next) {
    try {
      const product = await ProductsService.getProductById(req.params.id);
      return ApiResponse.success(res, product, "Producto obtenido exitosamente");
    } catch (error) {
      next(error);
    }
  }

  static async create(req, res, next) {
    try {
      const newProduct = await ProductsService.createProduct(req.body);
      return ApiResponse.created(res, newProduct, "Producto creado exitosamente");
    } catch (error) {
      next(error);
    }
  }

  static async update(req, res, next) {
    try {
      const updated = await ProductsService.updateProduct(req.params.id, req.body);
      return ApiResponse.success(res, updated, "Producto actualizado exitosamente");
    } catch (error) {
      next(error);
    }
  }

  static async toggleStatus(req, res, next) {
    try {
      const result = await ProductsService.toggleProductStatus(req.params.id);
      return ApiResponse.success(res, result, "Estado del producto modificado");
    } catch (error) {
      next(error);
    }
  }

  static async getCategories(req, res, next) {
    try {
      const categories = await ProductsService.getAllCategories();
      return ApiResponse.success(res, categories, "Categorías de producto obtenidas");
    } catch (error) {
      next(error);
    }
  }

  static async createCategory(req, res, next) {
    try {
      const newCat = await ProductsService.createCategory(req.body.nombre);
      return ApiResponse.created(res, newCat, "Categoría creada exitosamente");
    } catch (error) {
      next(error);
    }
  }
}

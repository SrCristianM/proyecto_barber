import { ProductsRepository } from "../models/products.model.js";
import { ApiError } from "../errors/apiError.js";

export class ProductsService {
  static async getAllProducts(filters) {
    return await ProductsRepository.findAll(filters);
  }

  static async getProductById(id) {
    const product = await ProductsRepository.findById(id);
    if (!product) {
      throw ApiError.notFound("Producto no encontrado");
    }
    return product;
  }

  static async createProduct(productData) {
    const newId = await ProductsRepository.create(productData);
    return await ProductsRepository.findById(newId);
  }

  static async updateProduct(id, productData) {
    const product = await ProductsRepository.findById(id);
    if (!product) {
      throw ApiError.notFound("Producto no encontrado");
    }
    await ProductsRepository.update(id, productData);
    return await ProductsRepository.findById(id);
  }

  static async toggleProductStatus(id) {
    const product = await ProductsRepository.findById(id);
    if (!product) {
      throw ApiError.notFound("Producto no encontrado");
    }
    const newStatus = await ProductsRepository.toggleStatus(id);
    return { id_producto: Number(id), estado: newStatus };
  }

  static async deleteProduct(id) {
    const product = await ProductsRepository.findById(id);
    if (!product) {
      throw ApiError.notFound("Producto no encontrado");
    }
    await ProductsRepository.delete(id);
    return true;
  }

  static async getAllCategories() {
    return await ProductsRepository.findAllCategories();
  }

  static async createCategory(nombre) {
    const newId = await ProductsRepository.createCategory(nombre);
    return { id_categoria_producto: newId, nombre, estado: 1 };
  }
}

import { PurchasesRepository } from "../models/purchases.model.js";
import { SuppliersRepository } from "../models/suppliers.model.js";
import { ProductsRepository } from "../models/products.model.js";
import { ApiError } from "../errors/apiError.js";

export class PurchasesService {
  static async getAllPurchases(filters) {
    return await PurchasesRepository.findAll(filters);
  }

  static async getPurchaseById(id) {
    const purchase = await PurchasesRepository.findById(id);
    if (!purchase) {
      throw ApiError.notFound("Compra no encontrada");
    }
    return purchase;
  }

  static async createPurchase(purchaseData, userId) {
    // 1. Validar proveedor
    const supplier = await SuppliersRepository.findById(purchaseData.id_proveedor);
    if (!supplier) {
      throw ApiError.notFound("Proveedor no encontrado.");
    }
    if (supplier.estado === 0) {
      throw ApiError.badRequest("El proveedor seleccionado se encuentra inactivo.");
    }

    // 2. Validar detalles y calcular subtotales
    const detailsWithSubtotals = [];
    let totalAmount = 0;

    for (const item of purchaseData.detalles) {
      const product = await ProductsRepository.findById(item.id_producto);
      if (!product) {
        throw ApiError.notFound(`Producto con ID ${item.id_producto} no encontrado.`);
      }

      const qty = Number(item.cantidad);
      const unitPrice = Number(item.precio_unitario);
      const subtotal = qty * unitPrice;
      totalAmount += subtotal;

      detailsWithSubtotals.push({
        id_producto: product.id_producto,
        cantidad: qty,
        precio_unitario: unitPrice,
        subtotal
      });
    }

    const payload = {
      id_proveedor: purchaseData.id_proveedor,
      id_usuario: userId
    };

    const newPurchaseId = await PurchasesRepository.createWithDetails(
      payload,
      detailsWithSubtotals,
      totalAmount
    );

    return await PurchasesRepository.findById(newPurchaseId);
  }

  static async cancelPurchase(id) {
    const purchase = await PurchasesRepository.findById(id);
    if (!purchase) {
      throw ApiError.notFound("Compra no encontrada.");
    }

    if (purchase.estado === "Anulada") {
      throw ApiError.badRequest("La compra ya se encuentra anulada.");
    }

    // Validar que haya stock suficiente para descontar
    for (const item of purchase.detalles) {
      const product = await ProductsRepository.findById(item.id_producto);
      if (product && product.stock < item.cantidad) {
        throw ApiError.conflict(
          `No se puede anular la compra: el producto '${product.nombre}' tiene stock actual (${product.stock}) menor a la cantidad de la compra (${item.cantidad}).`
        );
      }
    }

    await PurchasesRepository.cancelPurchase(id);
    return await PurchasesRepository.findById(id);
  }
}

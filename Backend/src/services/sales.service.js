import { SalesRepository } from "../models/sales.model.js";
import { ClientsRepository } from "../models/clients.model.js";
import { ProductsRepository } from "../models/products.model.js";
import { ServicesRepository } from "../models/services.model.js";
import { AppointmentsRepository } from "../models/appointments.model.js";
import { ApiError } from "../errors/apiError.js";

export class SalesService {
  static async getAllSales(filters) {
    return await SalesRepository.findAll(filters);
  }

  static async getSaleById(id) {
    const sale = await SalesRepository.findById(id);
    if (!sale) {
      throw ApiError.notFound("Venta no encontrada");
    }
    return sale;
  }

  static async createSale(saleData, userId) {
    // 1. Validar cliente
    const client = await ClientsRepository.findById(saleData.id_cliente);
    if (!client) {
      throw ApiError.notFound("Cliente no encontrado.");
    }

    // 2. Validar cita si viene informada
    if (saleData.id_cita) {
      const appointment = await AppointmentsRepository.findById(saleData.id_cita);
      if (!appointment) {
        throw ApiError.notFound("Cita referenciada no encontrada.");
      }
    }

    // 3. Validar productos, servicios y disponibilidad de stock
    const detailsWithSubtotals = [];
    let totalAmount = 0;

    for (const item of saleData.detalles) {
      const qty = Number(item.cantidad);
      const unitPrice = Number(item.precio_unitario);
      const subtotal = qty * unitPrice;
      totalAmount += subtotal;

      if (item.tipo_item === "Producto") {
        if (!item.id_producto) {
          throw ApiError.badRequest("id_producto es requerido cuando el tipo de ítem es 'Producto'.");
        }

        const product = await ProductsRepository.findById(item.id_producto);
        if (!product) {
          throw ApiError.notFound(`Producto con ID ${item.id_producto} no encontrado.`);
        }

        if (product.estado === 0) {
          throw ApiError.badRequest(`El producto '${product.nombre}' se encuentra inactivo.`);
        }

        // Verificación estricta de existencias en inventario
        if (product.stock < qty) {
          throw ApiError.conflict(
            `Stock insuficiente para el producto '${product.nombre}'. Stock disponible: ${product.stock}, solicitado: ${qty}.`
          );
        }

        detailsWithSubtotals.push({
          tipo_item: "Producto",
          id_producto: product.id_producto,
          id_servicio: null,
          cantidad: qty,
          precio_unitario: unitPrice,
          subtotal
        });
      } else if (item.tipo_item === "Servicio") {
        if (!item.id_servicio) {
          throw ApiError.badRequest("id_servicio es requerido cuando el tipo de ítem es 'Servicio'.");
        }

        const service = await ServicesRepository.findById(item.id_servicio);
        if (!service) {
          throw ApiError.notFound(`Servicio con ID ${item.id_servicio} no encontrado.`);
        }

        detailsWithSubtotals.push({
          tipo_item: "Servicio",
          id_producto: null,
          id_servicio: service.id_servicio,
          cantidad: qty,
          precio_unitario: unitPrice,
          subtotal
        });
      }
    }

    const payload = {
      id_cliente: saleData.id_cliente,
      id_cita: saleData.id_cita || null,
      id_usuario: userId
    };

    const newSaleId = await SalesRepository.createWithDetails(
      payload,
      detailsWithSubtotals,
      totalAmount
    );

    return await SalesRepository.findById(newSaleId);
  }

  static async cancelSale(id) {
    const sale = await SalesRepository.findById(id);
    if (!sale) {
      throw ApiError.notFound("Venta no encontrada.");
    }

    if (sale.estado === "Anulada") {
      throw ApiError.badRequest("La venta ya se encuentra anulada.");
    }

    await SalesRepository.cancelSale(id);
    return await SalesRepository.findById(id);
  }

  static async deleteSale(id) {
    const sale = await SalesRepository.findById(id);
    if (!sale) {
      throw ApiError.notFound("Venta no encontrada.");
    }
    await SalesRepository.delete(id);
    return { id_venta: Number(id), eliminado: true };
  }
}

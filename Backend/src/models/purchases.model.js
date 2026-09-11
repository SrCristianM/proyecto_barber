import { executeQuery, executeTransaction, isDatabaseConnected } from "../config/db.js";
import { mockStore } from "../config/mockStore.js";

export class PurchasesRepository {
  static async findAll({ supplier = "all", status = "all", startDate = "", endDate = "" } = {}) {
    if (isDatabaseConnected()) {
      let sql = `
        SELECT c.id_compra, c.id_proveedor, c.id_usuario, c.fecha, c.total, c.estado,
               p.nombre as proveedor_nombre, p.nit as proveedor_nit,
               CONCAT(u.nombre, ' ', u.apellido) as usuario_nombre
        FROM compra c
        JOIN proveedor p ON c.id_proveedor = p.id_proveedor
        JOIN usuario u ON c.id_usuario = u.id_usuario
        WHERE 1=1
      `;
      const params = [];

      if (supplier !== "all") {
        sql += ` AND c.id_proveedor = ?`;
        params.push(Number(supplier));
      }

      if (status !== "all") {
        sql += ` AND c.estado = ?`;
        params.push(status);
      }

      if (startDate) {
        sql += ` AND c.fecha >= ?`;
        params.push(startDate);
      }

      if (endDate) {
        sql += ` AND c.fecha <= ?`;
        params.push(endDate);
      }

      sql += ` ORDER BY c.fecha DESC`;
      const purchases = await executeQuery(sql, params);

      for (const purchase of purchases) {
        const detSql = `
          SELECT dc.id_detalle_compra, dc.id_producto, dc.cantidad, dc.precio_unitario, dc.subtotal,
                 prod.nombre as producto_nombre
          FROM detalle_compra dc
          JOIN producto prod ON dc.id_producto = prod.id_producto
          WHERE dc.id_compra = ?
        `;
        purchase.detalles = await executeQuery(detSql, [purchase.id_compra]);
      }

      return purchases;
    }

    return mockStore.compras
      .map((c) => {
        const prov = mockStore.proveedores.find((p) => p.id_proveedor === c.id_proveedor);
        const usr = mockStore.usuarios.find((u) => u.id_usuario === c.id_usuario);
        const details = mockStore.detalle_compras
          .filter((dc) => dc.id_compra === c.id_compra)
          .map((dc) => {
            const prod = mockStore.productos.find((pr) => pr.id_producto === dc.id_producto);
            return {
              ...dc,
              producto_nombre: prod ? prod.nombre : "Producto"
            };
          });

        return {
          ...c,
          proveedor_nombre: prov ? prov.nombre : "Proveedor",
          proveedor_nit: prov ? prov.nit : "",
          usuario_nombre: usr ? `${usr.nombre} ${usr.apellido}` : "Usuario",
          detalles: details
        };
      })
      .filter((c) => {
        const matchesSupplier = supplier === "all" || String(c.id_proveedor) === String(supplier);
        const matchesStatus = status === "all" || c.estado === status;
        const matchesStartDate = !startDate || c.fecha >= startDate;
        const matchesEndDate = !endDate || c.fecha <= endDate;
        return matchesSupplier && matchesStatus && matchesStartDate && matchesEndDate;
      })
      .sort((a, b) => b.fecha.localeCompare(a.fecha));
  }

  static async findById(id) {
    const purchaseId = Number(id);

    if (isDatabaseConnected()) {
      const sql = `
        SELECT c.id_compra, c.id_proveedor, c.id_usuario, c.fecha, c.total, c.estado,
               p.nombre as proveedor_nombre, p.nit as proveedor_nit, p.telefono as proveedor_telefono,
               CONCAT(u.nombre, ' ', u.apellido) as usuario_nombre
        FROM compra c
        JOIN proveedor p ON c.id_proveedor = p.id_proveedor
        JOIN usuario u ON c.id_usuario = u.id_usuario
        WHERE c.id_compra = ?
        LIMIT 1
      `;
      const rows = await executeQuery(sql, [purchaseId]);
      if (!rows || rows.length === 0) return null;

      const purchase = rows[0];
      const detSql = `
        SELECT dc.id_detalle_compra, dc.id_producto, dc.cantidad, dc.precio_unitario, dc.subtotal,
               prod.nombre as producto_nombre
        FROM detalle_compra dc
        JOIN producto prod ON dc.id_producto = prod.id_producto
        WHERE dc.id_compra = ?
      `;
      purchase.detalles = await executeQuery(detSql, [purchaseId]);
      return purchase;
    }

    const c = mockStore.compras.find((comp) => comp.id_compra === purchaseId);
    if (!c) return null;

    const prov = mockStore.proveedores.find((p) => p.id_proveedor === c.id_proveedor);
    const usr = mockStore.usuarios.find((u) => u.id_usuario === c.id_usuario);
    const details = mockStore.detalle_compras
      .filter((dc) => dc.id_compra === purchaseId)
      .map((dc) => {
        const prod = mockStore.productos.find((pr) => pr.id_producto === dc.id_producto);
        return {
          ...dc,
          producto_nombre: prod ? prod.nombre : "Producto"
        };
      });

    return {
      ...c,
      proveedor_nombre: prov ? prov.nombre : "Proveedor",
      proveedor_nit: prov ? prov.nit : "",
      proveedor_telefono: prov ? prov.telefono : "",
      usuario_nombre: usr ? `${usr.nombre} ${usr.apellido}` : "Usuario",
      detalles: details
    };
  }

  static async createWithDetails(purchaseData, detailsWithSubtotals, totalAmount) {
    const now = new Date().toISOString().replace("T", " ").substring(0, 19);

    return await executeTransaction(async (conn) => {
      if (isDatabaseConnected() && conn) {
        // 1. Insertar cabecera de compra
        const [pResult] = await conn.execute(
          `INSERT INTO compra (id_proveedor, id_usuario, fecha, total, estado) VALUES (?, ?, ?, ?, 'Registrada')`,
          [Number(purchaseData.id_proveedor), Number(purchaseData.id_usuario), now, Number(totalAmount)]
        );
        const compraId = pResult.insertId;

        // 2. Insertar detalles y actualizar stock
        for (const item of detailsWithSubtotals) {
          await conn.execute(
            `INSERT INTO detalle_compra (id_compra, id_producto, cantidad, precio_unitario, subtotal) VALUES (?, ?, ?, ?, ?)`,
            [compraId, Number(item.id_producto), Number(item.cantidad), Number(item.precio_unitario), Number(item.subtotal)]
          );

          // Incrementar stock en producto
          await conn.execute(
            `UPDATE producto SET stock = stock + ? WHERE id_producto = ?`,
            [Number(item.cantidad), Number(item.id_producto)]
          );
        }

        return compraId;
      }

      // Fallback
      const nextCompraId = Math.max(...mockStore.compras.map((c) => c.id_compra || 0), 0) + 1;
      mockStore.compras.push({
        id_compra: nextCompraId,
        id_proveedor: Number(purchaseData.id_proveedor),
        id_usuario: Number(purchaseData.id_usuario),
        fecha: now,
        total: Number(totalAmount),
        estado: "Registrada"
      });

      detailsWithSubtotals.forEach((item) => {
        const nextDetId = Math.max(...mockStore.detalle_compras.map((d) => d.id_detalle_compra || 0), 0) + 1;
        mockStore.detalle_compras.push({
          id_detalle_compra: nextDetId,
          id_compra: nextCompraId,
          id_producto: Number(item.id_producto),
          cantidad: Number(item.cantidad),
          precio_unitario: Number(item.precio_unitario),
          subtotal: Number(item.subtotal)
        });

        // Actualizar stock
        const p = mockStore.productos.find((prod) => prod.id_producto === Number(item.id_producto));
        if (p) p.stock += Number(item.cantidad);
      });

      return nextCompraId;
    });
  }

  static async cancelPurchase(id) {
    const purchaseId = Number(id);

    return await executeTransaction(async (conn) => {
      const purchase = await this.findById(purchaseId);
      if (!purchase) return false;

      if (isDatabaseConnected() && conn) {
        // Descontar el stock previamente sumado
        for (const item of purchase.detalles) {
          await conn.execute(
            `UPDATE producto SET stock = GREATEST(0, stock - ?) WHERE id_producto = ?`,
            [Number(item.cantidad), Number(item.id_producto)]
          );
        }

        // Marcar compra como Anulada
        await conn.execute(`UPDATE compra SET estado = 'Anulada' WHERE id_compra = ?`, [purchaseId]);
        return true;
      }

      // Fallback
      const c = mockStore.compras.find((comp) => comp.id_compra === purchaseId);
      if (!c) return false;

      purchase.detalles.forEach((item) => {
        const p = mockStore.productos.find((prod) => prod.id_producto === item.id_producto);
        if (p) p.stock = Math.max(0, p.stock - Number(item.cantidad));
      });

      c.estado = "Anulada";
      return true;
    });
  }
}

export { PurchasesRepository as PurchasesModel };
export default PurchasesRepository;

import { executeQuery, executeTransaction, isDatabaseConnected } from "../config/db.js";
import { mockStore } from "../config/mockStore.js";

export class SalesRepository {
  static async findAll({ client = "all", status = "all", startDate = "", endDate = "" } = {}) {
    if (isDatabaseConnected()) {
      let sql = `
        SELECT v.id_venta, v.id_cita, v.id_cliente, v.id_usuario, v.fecha, v.total, v.estado,
               CONCAT(uc.nombre, ' ', uc.apellido) as cliente_nombre, uc.correo as cliente_correo, uc.telefono as cliente_telefono,
               CONCAT(uu.nombre, ' ', uu.apellido) as usuario_nombre
        FROM venta v
        JOIN cliente c ON v.id_cliente = c.id_cliente
        JOIN usuario uc ON c.id_usuario = uc.id_usuario
        JOIN usuario uu ON v.id_usuario = uu.id_usuario
        WHERE 1=1
      `;
      const params = [];

      if (client !== "all") {
        sql += ` AND v.id_cliente = ?`;
        params.push(Number(client));
      }

      if (status !== "all") {
        sql += ` AND v.estado = ?`;
        params.push(status);
      }

      if (startDate) {
        sql += ` AND v.fecha >= ?`;
        params.push(startDate);
      }

      if (endDate) {
        sql += ` AND v.fecha <= ?`;
        params.push(endDate);
      }

      sql += ` ORDER BY v.fecha DESC`;
      const sales = await executeQuery(sql, params);

      for (const sale of sales) {
        const detSql = `
          SELECT vd.id_venta_detalle, vd.tipo_item, vd.id_producto, vd.id_servicio, vd.cantidad, vd.precio_unitario, vd.subtotal,
                 COALESCE(p.nombre, s.nombre) as nombre
          FROM venta_detalle vd
          LEFT JOIN producto p ON vd.id_producto = p.id_producto
          LEFT JOIN servicio s ON vd.id_servicio = s.id_servicio
          WHERE vd.id_venta = ?
        `;
        sale.detalles = await executeQuery(detSql, [sale.id_venta]);
      }

      return sales;
    }

    return mockStore.ventas
      .map((v) => {
        const cl = mockStore.clientes.find((c) => c.id_cliente === v.id_cliente);
        const uc = cl ? mockStore.usuarios.find((u) => u.id_usuario === cl.id_usuario) : null;
        const uu = mockStore.usuarios.find((u) => u.id_usuario === v.id_usuario);

        const details = mockStore.venta_detalles
          .filter((vd) => vd.id_venta === v.id_venta)
          .map((vd) => {
            let itemName = "Item";
            if (vd.tipo_item === "Producto") {
              const p = mockStore.productos.find((prod) => prod.id_producto === vd.id_producto);
              itemName = p ? p.nombre : "Producto";
            } else {
              const s = mockStore.servicios.find((serv) => serv.id_servicio === vd.id_servicio);
              itemName = s ? s.nombre : "Servicio";
            }

            return {
              ...vd,
              nombre: itemName
            };
          });

        return {
          ...v,
          cliente_nombre: uc ? `${uc.nombre} ${uc.apellido}` : "Cliente",
          cliente_correo: uc ? uc.correo : "",
          cliente_telefono: uc ? uc.telefono : "",
          usuario_nombre: uu ? `${uu.nombre} ${uu.apellido}` : "Vendedor",
          detalles: details
        };
      })
      .filter((v) => {
        const matchesClient = client === "all" || String(v.id_cliente) === String(client);
        const matchesStatus = status === "all" || v.estado === status;
        const matchesStartDate = !startDate || v.fecha >= startDate;
        const matchesEndDate = !endDate || v.fecha <= endDate;
        return matchesClient && matchesStatus && matchesStartDate && matchesEndDate;
      })
      .sort((a, b) => b.fecha.localeCompare(a.fecha));
  }

  static async findById(id) {
    const saleId = Number(id);

    if (isDatabaseConnected()) {
      const sql = `
        SELECT v.id_venta, v.id_cita, v.id_cliente, v.id_usuario, v.fecha, v.total, v.estado,
               CONCAT(uc.nombre, ' ', uc.apellido) as cliente_nombre, uc.correo as cliente_correo, uc.telefono as cliente_telefono,
               CONCAT(uu.nombre, ' ', uu.apellido) as usuario_nombre
        FROM venta v
        JOIN cliente c ON v.id_cliente = c.id_cliente
        JOIN usuario uc ON c.id_usuario = uc.id_usuario
        JOIN usuario uu ON v.id_usuario = uu.id_usuario
        WHERE v.id_venta = ?
        LIMIT 1
      `;
      const rows = await executeQuery(sql, [saleId]);
      if (!rows || rows.length === 0) return null;

      const sale = rows[0];
      const detSql = `
        SELECT vd.id_venta_detalle, vd.tipo_item, vd.id_producto, vd.id_servicio, vd.cantidad, vd.precio_unitario, vd.subtotal,
               COALESCE(p.nombre, s.nombre) as nombre
        FROM venta_detalle vd
        LEFT JOIN producto p ON vd.id_producto = p.id_producto
        LEFT JOIN servicio s ON vd.id_servicio = s.id_servicio
        WHERE vd.id_venta = ?
      `;
      sale.detalles = await executeQuery(detSql, [saleId]);
      return sale;
    }

    const v = mockStore.ventas.find((vent) => vent.id_venta === saleId);
    if (!v) return null;

    const cl = mockStore.clientes.find((c) => c.id_cliente === v.id_cliente);
    const uc = cl ? mockStore.usuarios.find((u) => u.id_usuario === cl.id_usuario) : null;
    const uu = mockStore.usuarios.find((u) => u.id_usuario === v.id_usuario);

    const details = mockStore.venta_detalles
      .filter((vd) => vd.id_venta === saleId)
      .map((vd) => {
        let itemName = "Item";
        if (vd.tipo_item === "Producto") {
          const p = mockStore.productos.find((prod) => prod.id_producto === vd.id_producto);
          itemName = p ? p.nombre : "Producto";
        } else {
          const s = mockStore.servicios.find((serv) => serv.id_servicio === vd.id_servicio);
          itemName = s ? s.nombre : "Servicio";
        }

        return {
          ...vd,
          nombre: itemName
        };
      });

    return {
      ...v,
      cliente_nombre: uc ? `${uc.nombre} ${uc.apellido}` : "Cliente",
      cliente_correo: uc ? uc.correo : "",
      cliente_telefono: uc ? uc.telefono : "",
      usuario_nombre: uu ? `${uu.nombre} ${uu.apellido}` : "Vendedor",
      detalles: details
    };
  }

  static async createWithDetails(saleData, detailsWithSubtotals, totalAmount) {
    const now = new Date().toISOString().replace("T", " ").substring(0, 19);

    return await executeTransaction(async (conn) => {
      if (isDatabaseConnected() && conn) {
        // 1. Insertar cabecera de venta
        const [vResult] = await conn.execute(
          `INSERT INTO venta (id_cita, id_cliente, id_usuario, fecha, total, estado) VALUES (?, ?, ?, ?, ?, 'Activa')`,
          [
            saleData.id_cita ? Number(saleData.id_cita) : null,
            Number(saleData.id_cliente),
            Number(saleData.id_usuario),
            now,
            Number(totalAmount)
          ]
        );
        const ventaId = vResult.insertId;

        // 2. Insertar detalles y debitar inventario
        for (const item of detailsWithSubtotals) {
          await conn.execute(
            `INSERT INTO venta_detalle (id_venta, tipo_item, id_producto, id_servicio, cantidad, precio_unitario, subtotal) VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
              ventaId,
              item.tipo_item,
              item.tipo_item === "Producto" ? Number(item.id_producto) : null,
              item.tipo_item === "Servicio" ? Number(item.id_servicio) : null,
              Number(item.cantidad),
              Number(item.precio_unitario),
              Number(item.subtotal)
            ]
          );

          // Si es producto, debitar stock
          if (item.tipo_item === "Producto") {
            await conn.execute(
              `UPDATE producto SET stock = stock - ? WHERE id_producto = ?`,
              [Number(item.cantidad), Number(item.id_producto)]
            );
          }
        }

        // 3. Si viene de una cita, marcar la cita como 'Completada'
        if (saleData.id_cita) {
          await conn.execute(`UPDATE cita SET estado = 'Completada' WHERE id_cita = ?`, [Number(saleData.id_cita)]);
        }

        return ventaId;
      }

      // Fallback
      const nextVentaId = Math.max(...mockStore.ventas.map((v) => v.id_venta || 0), 0) + 1;
      mockStore.ventas.push({
        id_venta: nextVentaId,
        id_cita: saleData.id_cita ? Number(saleData.id_cita) : null,
        id_cliente: Number(saleData.id_cliente),
        id_usuario: Number(saleData.id_usuario),
        fecha: now,
        total: Number(totalAmount),
        estado: "Activa"
      });

      detailsWithSubtotals.forEach((item) => {
        const nextDetId = Math.max(...mockStore.venta_detalles.map((d) => d.id_venta_detalle || 0), 0) + 1;
        mockStore.venta_detalles.push({
          id_venta_detalle: nextDetId,
          id_venta: nextVentaId,
          tipo_item: item.tipo_item,
          id_producto: item.tipo_item === "Producto" ? Number(item.id_producto) : null,
          id_servicio: item.tipo_item === "Servicio" ? Number(item.id_servicio) : null,
          cantidad: Number(item.cantidad),
          precio_unitario: Number(item.precio_unitario),
          subtotal: Number(item.subtotal)
        });

        if (item.tipo_item === "Producto") {
          const p = mockStore.productos.find((prod) => prod.id_producto === Number(item.id_producto));
          if (p) p.stock = Math.max(0, p.stock - Number(item.cantidad));
        }
      });

      if (saleData.id_cita) {
        const c = mockStore.citas.find((app) => app.id_cita === Number(saleData.id_cita));
        if (c) c.estado = "Completada";
      }

      return nextVentaId;
    });
  }

  static async cancelSale(id) {
    const saleId = Number(id);

    return await executeTransaction(async (conn) => {
      const sale = await this.findById(saleId);
      if (!sale) return false;

      if (isDatabaseConnected() && conn) {
        // Restaurar stock de productos vendidos
        for (const item of sale.detalles) {
          if (item.tipo_item === "Producto" && item.id_producto) {
            await conn.execute(
              `UPDATE producto SET stock = stock + ? WHERE id_producto = ?`,
              [Number(item.cantidad), Number(item.id_producto)]
            );
          }
        }

        await conn.execute(`UPDATE venta SET estado = 'Anulada' WHERE id_venta = ?`, [saleId]);
        return true;
      }

      // Fallback
      const v = mockStore.ventas.find((vent) => vent.id_venta === saleId);
      if (!v) return false;

      sale.detalles.forEach((item) => {
        if (item.tipo_item === "Producto" && item.id_producto) {
          const p = mockStore.productos.find((prod) => prod.id_producto === Number(item.id_producto));
          if (p) p.stock += Number(item.cantidad);
        }
      });

      v.estado = "Anulada";
      return true;
    });
  }
}

export { SalesRepository as SalesModel };
export default SalesRepository;

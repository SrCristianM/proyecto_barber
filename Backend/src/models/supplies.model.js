import { executeQuery, executeTransaction, isDatabaseConnected } from "../config/db.js";
import { mockStore } from "../config/mockStore.js";

export class SuppliesRepository {
  static async findAll({ barberId = "all", status = "all", startDate = "", endDate = "" } = {}) {
    if (isDatabaseConnected()) {
      let sql = `
        SELECT a.id_abastecimiento, a.id_barbero, a.id_usuario, a.fecha, a.observaciones, a.total_estimado, a.estado,
               CONCAT(ub.nombre, ' ', ub.apellido) as barbero_nombre, ub.correo as barbero_correo, ub.telefono as barbero_telefono,
               b.especialidad as barbero_especialidad,
               CONCAT(uu.nombre, ' ', uu.apellido) as usuario_nombre
        FROM abastecimiento a
        JOIN barbero b ON a.id_barbero = b.id_barbero
        JOIN usuario ub ON b.id_usuario = ub.id_usuario
        JOIN usuario uu ON a.id_usuario = uu.id_usuario
        WHERE 1=1
      `;
      const params = [];

      if (barberId !== "all") {
        sql += ` AND a.id_barbero = ?`;
        params.push(Number(barberId));
      }

      if (status !== "all") {
        sql += ` AND a.estado = ?`;
        params.push(status);
      }

      if (startDate) {
        sql += ` AND a.fecha >= ?`;
        params.push(startDate);
      }

      if (endDate) {
        sql += ` AND a.fecha <= ?`;
        params.push(endDate);
      }

      sql += ` ORDER BY a.fecha DESC`;
      const supplies = await executeQuery(sql, params);

      for (const item of supplies) {
        const detSql = `
          SELECT ad.id_abastecimiento_detalle, ad.id_producto, ad.cantidad, ad.precio_unitario, ad.subtotal,
                 p.nombre as producto_nombre, p.presentacion as producto_presentacion, p.marca as producto_marca
          FROM abastecimiento_detalle ad
          JOIN producto p ON ad.id_producto = p.id_producto
          WHERE ad.id_abastecimiento = ?
        `;
        item.detalles = await executeQuery(detSql, [item.id_abastecimiento]);
      }

      return supplies;
    }

    // Fallback MockDataStore
    return (mockStore.abastecimientos || [])
      .map((a) => {
        const b = mockStore.barberos.find((barb) => barb.id_barbero === a.id_barbero);
        const ub = b ? mockStore.usuarios.find((u) => u.id_usuario === b.id_usuario) : null;
        const uu = mockStore.usuarios.find((u) => u.id_usuario === a.id_usuario);

        const details = (mockStore.abastecimiento_detalles || [])
          .filter((ad) => ad.id_abastecimiento === a.id_abastecimiento)
          .map((ad) => {
            const p = mockStore.productos.find((prod) => prod.id_producto === ad.id_producto);
            return {
              ...ad,
              producto_nombre: p ? p.nombre : "Producto Insumo",
              producto_presentacion: p ? p.presentacion : "",
              producto_marca: p ? p.marca : ""
            };
          });

        return {
          ...a,
          barbero_nombre: ub ? `${ub.nombre} ${ub.apellido}`.trim() : "Barbero",
          barbero_correo: ub ? ub.correo : "",
          barbero_telefono: ub ? ub.telefono : "",
          barbero_especialidad: b ? b.especialidad : "Estilista",
          usuario_nombre: uu ? `${uu.nombre} ${uu.apellido}`.trim() : "Administrador / Recepción",
          detalles: details
        };
      })
      .filter((a) => {
        const matchesBarber = barberId === "all" || String(a.id_barbero) === String(barberId);
        const matchesStatus = status === "all" || a.estado === status;
        const matchesStartDate = !startDate || a.fecha >= startDate;
        const matchesEndDate = !endDate || a.fecha <= endDate;
        return matchesBarber && matchesStatus && matchesStartDate && matchesEndDate;
      })
      .sort((a, b) => b.fecha.localeCompare(a.fecha));
  }

  static async findById(id) {
    const supplyId = Number(id);

    if (isDatabaseConnected()) {
      const sql = `
        SELECT a.id_abastecimiento, a.id_barbero, a.id_usuario, a.fecha, a.observaciones, a.total_estimado, a.estado,
               CONCAT(ub.nombre, ' ', ub.apellido) as barbero_nombre, ub.correo as barbero_correo, ub.telefono as barbero_telefono,
               b.especialidad as barbero_especialidad,
               CONCAT(uu.nombre, ' ', uu.apellido) as usuario_nombre
        FROM abastecimiento a
        JOIN barbero b ON a.id_barbero = b.id_barbero
        JOIN usuario ub ON b.id_usuario = ub.id_usuario
        JOIN usuario uu ON a.id_usuario = uu.id_usuario
        WHERE a.id_abastecimiento = ?
        LIMIT 1
      `;
      const rows = await executeQuery(sql, [supplyId]);
      if (!rows || rows.length === 0) return null;

      const supply = rows[0];
      const detSql = `
        SELECT ad.id_abastecimiento_detalle, ad.id_producto, ad.cantidad, ad.precio_unitario, ad.subtotal,
               p.nombre as producto_nombre, p.presentacion as producto_presentacion, p.marca as producto_marca
        FROM abastecimiento_detalle ad
        JOIN producto p ON ad.id_producto = p.id_producto
        WHERE ad.id_abastecimiento = ?
      `;
      supply.detalles = await executeQuery(detSql, [supplyId]);
      return supply;
    }

    const a = (mockStore.abastecimientos || []).find((item) => item.id_abastecimiento === supplyId);
    if (!a) return null;

    const b = mockStore.barberos.find((barb) => barb.id_barbero === a.id_barbero);
    const ub = b ? mockStore.usuarios.find((u) => u.id_usuario === b.id_usuario) : null;
    const uu = mockStore.usuarios.find((u) => u.id_usuario === a.id_usuario);

    const details = (mockStore.abastecimiento_detalles || [])
      .filter((ad) => ad.id_abastecimiento === supplyId)
      .map((ad) => {
        const p = mockStore.productos.find((prod) => prod.id_producto === ad.id_producto);
        return {
          ...ad,
          producto_nombre: p ? p.nombre : "Producto Insumo",
          producto_presentacion: p ? p.presentacion : "",
          producto_marca: p ? p.marca : ""
        };
      });

    return {
      ...a,
      barbero_nombre: ub ? `${ub.nombre} ${ub.apellido}`.trim() : "Barbero",
      barbero_correo: ub ? ub.correo : "",
      barbero_telefono: ub ? ub.telefono : "",
      barbero_especialidad: b ? b.especialidad : "Estilista",
      usuario_nombre: uu ? `${uu.nombre} ${uu.apellido}`.trim() : "Administrador / Recepción",
      detalles: details
    };
  }

  static async createWithDetails(supplyData, detailsWithSubtotals, totalEstimated) {
    const now = new Date().toLocaleString("en-CA", { timeZone: "America/Bogota", hour12: false }).replace(",", "");

    return await executeTransaction(async (conn) => {
      if (isDatabaseConnected() && conn) {
        // 1. Insertar cabecera de abastecimiento
        const [aResult] = await conn.execute(
          `INSERT INTO abastecimiento (id_barbero, id_usuario, fecha, observaciones, total_estimado, estado) VALUES (?, ?, ?, ?, ?, 'Registrado')`,
          [
            Number(supplyData.id_barbero),
            Number(supplyData.id_usuario),
            now,
            supplyData.observaciones || "Despacho de consumibles e insumos para estación de servicio",
            Number(totalEstimated)
          ]
        );
        const supplyId = aResult.insertId;

        // 2. Insertar detalles y debitar inventario
        for (const item of detailsWithSubtotals) {
          await conn.execute(
            `INSERT INTO abastecimiento_detalle (id_abastecimiento, id_producto, cantidad, precio_unitario, subtotal) VALUES (?, ?, ?, ?, ?)`,
            [
              supplyId,
              Number(item.id_producto),
              Number(item.cantidad),
              Number(item.precio_unitario),
              Number(item.subtotal)
            ]
          );

          // Debitar stock de inventario existente
          await conn.execute(
            `UPDATE producto SET stock = stock - ? WHERE id_producto = ?`,
            [Number(item.cantidad), Number(item.id_producto)]
          );
        }

        return supplyId;
      }

      // Fallback MockDataStore
      if (!mockStore.abastecimientos) mockStore.abastecimientos = [];
      if (!mockStore.abastecimiento_detalles) mockStore.abastecimiento_detalles = [];

      const nextSupplyId = Math.max(...mockStore.abastecimientos.map((a) => a.id_abastecimiento || 0), 0) + 1;
      mockStore.abastecimientos.push({
        id_abastecimiento: nextSupplyId,
        id_barbero: Number(supplyData.id_barbero),
        id_usuario: Number(supplyData.id_usuario),
        fecha: now,
        observaciones: supplyData.observaciones || "Despacho de consumibles e insumos para estación de servicio",
        total_estimado: Number(totalEstimated),
        estado: "Registrado"
      });

      detailsWithSubtotals.forEach((item) => {
        const nextDetId = Math.max(...mockStore.abastecimiento_detalles.map((d) => d.id_abastecimiento_detalle || 0), 0) + 1;
        mockStore.abastecimiento_detalles.push({
          id_abastecimiento_detalle: nextDetId,
          id_abastecimiento: nextSupplyId,
          id_producto: Number(item.id_producto),
          cantidad: Number(item.cantidad),
          precio_unitario: Number(item.precio_unitario),
          subtotal: Number(item.subtotal)
        });

        // Debitar stock del producto en memoria
        const p = mockStore.productos.find((prod) => prod.id_producto === Number(item.id_producto));
        if (p) {
          p.stock = Math.max(0, p.stock - Number(item.cantidad));
        }
      });

      mockStore.saveToFile();
      return nextSupplyId;
    });
  }

  static async cancelSupply(id) {
    const supplyId = Number(id);

    return await executeTransaction(async (conn) => {
      const supply = await this.findById(supplyId);
      if (!supply) return false;
      if (supply.estado === "Anulado") return true;

      if (isDatabaseConnected() && conn) {
        // Restaurar stock de los productos consumidos
        for (const item of supply.detalles) {
          if (item.id_producto) {
            await conn.execute(
              `UPDATE producto SET stock = stock + ? WHERE id_producto = ?`,
              [Number(item.cantidad), Number(item.id_producto)]
            );
          }
        }

        await conn.execute(`UPDATE abastecimiento SET estado = 'Anulado' WHERE id_abastecimiento = ?`, [supplyId]);
        return true;
      }

      // Fallback MockDataStore
      const a = (mockStore.abastecimientos || []).find((item) => item.id_abastecimiento === supplyId);
      if (!a) return false;

      supply.detalles.forEach((item) => {
        if (item.id_producto) {
          const p = mockStore.productos.find((prod) => prod.id_producto === Number(item.id_producto));
          if (p) p.stock += Number(item.cantidad);
        }
      });

      a.estado = "Anulado";
      mockStore.saveToFile();
      return true;
    });
  }

  static async delete(id) {
    const supplyId = Number(id);
    if (isDatabaseConnected()) {
      await executeQuery(`DELETE FROM abastecimiento_detalle WHERE id_abastecimiento = ?`, [supplyId]);
      await executeQuery(`DELETE FROM abastecimiento WHERE id_abastecimiento = ?`, [supplyId]);
      return true;
    }
    mockStore.abastecimiento_detalles = (mockStore.abastecimiento_detalles || []).filter((d) => d.id_abastecimiento !== supplyId);
    mockStore.abastecimientos = (mockStore.abastecimientos || []).filter((a) => a.id_abastecimiento !== supplyId);
    mockStore.saveToFile();
    return true;
  }

  /**
   * Métricas agregadas de insumos gastados por barbero para Dashboard y Control Operativo
   * @param {Object} options
   * @param {string|number} options.barberId - 'all' o id_barbero específico
   * @param {string} options.period - 'week' (esta semana / últimos 7 días) o 'month' (este mes / últimos 30 días)
   */
  static async getBarberSuppliesMetrics({ barberId = "all", period = "week" } = {}) {
    const allSupplies = await this.findAll({ barberId, status: "Registrado" });

    // Filtrar por período de tiempo (Bogotá time)
    const now = new Date();
    let startDateObj = new Date();

    if (period === "week") {
      // Últimos 7 días
      startDateObj.setDate(now.getDate() - 7);
      startDateObj.setHours(0, 0, 0, 0);
    } else if (period === "month") {
      // Últimos 30 días
      startDateObj.setDate(now.getDate() - 30);
      startDateObj.setHours(0, 0, 0, 0);
    } else {
      startDateObj = new Date(0); // Todo el histórico
    }

    const startDateStr = startDateObj.toISOString().split("T")[0];

    const periodSupplies = allSupplies.filter((s) => {
      const supplyDate = s.fecha ? s.fecha.substring(0, 10) : "";
      return supplyDate >= startDateStr;
    });

    // Totales globales del período
    let totalDespachos = periodSupplies.length;
    let totalArticulos = 0;
    let totalCostoEstimado = 0;

    // Desglose por producto consumido
    const productMap = new Map();
    // Desglose por barbero
    const barberMap = new Map();

    periodSupplies.forEach((supply) => {
      totalCostoEstimado += Number(supply.total_estimado || 0);

      const bId = supply.id_barbero;
      if (!barberMap.has(bId)) {
        barberMap.set(bId, {
          id_barbero: bId,
          nombre_barbero: supply.barbero_nombre || "Barbero",
          especialidad: supply.barbero_especialidad || "Estilista",
          total_despachos: 0,
          total_articulos: 0,
          total_costo: 0,
          ult_despacho: supply.fecha,
          productos: new Map()
        });
      }

      const barberStats = barberMap.get(bId);
      barberStats.total_despachos += 1;
      barberStats.total_costo += Number(supply.total_estimado || 0);

      (supply.detalles || []).forEach((det) => {
        const qty = Number(det.cantidad || 0);
        const sub = Number(det.subtotal || 0);
        totalArticulos += qty;
        barberStats.total_articulos += qty;

        // Registro en mapa global de productos
        const pId = det.id_producto;
        if (!productMap.has(pId)) {
          productMap.set(pId, {
            id_producto: pId,
            nombre: det.producto_nombre || "Producto",
            presentacion: det.producto_presentacion || "",
            total_cantidad: 0,
            total_costo: 0
          });
        }
        const pGlobal = productMap.get(pId);
        pGlobal.total_cantidad += qty;
        pGlobal.total_costo += sub;

        // Registro en mapa del barbero
        if (!barberStats.productos.has(pId)) {
          barberStats.productos.set(pId, {
            id_producto: pId,
            nombre: det.producto_nombre || "Producto",
            cantidad: 0,
            costo: 0
          });
        }
        const pBarber = barberStats.productos.get(pId);
        pBarber.cantidad += qty;
        pBarber.costo += sub;
      });
    });

    // Formatear listas ordenadas
    const topConsumibles = Array.from(productMap.values()).sort((a, b) => b.total_cantidad - a.total_cantidad);

    const porBarbero = Array.from(barberMap.values())
      .map((b) => ({
        ...b,
        productos: Array.from(b.productos.values()).sort((x, y) => y.cantidad - x.cantidad)
      }))
      .sort((a, b) => b.total_articulos - a.total_articulos);

    return {
      period,
      barberId,
      total_despachos: totalDespachos,
      total_articulos: totalArticulos,
      total_costo_estimado: totalCostoEstimado,
      top_consumibles: topConsumibles,
      por_barbero: porBarbero,
      despachos_recientes: periodSupplies.slice(0, 6)
    };
  }
}

export { SuppliesRepository as SuppliesModel };
export default SuppliesRepository;

import { executeQuery, executeTransaction, isDatabaseConnected } from "../config/db.js";
import { mockStore } from "../config/mockStore.js";

function calculateDaysDifference(pastDateStr, currentDateStr = null) {
  if (!pastDateStr) return 0;
  const normalizedPast = typeof pastDateStr === "string" ? pastDateStr.replace(" ", "T") : pastDateStr;
  const past = new Date(normalizedPast);
  const current = currentDateStr ? new Date(typeof currentDateStr === "string" ? currentDateStr.replace(" ", "T") : currentDateStr) : new Date();
  if (isNaN(past.getTime()) || isNaN(current.getTime())) return 0;
  const diffTime = Math.max(0, current.getTime() - past.getTime());
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
}

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
                 COALESCE(ib.nombre, p.nombre, 'Insumo') as producto_nombre,
                 COALESCE(ib.unidad_medida, p.presentacion, '') as producto_presentacion,
                 COALESCE(ib.categoria, p.marca, 'Insumo') as producto_marca
          FROM abastecimiento_detalle ad
          LEFT JOIN insumo_bodega ib ON ad.id_producto = ib.id_insumo
          LEFT JOIN producto p ON ad.id_producto = p.id_producto
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
            const ib = (mockStore.insumos_bodega || []).find((i) => Number(i.id_insumo) === Number(ad.id_producto));
            const p = (mockStore.productos || []).find((prod) => Number(prod.id_producto) === Number(ad.id_producto));
            return {
              ...ad,
              producto_nombre: ib ? ib.nombre : (p ? p.nombre : "Insumo Bodega"),
              producto_presentacion: ib ? (ib.unidad_medida || ib.categoria) : (p ? p.presentacion : ""),
              producto_marca: ib ? (ib.categoria || "Bodega") : (p ? p.marca : "Insumo")
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
               COALESCE(ib.nombre, p.nombre, 'Insumo') as producto_nombre,
               COALESCE(ib.unidad_medida, p.presentacion, '') as producto_presentacion,
               COALESCE(ib.categoria, p.marca, 'Insumo') as producto_marca
        FROM abastecimiento_detalle ad
        LEFT JOIN insumo_bodega ib ON ad.id_producto = ib.id_insumo
        LEFT JOIN producto p ON ad.id_producto = p.id_producto
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
        const ib = (mockStore.insumos_bodega || []).find((i) => Number(i.id_insumo) === Number(ad.id_producto));
        const p = (mockStore.productos || []).find((prod) => Number(prod.id_producto) === Number(ad.id_producto));
        return {
          ...ad,
          producto_nombre: ib ? ib.nombre : (p ? p.nombre : "Insumo Bodega"),
          producto_presentacion: ib ? (ib.unidad_medida || ib.categoria) : (p ? p.presentacion : ""),
          producto_marca: ib ? (ib.categoria || "Bodega") : (p ? p.marca : "Insumo")
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
    const barberId = Number(supplyData.id_barbero);

    return await executeTransaction(async (conn) => {
      if (isDatabaseConnected() && conn) {
        // 1. Insertar cabecera de abastecimiento
        const [aResult] = await conn.execute(
          `INSERT INTO abastecimiento (id_barbero, id_usuario, fecha, observaciones, total_estimado, estado) VALUES (?, ?, ?, ?, ?, 'Registrado')`,
          [
            barberId,
            Number(supplyData.id_usuario),
            now,
            supplyData.observaciones || "Despacho manual de consumibles e insumos para estación",
            Number(totalEstimated)
          ]
        );
        const supplyId = aResult.insertId;

        // 2. Insertar detalles y debitar inventario
        for (const item of detailsWithSubtotals) {
          const rawId = Number(item.id_insumo || item.id_producto);
          const qty = Number(item.cantidad);

          await conn.execute(
            `INSERT INTO abastecimiento_detalle (id_abastecimiento, id_producto, cantidad, precio_unitario, subtotal) VALUES (?, ?, ?, ?, ?)`,
            [
              supplyId,
              rawId,
              qty,
              Number(item.precio_unitario),
              Number(item.subtotal)
            ]
          );

          // Verificar si es un insumo de bodega (insumo_bodega)
          const [warehouseRows] = await conn.execute(
            `SELECT id_insumo, stock_actual, nombre FROM insumo_bodega WHERE id_insumo = ? LIMIT 1`,
            [rawId]
          );

          if (warehouseRows && warehouseRows.length > 0) {
            // Descontar del stock de bodega general
            await conn.execute(
              `UPDATE insumo_bodega SET stock_actual = GREATEST(0, stock_actual - ?) WHERE id_insumo = ?`,
              [qty, rawId]
            );

            // Verificar si el insumo ya está asignado a la estación del barbero
            const [stationRows] = await conn.execute(
              `SELECT id_estacion_insumo, fecha_ultima_reposicion, cantidad_asignada FROM estacion_barbero WHERE id_barbero = ? AND id_insumo = ? LIMIT 1`,
              [barberId, rawId]
            );

            if (stationRows && stationRows.length > 0) {
              const station = stationRows[0];
              const diasPasados = calculateDaysDifference(station.fecha_ultima_reposicion, now);

              // Registrar ciclo completado en historial_reposicion para que las métricas de duración se actualicen
              await conn.execute(
                `INSERT INTO historial_reposicion (id_barbero, id_insumo, cantidad_entregada, fecha_reposicion, dias_duracion_anterior, observaciones)
                 VALUES (?, ?, ?, ?, ?, ?)`,
                [
                  barberId,
                  rawId,
                  qty,
                  now,
                  diasPasados,
                  `Despacho manual registrado (${qty} un. asignadas para cubrir período). Duración ciclo anterior: ${diasPasados} días.`
                ]
              );

              // Restablecer semáforo a VERDE, fecha de reposición a hoy, y actualizar cantidad asignada
              await conn.execute(
                `UPDATE estacion_barbero
                 SET estado_semaforo = 'VERDE',
                     fecha_ultima_reposicion = ?,
                     fecha_cambio_estado = ?,
                     cantidad_asignada = ?,
                     notas = CONCAT('Despacho manual (', ?, ' un.) el ', ?, '. Ciclo anterior: ', ?, ' días.')
                 WHERE id_estacion_insumo = ?`,
                [now, now, qty, qty, now.substring(0, 10), diasPasados, station.id_estacion_insumo]
              );
            } else {
              // Asignar por primera vez a la estación del barbero en estado VERDE
              await conn.execute(
                `INSERT INTO estacion_barbero (id_barbero, id_insumo, cantidad_asignada, estado_semaforo, fecha_ultima_reposicion, fecha_cambio_estado, notas)
                 VALUES (?, ?, ?, 'VERDE', ?, ?, 'Insumo asignado en despacho manual')`,
                [barberId, rawId, qty, now, now]
              );
            }
          } else {
            // Producto regular de catálogo comercial
            await conn.execute(
              `UPDATE producto SET stock = GREATEST(0, stock - ?) WHERE id_producto = ?`,
              [qty, rawId]
            );
          }
        }

        return supplyId;
      }

      // Fallback MockDataStore
      if (!mockStore.abastecimientos) mockStore.abastecimientos = [];
      if (!mockStore.abastecimiento_detalles) mockStore.abastecimiento_detalles = [];
      if (!mockStore.estaciones_barberos) mockStore.estaciones_barberos = [];
      if (!mockStore.historial_reposiciones) mockStore.historial_reposiciones = [];

      const nextSupplyId = Math.max(...mockStore.abastecimientos.map((a) => a.id_abastecimiento || 0), 0) + 1;

      mockStore.abastecimientos.push({
        id_abastecimiento: nextSupplyId,
        id_barbero: barberId,
        id_usuario: Number(supplyData.id_usuario),
        fecha: now,
        observaciones: supplyData.observaciones || "Despacho manual de consumibles e insumos para estación",
        total_estimado: Number(totalEstimated),
        estado: "Registrado"
      });

      detailsWithSubtotals.forEach((item) => {
        const nextDetId = Math.max(...mockStore.abastecimiento_detalles.map((d) => d.id_abastecimiento_detalle || 0), 0) + 1;
        const rawId = Number(item.id_insumo || item.id_producto);
        const qty = Number(item.cantidad);

        mockStore.abastecimiento_detalles.push({
          id_abastecimiento_detalle: nextDetId,
          id_abastecimiento: nextSupplyId,
          id_producto: rawId,
          cantidad: qty,
          precio_unitario: Number(item.precio_unitario),
          subtotal: Number(item.subtotal)
        });

        // 1. Buscar en insumos de bodega
        const warehouseItem = (mockStore.insumos_bodega || []).find((i) => Number(i.id_insumo) === rawId);
        if (warehouseItem) {
          // Descontar stock de bodega
          warehouseItem.stock_actual = Math.max(0, Number(warehouseItem.stock_actual || 0) - qty);

          // Buscar si el insumo está en la estación del barbero
          const stationItem = mockStore.estaciones_barberos.find(
            (e) => Number(e.id_barbero || e.barbero_id) === barberId && Number(e.id_insumo || e.insumo_id) === rawId
          );

          if (stationItem) {
            const diasPasados = calculateDaysDifference(stationItem.fecha_ultima_reposicion, now);

            // Registrar ciclo previo en historial de reposiciones
            const nextHistId = Math.max(...mockStore.historial_reposiciones.map((h) => Number(h.id_historial || 0)), 0) + 1;
            mockStore.historial_reposiciones.push({
              id_historial: nextHistId,
              id_barbero: barberId,
              barbero_id: barberId,
              id_insumo: rawId,
              insumo_id: rawId,
              cantidad_entregada: qty,
              fecha_reposicion: now,
              dias_duracion_anterior: diasPasados,
              observaciones: `Despacho manual registrado (${qty} un. asignadas para cubrir período). Duración ciclo anterior: ${diasPasados} días.`
            });

            // Restablecer semáforo a VERDE, reiniciar fecha de última reposición a hoy, y actualizar cantidad asignada
            stationItem.estado_semaforo = "VERDE";
            stationItem.fecha_ultima_reposicion = now;
            stationItem.fecha_cambio_estado = now;
            stationItem.cantidad_asignada = qty;
            stationItem.notas = `Despacho manual (${qty} un.) el ${now.substring(0, 10)}. Ciclo anterior: ${diasPasados} días.`;
          } else {
            // Asignar nuevo insumo a la estación en VERDE
            const nextStationId = Math.max(...mockStore.estaciones_barberos.map((e) => Number(e.id_estacion_insumo || e.id_estacion_item || 0)), 0) + 1;
            mockStore.estaciones_barberos.push({
              id_estacion_insumo: nextStationId,
              id_estacion_item: nextStationId,
              id_barbero: barberId,
              barbero_id: barberId,
              id_insumo: rawId,
              insumo_id: rawId,
              cantidad_asignada: qty,
              estado_semaforo: "VERDE",
              fecha_ultima_reposicion: now,
              fecha_cambio_estado: now,
              notas: "Insumo asignado en despacho manual"
            });
          }
        } else {
          // Producto regular comercial
          const p = (mockStore.productos || []).find((prod) => Number(prod.id_producto) === rawId);
          if (p) {
            p.stock = Math.max(0, Number(p.stock || 0) - qty);
          }
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
        // Restaurar stock de los insumos/productos
        for (const item of supply.detalles) {
          const rawId = Number(item.id_producto);
          const qty = Number(item.cantidad);

          const [warehouseRows] = await conn.execute(
            `SELECT id_insumo FROM insumo_bodega WHERE id_insumo = ? LIMIT 1`,
            [rawId]
          );

          if (warehouseRows && warehouseRows.length > 0) {
            await conn.execute(
              `UPDATE insumo_bodega SET stock_actual = stock_actual + ? WHERE id_insumo = ?`,
              [qty, rawId]
            );
          } else {
            await conn.execute(
              `UPDATE producto SET stock = stock + ? WHERE id_producto = ?`,
              [qty, rawId]
            );
          }
        }

        await conn.execute(`UPDATE abastecimiento SET estado = 'Anulado' WHERE id_abastecimiento = ?`, [supplyId]);
        return true;
      }

      // Fallback MockDataStore
      const a = (mockStore.abastecimientos || []).find((item) => item.id_abastecimiento === supplyId);
      if (!a) return false;

      (supply.detalles || []).forEach((item) => {
        const rawId = Number(item.id_producto);
        const qty = Number(item.cantidad);

        const warehouseItem = (mockStore.insumos_bodega || []).find((i) => Number(i.id_insumo) === rawId);
        if (warehouseItem) {
          warehouseItem.stock_actual = (Number(warehouseItem.stock_actual) || 0) + qty;
        } else {
          const p = (mockStore.productos || []).find((prod) => Number(prod.id_producto) === rawId);
          if (p) p.stock = (Number(p.stock) || 0) + qty;
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
      let supplyCost = Number(supply.total_estimado || 0);
      let calculatedDetCost = 0;

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

      (supply.detalles || []).forEach((det) => {
        const qty = Number(det.cantidad || 0);
        const unitPrice = Number(det.precio_unitario || 0);
        const sub = Number(det.subtotal || 0) > 0 ? Number(det.subtotal) : (qty * (unitPrice > 0 ? unitPrice : 15000));
        calculatedDetCost += sub;

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

      const finalSupplyCost = supplyCost > 0 ? supplyCost : calculatedDetCost;
      totalCostoEstimado += finalSupplyCost;
      barberStats.total_costo += finalSupplyCost;
    });

    // Cruce con servicios realizados para Rendimiento Operativo (Opción 1.A)
    let appointments = [];
    try {
      if (isDatabaseConnected()) {
        appointments = await executeQuery(
          `SELECT id_cita, id_barbero, fecha, estado FROM cita WHERE fecha >= ?`,
          [startDateStr]
        );
      } else {
        appointments = (mockStore.citas || []).filter((c) => {
          const cDate = c.fecha ? c.fecha.substring(0, 10) : "";
          return cDate >= startDateStr;
        });
      }
    } catch {}

    const completedApts = appointments.filter((c) => {
      const st = (c.estado || "").toLowerCase();
      return st === "finalizada" || st === "completada" || st === "confirmada" || st === "atendida";
    });

    const servicesByBarber = new Map();
    completedApts.forEach((apt) => {
      const bId = Number(apt.id_barbero);
      servicesByBarber.set(bId, (servicesByBarber.get(bId) || 0) + 1);
    });

    const totalServiciosPeriodo = completedApts.length;

    // Formatear listas ordenadas
    const topConsumibles = Array.from(productMap.values()).sort((a, b) => b.total_cantidad - a.total_cantidad);

    const porBarbero = Array.from(barberMap.values())
      .map((b) => {
        const servCount = servicesByBarber.get(Number(b.id_barbero)) || 0;
        const costoPorServicio = servCount > 0 ? Math.round(b.total_costo / servCount) : b.total_costo;
        const insumosPorServicio = servCount > 0 ? Number((b.total_articulos / servCount).toFixed(2)) : b.total_articulos;

        let calificacion = "Uso Estándar";
        if (servCount > 0 && costoPorServicio > 8000) {
          calificacion = "Revisar Dosificación";
        } else if (servCount > 0 && costoPorServicio <= 4000) {
          calificacion = "Excelente Rendimiento";
        }

        return {
          ...b,
          servicios_realizados: servCount,
          costo_por_servicio: costoPorServicio,
          insumos_por_servicio: insumosPorServicio,
          calificacion_eficiencia: calificacion,
          productos: Array.from(b.productos.values()).sort((x, y) => y.cantidad - x.cantidad)
        };
      })
      .sort((a, b) => b.total_articulos - a.total_articulos);

    return {
      period,
      barberId,
      total_despachos: totalDespachos,
      total_articulos: totalArticulos,
      total_costo_estimado: totalCostoEstimado,
      total_servicios_periodo: totalServiciosPeriodo,
      costo_promedio_por_servicio: totalServiciosPeriodo > 0 ? Math.round(totalCostoEstimado / totalServiciosPeriodo) : 0,
      insumos_promedio_por_servicio: totalServiciosPeriodo > 0 ? Number((totalArticulos / totalServiciosPeriodo).toFixed(2)) : 0,
      top_consumibles: topConsumibles,
      por_barbero: porBarbero,
      despachos_recientes: periodSupplies.slice(0, 6)
    };
  }
}

export { SuppliesRepository as SuppliesModel };
export default SuppliesRepository;

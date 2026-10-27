/**
 * @file inventoryStation.model.js
 * Repositorio de datos para el Control de Insumos por Estación (Modelo Semáforo),
 * Bodega General, Proveedores, Entradas de Mercancía e Historial de Reposiciones.
 * Compatible con MySQL nativo y capa de resiliencia MockDataStore.
 */

import { executeQuery, executeTransaction, isDatabaseConnected } from "../config/db.js";
import { mockStore } from "../config/mockStore.js";
import { ApiError } from "../errors/apiError.js";

function getColombiaNowString() {
  return new Date().toLocaleString("en-CA", { timeZone: "America/Bogota", hour12: false }).replace(",", "");
}

function calculateDaysDifference(pastDateStr, currentDateStr = null) {
  if (!pastDateStr) return 0;
  const normalizedPast = typeof pastDateStr === "string" ? pastDateStr.replace(" ", "T") : pastDateStr;
  const past = new Date(normalizedPast);
  const current = currentDateStr ? new Date(typeof currentDateStr === "string" ? currentDateStr.replace(" ", "T") : currentDateStr) : new Date();
  if (isNaN(past.getTime()) || isNaN(current.getTime())) return 0;
  const diffTime = Math.max(0, current.getTime() - past.getTime());
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
}

export class InventoryStationRepository {
  // =========================================================================
  // 1. PROVEEDORES
  // =========================================================================

  static async getSuppliers({ search = "", status = "all" } = {}) {
    if (isDatabaseConnected()) {
      let sql = `
        SELECT id_proveedor, nombre, contacto, telefono, correo, direccion, notas, estado
        FROM proveedor
        WHERE 1=1
      `;
      const params = [];
      if (search) {
        sql += ` AND (LOWER(nombre) LIKE ? OR LOWER(contacto) LIKE ? OR LOWER(correo) LIKE ?)`;
        const s = `%${search.toLowerCase()}%`;
        params.push(s, s, s);
      }
      if (status !== "all") {
        sql += ` AND estado = ?`;
        params.push(Number(status));
      }
      sql += ` ORDER BY nombre ASC`;
      return await executeQuery(sql, params);
    }

    return (mockStore.proveedores || [])
      .filter((p) => {
        const s = (search || "").toLowerCase().trim();
        const matchesSearch =
          !s ||
          (p.nombre && p.nombre.toLowerCase().includes(s)) ||
          (p.contacto && p.contacto.toLowerCase().includes(s)) ||
          (p.correo && p.correo.toLowerCase().includes(s));
        const matchesStatus = status === "all" || Number(p.estado) === Number(status);
        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => (a.nombre || "").localeCompare(b.nombre || ""));
  }

  static async createSupplier(data) {
    if (isDatabaseConnected()) {
      const sql = `
        INSERT INTO proveedor (nombre, contacto, telefono, correo, direccion, notas, estado)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `;
      const result = await executeQuery(sql, [
        data.nombre,
        data.contacto || null,
        data.telefono || null,
        data.correo || null,
        data.direccion || null,
        data.notas || null,
        data.estado !== undefined ? Number(data.estado) : 1
      ]);
      return result.insertId;
    }

    if (!mockStore.proveedores) mockStore.proveedores = [];
    const nextId = Math.max(...mockStore.proveedores.map((p) => p.id_proveedor || 0), 0) + 1;
    const newProv = {
      id_proveedor: nextId,
      nombre: data.nombre,
      contacto: data.contacto || "",
      telefono: data.telefono || "",
      correo: data.correo || "",
      direccion: data.direccion || "",
      notas: data.notas || "",
      estado: data.estado !== undefined ? Number(data.estado) : 1
    };
    mockStore.proveedores.push(newProv);
    mockStore.saveToFile();
    return nextId;
  }

  // =========================================================================
  // 2. INSUMOS EN BODEGA GENERAL
  // =========================================================================

  static async getWarehouseItems({ search = "", category = "all", lowStockOnly = false } = {}) {
    if (isDatabaseConnected()) {
      let sql = `
        SELECT ib.id_insumo, ib.nombre, ib.categoria, ib.stock_actual, ib.stock_minimo,
               ib.unidad_medida, ib.id_proveedor, ib.costo_unitario, ib.estado, ib.fecha_registro,
               p.nombre as proveedor_nombre, p.contacto as proveedor_contacto, p.telefono as proveedor_telefono
        FROM insumo_bodega ib
        LEFT JOIN proveedor p ON ib.id_proveedor = p.id_proveedor
        WHERE ib.estado = 1
      `;
      const params = [];
      if (search) {
        sql += ` AND (LOWER(ib.nombre) LIKE ? OR LOWER(ib.categoria) LIKE ? OR LOWER(p.nombre) LIKE ?)`;
        const s = `%${search.toLowerCase()}%`;
        params.push(s, s, s);
      }
      if (category !== "all") {
        sql += ` AND ib.categoria = ?`;
        params.push(category);
      }
      if (lowStockOnly) {
        sql += ` AND ib.stock_actual <= ib.stock_minimo`;
      }
      sql += ` ORDER BY ib.stock_actual <= ib.stock_minimo DESC, ib.nombre ASC`;
      const rows = await executeQuery(sql, params);
      return rows.map((r) => ({
        ...r,
        bajo_stock: Number(r.stock_actual) <= Number(r.stock_minimo)
      }));
    }

    return (mockStore.insumos_bodega || [])
      .filter((item) => Number(item.estado) === 1)
      .map((item) => {
        const prov = (mockStore.proveedores || []).find((p) => Number(p.id_proveedor) === Number(item.id_proveedor));
        const isLow = Number(item.stock_actual) <= Number(item.stock_minimo);
        return {
          ...item,
          proveedor_nombre: prov ? prov.nombre : "Proveedor Directo",
          proveedor_contacto: prov ? prov.contacto : "",
          proveedor_telefono: prov ? prov.telefono : "",
          bajo_stock: isLow
        };
      })
      .filter((item) => {
        const s = (search || "").toLowerCase().trim();
        const matchesSearch =
          !s ||
          item.nombre.toLowerCase().includes(s) ||
          item.categoria.toLowerCase().includes(s) ||
          (item.proveedor_nombre && item.proveedor_nombre.toLowerCase().includes(s));
        const matchesCat = category === "all" || item.categoria === category;
        const matchesLow = !lowStockOnly || item.bajo_stock;
        return matchesSearch && matchesCat && matchesLow;
      })
      .sort((a, b) => {
        if (a.bajo_stock && !b.bajo_stock) return -1;
        if (!a.bajo_stock && b.bajo_stock) return 1;
        return a.nombre.localeCompare(b.nombre);
      });
  }

  static async findWarehouseItemById(id) {
    const numId = Number(id);
    if (isDatabaseConnected()) {
      const sql = `
        SELECT ib.*, p.nombre as proveedor_nombre
        FROM insumo_bodega ib
        LEFT JOIN proveedor p ON ib.id_proveedor = p.id_proveedor
        WHERE ib.id_insumo = ? LIMIT 1
      `;
      const rows = await executeQuery(sql, [numId]);
      return rows && rows.length > 0 ? rows[0] : null;
    }

    const item = (mockStore.insumos_bodega || []).find((i) => Number(i.id_insumo) === numId);
    if (!item) return null;
    const prov = (mockStore.proveedores || []).find((p) => Number(p.id_proveedor) === Number(item.id_proveedor));
    return {
      ...item,
      proveedor_nombre: prov ? prov.nombre : "Proveedor Directo"
    };
  }

  static async createWarehouseItem(data) {
    const now = getColombiaNowString();
    if (isDatabaseConnected()) {
      const sql = `
        INSERT INTO insumo_bodega (nombre, categoria, stock_actual, stock_minimo, unidad_medida, id_proveedor, costo_unitario, estado, fecha_registro)
        VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?)
      `;
      const result = await executeQuery(sql, [
        data.nombre,
        data.categoria || "General",
        Number(data.stock_actual || 0),
        Number(data.stock_minimo || 5),
        data.unidad_medida || "Unidad",
        data.id_proveedor ? Number(data.id_proveedor) : null,
        Number(data.costo_unitario || 0),
        now
      ]);
      return result.insertId;
    }

    if (!mockStore.insumos_bodega) mockStore.insumos_bodega = [];
    const nextId = Math.max(...mockStore.insumos_bodega.map((i) => i.id_insumo || 0), 0) + 1;
    const newItem = {
      id_insumo: nextId,
      nombre: data.nombre,
      categoria: data.categoria || "General",
      stock_actual: Number(data.stock_actual || 0),
      stock_minimo: Number(data.stock_minimo || 5),
      unidad_medida: data.unidad_medida || "Unidad",
      id_proveedor: data.id_proveedor ? Number(data.id_proveedor) : null,
      costo_unitario: Number(data.costo_unitario || 0),
      estado: 1,
      fecha_registro: now
    };
    mockStore.insumos_bodega.push(newItem);
    mockStore.saveToFile();
    return nextId;
  }

  static async updateWarehouseItem(id, data) {
    const numId = Number(id);
    const now = getColombiaNowString();

    const existing = await this.findWarehouseItemById(numId);
    if (!existing) {
      throw ApiError.notFound("Insumo de bodega no encontrado.");
    }

    let stockAnterior = Number(existing.stock_actual || 0);
    let stockNuevo = stockAnterior;
    let movimientoRealizado = null;

    // Procesar ajuste de inventario si se especificó tipo_movimiento y cantidad_ajuste
    if (data.tipo_movimiento && data.cantidad_ajuste !== undefined) {
      const qty = Number(data.cantidad_ajuste);
      if (isNaN(qty) || qty <= 0) {
        throw ApiError.badRequest("La cantidad a ajustar debe ser un número entero mayor que cero (> 0).");
      }

      const obs = (data.observaciones || "").trim();
      if (!obs || obs.length < 5) {
        throw ApiError.badRequest("El campo 'Observaciones del Movimiento' es obligatorio y debe tener al menos 5 caracteres.");
      }

      const normTipo = String(data.tipo_movimiento).toLowerCase();
      const isDescargo = normTipo.includes("descargo");
      const isCargo = !isDescargo && normTipo.includes("cargo");

      if (!isCargo && !isDescargo) {
        throw ApiError.badRequest("El tipo de movimiento debe ser 'Cargo por ajuste' o 'Descargo por ajuste'.");
      }

      if (isDescargo) {
        if (qty > stockAnterior) {
          throw ApiError.badRequest(
            `No se pueden descargar ${qty} unidades. El stock actual disponible en bodega es de ${stockAnterior} unidades.`
          );
        }
        stockNuevo = stockAnterior - qty;
      } else if (isCargo) {
        stockNuevo = stockAnterior + qty;
      }

      movimientoRealizado = {
        id_insumo: numId,
        tipo_movimiento: isDescargo ? "Descargo por ajuste" : "Cargo por ajuste",
        cantidad: qty,
        stock_anterior: stockAnterior,
        stock_nuevo: stockNuevo,
        observaciones: obs,
        fecha_movimiento: now
      };
    }

    if (isDatabaseConnected()) {
      try {
        await executeQuery(`
          CREATE TABLE IF NOT EXISTS movimiento_bodega (
            id_movimiento INT AUTO_INCREMENT PRIMARY KEY,
            id_insumo INT NOT NULL,
            tipo_movimiento VARCHAR(50) NOT NULL,
            cantidad INT NOT NULL,
            stock_anterior INT NOT NULL,
            stock_nuevo INT NOT NULL,
            observaciones TEXT NOT NULL,
            fecha_movimiento DATETIME NOT NULL
          )
        `);
      } catch (e) {}

      if (movimientoRealizado) {
        await executeQuery(
          `INSERT INTO movimiento_bodega (id_insumo, tipo_movimiento, cantidad, stock_anterior, stock_nuevo, observaciones, fecha_movimiento)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            movimientoRealizado.id_insumo,
            movimientoRealizado.tipo_movimiento,
            movimientoRealizado.cantidad,
            movimientoRealizado.stock_anterior,
            movimientoRealizado.stock_nuevo,
            movimientoRealizado.observaciones,
            movimientoRealizado.fecha_movimiento
          ]
        );
      }

      const sql = `
        UPDATE insumo_bodega
        SET nombre = ?, categoria = ?, stock_actual = ?, stock_minimo = COALESCE(?, stock_minimo),
            unidad_medida = COALESCE(?, unidad_medida), id_proveedor = ?, costo_unitario = ?
        WHERE id_insumo = ?
      `;
      await executeQuery(sql, [
        data.nombre,
        data.categoria || "General",
        stockNuevo,
        data.stock_minimo !== undefined ? Number(data.stock_minimo) : null,
        data.unidad_medida || null,
        data.id_proveedor ? Number(data.id_proveedor) : null,
        Number(data.costo_unitario || 0),
        numId
      ]);
      const updated = await this.findWarehouseItemById(numId);
      return {
        ...updated,
        movimiento: movimientoRealizado
      };
    }

    // Fallback MockStore
    if (!mockStore.movimientos_bodega) mockStore.movimientos_bodega = [];
    if (movimientoRealizado) {
      const nextMovId = Math.max(...mockStore.movimientos_bodega.map((m) => m.id_movimiento || 0), 0) + 1;
      mockStore.movimientos_bodega.push({
        id_movimiento: nextMovId,
        ...movimientoRealizado
      });
    }

    const item = (mockStore.insumos_bodega || []).find((i) => Number(i.id_insumo) === numId);
    if (item) {
      if (data.nombre !== undefined) item.nombre = data.nombre;
      if (data.categoria !== undefined) item.categoria = data.categoria;
      item.stock_actual = stockNuevo;
      if (data.stock_minimo !== undefined) item.stock_minimo = Number(data.stock_minimo);
      if (data.unidad_medida !== undefined) item.unidad_medida = data.unidad_medida;
      if (data.id_proveedor !== undefined) item.id_proveedor = data.id_proveedor ? Number(data.id_proveedor) : null;
      if (data.costo_unitario !== undefined) item.costo_unitario = Number(data.costo_unitario);
      mockStore.saveToFile();
    }

    return {
      ...item,
      movimiento: movimientoRealizado
    };
  }

  static async getWarehouseMovements({ idInsumo = "all", tipoMovimiento = "all", search = "", limit = 100 } = {}) {
    const s = (search || "").toLowerCase().trim();
    if (isDatabaseConnected()) {
      let sql = `
        SELECT mb.*, ib.nombre as insumo_nombre, ib.categoria as insumo_categoria,
               ib.unidad_medida, ib.costo_unitario, p.nombre as proveedor_nombre
        FROM movimiento_bodega mb
        JOIN insumo_bodega ib ON mb.id_insumo = ib.id_insumo
        LEFT JOIN proveedor p ON ib.id_proveedor = p.id_proveedor
        WHERE 1=1
      `;
      const params = [];
      if (idInsumo !== "all") {
        sql += ` AND mb.id_insumo = ?`;
        params.push(Number(idInsumo));
      }
      if (tipoMovimiento !== "all") {
        sql += ` AND LOWER(mb.tipo_movimiento) LIKE ?`;
        params.push(`%${tipoMovimiento.toLowerCase()}%`);
      }
      if (s) {
        sql += ` AND (LOWER(ib.nombre) LIKE ? OR LOWER(mb.observaciones) LIKE ? OR LOWER(ib.categoria) LIKE ?)`;
        params.push(`%${s}%`, `%${s}%`, `%${s}%`);
      }
      sql += ` ORDER BY mb.fecha_movimiento DESC, mb.id_movimiento DESC LIMIT ?`;
      params.push(Number(limit));
      return await executeQuery(sql, params);
    }

    return (mockStore.movimientos_bodega || [])
      .map((m) => {
        const ins = (mockStore.insumos_bodega || []).find((i) => Number(i.id_insumo) === Number(m.id_insumo));
        const prov = ins ? (mockStore.proveedores || []).find((p) => Number(p.id_proveedor) === Number(ins.id_proveedor)) : null;
        return {
          ...m,
          insumo_nombre: ins ? ins.nombre : "Insumo de Bodega",
          insumo_categoria: ins ? ins.categoria : "General",
          unidad_medida: ins ? ins.unidad_medida : "Unidad",
          costo_unitario: ins ? ins.costo_unitario : 0,
          proveedor_nombre: prov ? prov.nombre : "Proveedor Habitual"
        };
      })
      .filter((m) => {
        const matchesInsumo = idInsumo === "all" || Number(m.id_insumo) === Number(idInsumo);
        const matchesTipo = tipoMovimiento === "all" || (m.tipo_movimiento || "").toLowerCase().includes(tipoMovimiento.toLowerCase());
        const matchesSearch = !s ||
          (m.insumo_nombre && m.insumo_nombre.toLowerCase().includes(s)) ||
          (m.observaciones && m.observaciones.toLowerCase().includes(s)) ||
          (m.insumo_categoria && m.insumo_categoria.toLowerCase().includes(s));
        return matchesInsumo && matchesTipo && matchesSearch;
      })
      .sort((a, b) => (b.fecha_movimiento || "").localeCompare(a.fecha_movimiento || "") || (b.id_movimiento || 0) - (a.id_movimiento || 0))
      .slice(0, Number(limit));
  }

  static async deleteWarehouseItem(id) {
    const numId = Number(id);
    if (isDatabaseConnected()) {
      await executeQuery(`UPDATE insumo_bodega SET estado = 0 WHERE id_insumo = ?`, [numId]);
      return true;
    }
    const item = (mockStore.insumos_bodega || []).find((i) => Number(i.id_insumo) === numId);
    if (item) {
      item.estado = 0;
      mockStore.saveToFile();
    }
    return true;
  }

  // =========================================================================
  // 3. ENTRADAS DE MERCANCÍA (CARGAR DESDE PROVEEDOR -> SUMA STOCK EN BODEGA)
  // =========================================================================

  static async registerStockEntry({ id_insumo, id_proveedor, cantidad_ingresada, costo_unitario, observaciones = "" }) {
    const now = getColombiaNowString();
    const insumoId = Number(id_insumo);
    const provId = Number(id_proveedor);
    const qty = Number(cantidad_ingresada);
    const cost = Number(costo_unitario || 0);

    if (qty <= 0) {
      throw ApiError.badRequest("La cantidad ingresada debe ser mayor a cero.");
    }

    return await executeTransaction(async (conn) => {
      if (isDatabaseConnected() && conn) {
        // 1. Validar insumo
        const [insumos] = await conn.execute(`SELECT id_insumo, stock_actual, nombre FROM insumo_bodega WHERE id_insumo = ? LIMIT 1`, [insumoId]);
        if (!insumos || insumos.length === 0) {
          throw ApiError.notFound("El insumo de bodega no existe.");
        }

        // Asegurar columnas de anulación en MySQL si no existen
        try {
          await conn.execute("ALTER TABLE entrada_mercancia ADD COLUMN IF NOT EXISTS estado TINYINT NOT NULL DEFAULT 1");
          await conn.execute("ALTER TABLE entrada_mercancia ADD COLUMN IF NOT EXISTS fecha_anulacion DATETIME NULL");
          await conn.execute("ALTER TABLE entrada_mercancia ADD COLUMN IF NOT EXISTS motivo_anulacion TEXT NULL");
        } catch (e) {}

        // 2. Registrar entrada con estado 1 (Activa)
        const [entryRes] = await conn.execute(
          `INSERT INTO entrada_mercancia (id_insumo, id_proveedor, cantidad_ingresada, costo_unitario, fecha_ingreso, observaciones, estado)
           VALUES (?, ?, ?, ?, ?, ?, 1)`,
          [insumoId, provId, qty, cost, now, observaciones || "Ingreso de mercancía por proveedor"]
        );

        // 3. Sumar automáticamente al stock_actual de la bodega
        await conn.execute(
          `UPDATE insumo_bodega SET stock_actual = stock_actual + ?, costo_unitario = ? WHERE id_insumo = ?`,
          [qty, cost > 0 ? cost : undefined, insumoId]
        );

        return entryRes.insertId;
      }

      // Fallback MockDataStore
      if (!mockStore.entradas_mercancia) mockStore.entradas_mercancia = [];
      const insumo = (mockStore.insumos_bodega || []).find((i) => Number(i.id_insumo) === insumoId);
      if (!insumo) {
        throw ApiError.notFound("El insumo de bodega no existe.");
      }

      const nextEntryId = Math.max(...mockStore.entradas_mercancia.map((e) => e.id_entrada || 0), 0) + 1;
      const newEntry = {
        id_entrada: nextEntryId,
        id_insumo: insumoId,
        id_proveedor: provId,
        cantidad_ingresada: qty,
        costo_unitario: cost > 0 ? cost : Number(insumo.costo_unitario || 0),
        fecha_ingreso: now,
        observaciones: observaciones || "Ingreso de mercancía por proveedor",
        estado: 1,
        fecha_anulacion: null,
        motivo_anulacion: null
      };
      mockStore.entradas_mercancia.push(newEntry);

      // Sumar al stock_actual
      insumo.stock_actual = Number(insumo.stock_actual || 0) + qty;
      if (cost > 0) insumo.costo_unitario = cost;
      mockStore.saveToFile();

      return nextEntryId;
    });
  }

  static async getStockEntries({ insumoId = "all", limit = 50 } = {}) {
    if (isDatabaseConnected()) {
      let sql = `
        SELECT em.*, ib.nombre as insumo_nombre, ib.unidad_medida, p.nombre as proveedor_nombre
        FROM entrada_mercancia em
        JOIN insumo_bodega ib ON em.id_insumo = ib.id_insumo
        JOIN proveedor p ON em.id_proveedor = p.id_proveedor
        WHERE 1=1
      `;
      const params = [];
      if (insumoId !== "all") {
        sql += ` AND em.id_insumo = ?`;
        params.push(Number(insumoId));
      }
      sql += ` ORDER BY em.fecha_ingreso DESC LIMIT ?`;
      params.push(Number(limit));
      const rows = await executeQuery(sql, params);
      return (rows || []).map((r) => ({
        ...r,
        estado: r.estado !== undefined && r.estado !== null ? Number(r.estado) : 1,
        fecha_anulacion: r.fecha_anulacion || null,
        motivo_anulacion: r.motivo_anulacion || null
      }));
    }

    return (mockStore.entradas_mercancia || [])
      .map((entry) => {
        const ins = (mockStore.insumos_bodega || []).find((i) => Number(i.id_insumo) === Number(entry.id_insumo));
        const prov = (mockStore.proveedores || []).find((p) => Number(p.id_proveedor) === Number(entry.id_proveedor));
        return {
          ...entry,
          estado: entry.estado !== undefined ? Number(entry.estado) : 1,
          fecha_anulacion: entry.fecha_anulacion || null,
          motivo_anulacion: entry.motivo_anulacion || null,
          insumo_nombre: ins ? ins.nombre : "Insumo",
          unidad_medida: ins ? ins.unidad_medida : "Unidad",
          proveedor_nombre: prov ? prov.nombre : "Proveedor"
        };
      })
      .filter((e) => insumoId === "all" || Number(e.id_insumo) === Number(insumoId))
      .sort((a, b) => b.fecha_ingreso.localeCompare(a.fecha_ingreso))
      .slice(0, Number(limit));
  }

  static async cancelStockEntry(idEntrada, motivo) {
    const entryId = Number(idEntrada);
    const cleanMotivo = (motivo || "").trim();

    if (!cleanMotivo) {
      throw ApiError.badRequest("Debes ingresar obligatoriamente el motivo de la anulación.");
    }

    const now = new Date().toISOString().replace("T", " ").substring(0, 19);

    return await executeTransaction(async (conn) => {
      if (isDatabaseConnected()) {
        try {
          await conn.execute("ALTER TABLE entrada_mercancia ADD COLUMN IF NOT EXISTS estado TINYINT NOT NULL DEFAULT 1");
          await conn.execute("ALTER TABLE entrada_mercancia ADD COLUMN IF NOT EXISTS fecha_anulacion DATETIME NULL");
          await conn.execute("ALTER TABLE entrada_mercancia ADD COLUMN IF NOT EXISTS motivo_anulacion TEXT NULL");
        } catch (e) {}

        const [entries] = await conn.execute(
          `SELECT * FROM entrada_mercancia WHERE id_entrada = ? FOR UPDATE`,
          [entryId]
        );
        if (!entries || entries.length === 0) {
          throw ApiError.notFound("La entrada de mercancía no existe.");
        }

        const entry = entries[0];
        if (Number(entry.estado) === 0) {
          throw ApiError.badRequest("Esta entrada de mercancía ya se encuentra anulada.");
        }

        // 1. Marcar como anulada en la BD (conservando el historial)
        await conn.execute(
          `UPDATE entrada_mercancia 
           SET estado = 0, fecha_anulacion = ?, motivo_anulacion = ?
           WHERE id_entrada = ?`,
          [now, cleanMotivo, entryId]
        );

        // 2. Revertir (descontar) la cantidad del stock_actual en la bodega general
        await conn.execute(
          `UPDATE insumo_bodega 
           SET stock_actual = GREATEST(0, stock_actual - ?)
           WHERE id_insumo = ?`,
          [Number(entry.cantidad_ingresada), Number(entry.id_insumo)]
        );

        return {
          id_entrada: entryId,
          id_insumo: entry.id_insumo,
          cantidad_revertida: Number(entry.cantidad_ingresada),
          estado: 0,
          fecha_anulacion: now,
          motivo_anulacion: cleanMotivo
        };
      }

      // Fallback MockDataStore
      if (!mockStore.entradas_mercancia) mockStore.entradas_mercancia = [];
      const entry = mockStore.entradas_mercancia.find((e) => Number(e.id_entrada) === entryId);
      if (!entry) {
        throw ApiError.notFound("La entrada de mercancía no existe.");
      }

      if (Number(entry.estado) === 0) {
        throw ApiError.badRequest("Esta entrada de mercancía ya se encuentra anulada.");
      }

      // Revertir (descontar) la cantidad ingresada del stock_actual de la bodega
      const insumo = (mockStore.insumos_bodega || []).find((i) => Number(i.id_insumo) === Number(entry.id_insumo));
      if (insumo) {
        insumo.stock_actual = Math.max(0, Number(insumo.stock_actual || 0) - Number(entry.cantidad_ingresada));
      }

      // Marcar la entrada como anulada (NO se borra del historial)
      entry.estado = 0;
      entry.fecha_anulacion = now;
      entry.motivo_anulacion = cleanMotivo;

      mockStore.saveToFile();

      return {
        id_entrada: entryId,
        id_insumo: entry.id_insumo,
        cantidad_revertida: Number(entry.cantidad_ingresada),
        nuevo_stock_bodega: insumo ? insumo.stock_actual : 0,
        estado: 0,
        fecha_anulacion: now,
        motivo_anulacion: cleanMotivo
      };
    });
  }


  // =========================================================================
  // 4. ESTACIÓN DEL BARBERO (MODELO SEMÁFORO)
  // =========================================================================

  static async getAllStations({ barberId = "all", status = "all" } = {}) {
    const now = getColombiaNowString();

    if (isDatabaseConnected()) {
      let sql = `
        SELECT eb.id_estacion_insumo, eb.id_barbero, eb.id_insumo, eb.cantidad_asignada,
               eb.estado_semaforo, eb.fecha_ultima_reposicion, eb.fecha_cambio_estado, eb.notas,
               CONCAT(u.nombre, ' ', u.apellido) as barbero_nombre, u.correo as barbero_correo,
               b.especialidad as barbero_especialidad, b.imagen_url as barbero_foto,
               ib.nombre as insumo_nombre, ib.categoria as insumo_categoria, ib.stock_actual,
               ib.stock_minimo, ib.unidad_medida, ib.costo_unitario
        FROM estacion_barbero eb
        JOIN barbero b ON eb.id_barbero = b.id_barbero
        JOIN usuario u ON b.id_usuario = u.id_usuario
        JOIN insumo_bodega ib ON eb.id_insumo = ib.id_insumo
        WHERE ib.estado = 1
      `;
      const params = [];
      if (barberId !== "all") {
        sql += ` AND eb.id_barbero = ?`;
        params.push(Number(barberId));
      }
      if (status !== "all") {
        sql += ` AND eb.estado_semaforo = ?`;
        params.push(status);
      }
      // Prioridad semáforo: ROJO (1), AMARILLO (2), VERDE (3)
      sql += ` ORDER BY FIELD(eb.estado_semaforo, 'ROJO', 'AMARILLO', 'VERDE'), eb.fecha_cambio_estado DESC`;
      const rows = await executeQuery(sql, params);

      return rows.map((r) => ({
        ...r,
        dias_en_estacion: calculateDaysDifference(r.fecha_ultima_reposicion, now),
        bodega_disponible: Number(r.stock_actual) > 0
      }));
    }

    return (mockStore.estaciones_barberos || [])
      .map((item) => {
        const idEstacion = Number(item.id_estacion_insumo || item.id_estacion_item || 0);
        const barberId = Number(item.id_barbero || item.barbero_id || 0);
        const insumoId = Number(item.id_insumo || item.insumo_id || 0);

        const b = (mockStore.barberos || []).find((barb) => Number(barb.id_barbero) === barberId);
        const u = b ? (mockStore.usuarios || []).find((usr) => Number(usr.id_usuario) === Number(b.id_usuario)) : null;
        const ins = (mockStore.insumos_bodega || []).find((i) => Number(i.id_insumo) === insumoId);

        const days = calculateDaysDifference(item.fecha_ultima_reposicion, now);
        return {
          ...item,
          id_estacion_insumo: idEstacion,
          id_estacion_item: idEstacion,
          id_barbero: barberId,
          barbero_id: barberId,
          id_insumo: insumoId,
          insumo_id: insumoId,
          barbero_nombre: u ? `${u.nombre} ${u.apellido || ""}`.trim() : "Barbero",
          barbero_correo: u ? u.correo : "",
          barbero_especialidad: b ? b.especialidad : "Barbero Profesional",
          barbero_foto: b ? b.imagen_url : null,
          insumo_nombre: ins ? ins.nombre : "Insumo de Estación",
          insumo_categoria: ins ? ins.categoria : "General",
          stock_actual: ins ? Number(ins.stock_actual) : 0,
          stock_minimo: ins ? Number(ins.stock_minimo) : 5,
          unidad_medida: ins ? ins.unidad_medida : "Unidad",
          costo_unitario: ins ? Number(ins.costo_unitario) : 0,
          dias_en_estacion: days,
          dias_en_uso: days,
          bodega_disponible: ins ? Number(ins.stock_actual) > 0 : false
        };
      })
      .filter((item) => {
        const matchesBarber = barberId === "all" || Number(item.id_barbero) === Number(barberId);
        const matchesStatus = status === "all" || item.estado_semaforo === status;
        return matchesBarber && matchesStatus;
      })
      .sort((a, b) => {
        const priority = { ROJO: 0, AMARILLO: 1, VERDE: 2 };
        const prioDiff = (priority[a.estado_semaforo] ?? 3) - (priority[b.estado_semaforo] ?? 3);
        if (prioDiff !== 0) return prioDiff;
        return (b.fecha_cambio_estado || "").localeCompare(a.fecha_cambio_estado || "");
      });
  }

  static async getBarberStation(barberId) {
    return await this.getAllStations({ barberId: Number(barberId) });
  }

  static async assignItemToStation({ id_barbero, id_insumo, cantidad_asignada = 1, notas = "" }) {
    const now = getColombiaNowString();
    const bId = Number(id_barbero);
    const iId = Number(id_insumo);

    if (isDatabaseConnected()) {
      // Verificar si ya está asignado
      const [existing] = await executeQuery(
        `SELECT id_estacion_insumo FROM estacion_barbero WHERE id_barbero = ? AND id_insumo = ? LIMIT 1`,
        [bId, iId]
      );
      if (existing && existing.length > 0) {
        throw ApiError.conflict("Este insumo ya se encuentra asignado a la estación de este barbero.");
      }

      const sql = `
        INSERT INTO estacion_barbero (id_barbero, id_insumo, cantidad_asignada, estado_semaforo, fecha_ultima_reposicion, fecha_cambio_estado, notas)
        VALUES (?, ?, ?, 'VERDE', ?, ?, ?)
      `;
      const result = await executeQuery(sql, [bId, iId, Number(cantidad_asignada || 1), now, now, notas || ""]);
      return result.insertId;
    }

    if (!mockStore.estaciones_barberos) mockStore.estaciones_barberos = [];
    const exists = mockStore.estaciones_barberos.some(
      (e) =>
        Number(e.id_barbero || e.barbero_id) === bId &&
        Number(e.id_insumo || e.insumo_id) === iId
    );
    if (exists) {
      throw ApiError.conflict("Este insumo ya se encuentra asignado a la estación de este barbero.");
    }

    const nextId =
      Math.max(
        ...mockStore.estaciones_barberos.map(
          (e) => Number(e.id_estacion_insumo || e.id_estacion_item || 0)
        ),
        0
      ) + 1;
    const newStationItem = {
      id_estacion_insumo: nextId,
      id_estacion_item: nextId,
      id_barbero: bId,
      barbero_id: bId,
      id_insumo: iId,
      insumo_id: iId,
      cantidad_asignada: Number(cantidad_asignada || 1),
      estado_semaforo: "VERDE",
      fecha_ultima_reposicion: now,
      fecha_cambio_estado: now,
      notas: notas || ""
    };
    mockStore.estaciones_barberos.push(newStationItem);
    mockStore.saveToFile();
    return nextId;
  }

  static async updateStationItemStatus(idEstacionInsumo, newStatus, notas = "", cantidadAsignada = undefined) {
    const validStatuses = ["VERDE", "AMARILLO", "ROJO"];
    if (!validStatuses.includes(newStatus)) {
      throw ApiError.badRequest("Estado de semáforo no válido. Opciones: VERDE, AMARILLO, ROJO.");
    }
    const now = getColombiaNowString();
    const stationId = Number(idEstacionInsumo);

    if (isDatabaseConnected()) {
      let sql = `
        UPDATE estacion_barbero
        SET estado_semaforo = ?, fecha_cambio_estado = ?, notas = COALESCE(NULLIF(?, ''), notas)
      `;
      const params = [newStatus, now, notas];
      if (cantidadAsignada !== undefined && !isNaN(Number(cantidadAsignada))) {
        sql += `, cantidad_asignada = ?`;
        params.push(Math.max(0, Number(cantidadAsignada)));
      }
      sql += ` WHERE id_estacion_insumo = ?`;
      params.push(stationId);

      await executeQuery(sql, params);
      const [updated] = await executeQuery(`SELECT * FROM estacion_barbero WHERE id_estacion_insumo = ? LIMIT 1`, [stationId]);
      return updated && updated.length > 0 ? updated[0] : null;
    }

    const item = (mockStore.estaciones_barberos || []).find((e) => Number(e.id_estacion_insumo || e.id_estacion_item) === stationId);
    if (!item) {
      throw ApiError.notFound("Registro de insumo en estación no encontrado.");
    }
    item.estado_semaforo = newStatus;
    item.fecha_cambio_estado = now;
    if (notas) item.notas = notas;
    if (cantidadAsignada !== undefined && !isNaN(Number(cantidadAsignada))) {
      item.cantidad_asignada = Math.max(0, Number(cantidadAsignada));
    }
    mockStore.saveToFile();
    return item;
  }

  static async deleteStationItem(idEstacionInsumo) {
    const stationId = Number(idEstacionInsumo);
    if (isDatabaseConnected()) {
      await executeQuery(`DELETE FROM estacion_barbero WHERE id_estacion_insumo = ?`, [stationId]);
      return true;
    }
    const idx = (mockStore.estaciones_barberos || []).findIndex((e) => Number(e.id_estacion_insumo || e.id_estacion_item) === stationId);
    if (idx >= 0) {
      mockStore.estaciones_barberos.splice(idx, 1);
      mockStore.saveToFile();
    }
    return true;
  }

  // =========================================================================
  // 5. APROBACIÓN DE REPOSICIÓN (TRANSACCIÓN ACID)
  // =========================================================================

  static async approveRestock(idEstacionInsumo, { cantidad = 1, observaciones = "", id_usuario = 1 } = {}) {
    const stationId = Number(idEstacionInsumo);
    const qty = Math.max(1, Number(cantidad || 1));
    const now = getColombiaNowString();

    return await executeTransaction(async (conn) => {
      if (isDatabaseConnected() && conn) {
        // 1. Obtener datos del insumo en la estación
        const [stationRows] = await conn.execute(
          `SELECT eb.*, ib.nombre as insumo_nombre, ib.stock_actual, ib.costo_unitario
           FROM estacion_barbero eb
           JOIN insumo_bodega ib ON eb.id_insumo = ib.id_insumo
           WHERE eb.id_estacion_insumo = ? LIMIT 1`,
          [stationId]
        );
        if (!stationRows || stationRows.length === 0) {
          throw ApiError.notFound("Insumo de estación no encontrado.");
        }
        const stationItem = stationRows[0];

        // 2. Verificar que haya stock suficiente en la bodega general
        if (Number(stationItem.stock_actual) < qty) {
          throw ApiError.conflict(
            `Stock insuficiente en bodega general para reponer '${stationItem.insumo_nombre}'. Stock disponible: ${stationItem.stock_actual}, solicitado: ${qty}.`
          );
        }

        // 3. Restar la cantidad entregada del stock_actual de la bodega
        await conn.execute(
          `UPDATE insumo_bodega SET stock_actual = stock_actual - ? WHERE id_insumo = ?`,
          [qty, stationItem.id_insumo]
        );

        // 4. Calcular días transcurridos desde fecha_ultima_reposicion hasta hoy
        const diasPasados = calculateDaysDifference(stationItem.fecha_ultima_reposicion, now);

        // 5. Guardar registro en HistorialReposicion
        const [histRes] = await conn.execute(
          `INSERT INTO historial_reposicion (id_barbero, id_insumo, cantidad_entregada, fecha_reposicion, dias_duracion_anterior, observaciones)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [
            stationItem.id_barbero,
            stationItem.id_insumo,
            qty,
            now,
            diasPasados,
            observaciones || `Reposición aprobada (${qty} un.). Ciclo de uso anterior: ${diasPasados} días.`
          ]
        );

        // 6. Actualizar registro en EstacionBarbero: estado_semaforo = 'VERDE', fecha_ultima_reposicion = hoy, cantidad_asignada = acumular
        await conn.execute(
          `UPDATE estacion_barbero
           SET estado_semaforo = 'VERDE', fecha_ultima_reposicion = ?, fecha_cambio_estado = ?,
               cantidad_asignada = GREATEST(?, COALESCE(cantidad_asignada, 0) + ?),
               notas = CONCAT('Repuesto (', ?, ' un.) el ', ?, '. Última duración: ', ?, ' días.')
           WHERE id_estacion_insumo = ?`,
          [now, now, qty, qty, qty, now.substring(0, 10), diasPasados, stationId]
        );

        // 7. Crear automáticamente el Vale de Despacho (abastecimiento y abastecimiento_detalle)
        // para que cuente de inmediato en las métricas, tarjetas y gráficas de consumo
        const unitCost = Number(stationItem.costo_unitario || 0) > 0 ? Number(stationItem.costo_unitario) : 15000;
        const subtotal = qty * unitCost;

        const [aRes] = await conn.execute(
          `INSERT INTO abastecimiento (id_barbero, id_usuario, fecha, observaciones, total_estimado, estado)
           VALUES (?, ?, ?, ?, ?, 'Registrado')`,
          [
            stationItem.id_barbero,
            Number(id_usuario || 1),
            now,
            observaciones || `Reposición de puesto aprobada: ${qty} un. de ${stationItem.insumo_nombre}`,
            subtotal
          ]
        );
        const newSupplyId = aRes.insertId;

        await conn.execute(
          `INSERT INTO abastecimiento_detalle (id_abastecimiento, id_producto, cantidad, precio_unitario, subtotal)
           VALUES (?, ?, ?, ?, ?)`,
          [
            newSupplyId,
            stationItem.id_insumo,
            qty,
            unitCost,
            subtotal
          ]
        );

        return {
          id_estacion_insumo: stationId,
          id_historial: histRes.insertId,
          id_abastecimiento: newSupplyId,
          id_insumo: stationItem.id_insumo,
          id_barbero: stationItem.id_barbero,
          insumo_nombre: stationItem.insumo_nombre,
          dias_duracion_anterior: diasPasados,
          nuevo_estado: "VERDE",
          nuevo_stock_bodega: Number(stationItem.stock_actual) - qty,
          fecha_reposicion: now
        };
      }

      // Fallback MockDataStore
      if (!mockStore.estaciones_barberos) mockStore.estaciones_barberos = [];
      if (!mockStore.historial_reposiciones) mockStore.historial_reposiciones = [];
      if (!mockStore.abastecimientos) mockStore.abastecimientos = [];
      if (!mockStore.abastecimiento_detalles) mockStore.abastecimiento_detalles = [];

      const stationItem = mockStore.estaciones_barberos.find((e) => Number(e.id_estacion_insumo || e.id_estacion_item) === stationId);
      if (!stationItem) {
        throw ApiError.notFound("Insumo de estación no encontrado.");
      }

      const insId = Number(stationItem.id_insumo || stationItem.insumo_id);
      const warehouseItem = (mockStore.insumos_bodega || []).find((i) => Number(i.id_insumo) === insId);
      if (!warehouseItem) {
        throw ApiError.notFound("Insumo de bodega asociado no encontrado.");
      }

      // Validar stock disponible
      if (Number(warehouseItem.stock_actual) < qty) {
        throw ApiError.conflict(
          `Stock insuficiente en bodega general para reponer '${warehouseItem.nombre}'. Stock disponible: ${warehouseItem.stock_actual}, solicitado: ${qty}.`
        );
      }

      // Restar stock
      warehouseItem.stock_actual = Math.max(0, Number(warehouseItem.stock_actual) - qty);

      // Calcular días
      const diasPasados = calculateDaysDifference(stationItem.fecha_ultima_reposicion, now);

      const barberId = Number(stationItem.id_barbero || stationItem.barbero_id || 0);
      const insumoId = Number(stationItem.id_insumo || stationItem.insumo_id || 0);

      // Guardar en historial
      const nextHistId =
        Math.max(...mockStore.historial_reposiciones.map((h) => Number(h.id_historial || 0)), 0) + 1;
      mockStore.historial_reposiciones.push({
        id_historial: nextHistId,
        id_barbero: barberId,
        barbero_id: barberId,
        id_insumo: insumoId,
        insumo_id: insumoId,
        cantidad_entregada: qty,
        fecha_reposicion: now,
        dias_duracion_anterior: diasPasados,
        observaciones:
          observaciones || `Reposición aprobada (${qty} un.). Ciclo de uso anterior: ${diasPasados} días.`
      });

      // Actualizar estación
      stationItem.id_estacion_insumo = stationId;
      stationItem.id_estacion_item = stationId;
      stationItem.id_barbero = barberId;
      stationItem.barbero_id = barberId;
      stationItem.id_insumo = insumoId;
      stationItem.insumo_id = insumoId;
      stationItem.cantidad_asignada = Math.max(qty, Number(stationItem.cantidad_asignada || 0) + qty);
      stationItem.estado_semaforo = "VERDE";
      stationItem.fecha_ultima_reposicion = now;
      stationItem.fecha_cambio_estado = now;
      stationItem.notas = `Repuesto (${qty} un.) el ${now.substring(0, 10)}. Duración ciclo anterior: ${diasPasados} días.`;

      // Registrar Vale de Despacho en abastecimiento para que impacte de inmediato las estadísticas y gráficas
      const unitCost = Number(warehouseItem.costo_unitario || 0) > 0 ? Number(warehouseItem.costo_unitario) : 15000;
      const subtotal = qty * unitCost;
      const nextSupplyId = Math.max(...mockStore.abastecimientos.map((a) => Number(a.id_abastecimiento || 0)), 0) + 1;
      const nextDetId = Math.max(...mockStore.abastecimiento_detalles.map((d) => Number(d.id_abastecimiento_detalle || 0)), 0) + 1;

      mockStore.abastecimientos.push({
        id_abastecimiento: nextSupplyId,
        id_barbero: barberId,
        id_usuario: Number(id_usuario || 1),
        fecha: now,
        observaciones: observaciones || `Reposición aprobada: ${qty} un. de ${warehouseItem.nombre}`,
        total_estimado: subtotal,
        estado: "Registrado"
      });

      mockStore.abastecimiento_detalles.push({
        id_abastecimiento_detalle: nextDetId,
        id_abastecimiento: nextSupplyId,
        id_producto: insumoId,
        cantidad: qty,
        precio_unitario: unitCost,
        subtotal: subtotal
      });

      mockStore.saveToFile();

      return {
        id_estacion_insumo: stationId,
        id_historial: nextHistId,
        id_abastecimiento: nextSupplyId,
        id_insumo: insumoId,
        id_barbero: barberId,
        insumo_nombre: warehouseItem.nombre,
        dias_duracion_anterior: diasPasados,
        nuevo_estado: "VERDE",
        nuevo_stock_bodega: warehouseItem.stock_actual,
        fecha_reposicion: now
      };
    });
  }

  // =========================================================================
  // 6. HISTORIAL DE REPOSICIONES Y MÉTRICAS DE RENDIMIENTO
  // =========================================================================

  static async getRestockHistory({ barberId = "all", insumoId = "all", limit = 100 } = {}) {
    if (isDatabaseConnected()) {
      let sql = `
        SELECT hr.*, CONCAT(u.nombre, ' ', u.apellido) as barbero_nombre,
               ib.nombre as insumo_nombre, ib.unidad_medida, ib.categoria as insumo_categoria
        FROM historial_reposicion hr
        JOIN barbero b ON hr.id_barbero = b.id_barbero
        JOIN usuario u ON b.id_usuario = u.id_usuario
        JOIN insumo_bodega ib ON hr.id_insumo = ib.id_insumo
        WHERE 1=1
      `;
      const params = [];
      if (barberId !== "all") {
        sql += ` AND hr.id_barbero = ?`;
        params.push(Number(barberId));
      }
      if (insumoId !== "all") {
        sql += ` AND hr.id_insumo = ?`;
        params.push(Number(insumoId));
      }
      sql += ` ORDER BY hr.fecha_reposicion DESC LIMIT ?`;
      params.push(Number(limit));
      return await executeQuery(sql, params);
    }

    return (mockStore.historial_reposiciones || [])
      .map((item) => {
        const b = (mockStore.barberos || []).find((barb) => Number(barb.id_barbero) === Number(item.id_barbero));
        const u = b ? (mockStore.usuarios || []).find((usr) => Number(usr.id_usuario) === Number(b.id_usuario)) : null;
        const ins = (mockStore.insumos_bodega || []).find((i) => Number(i.id_insumo) === Number(item.id_insumo));
        return {
          ...item,
          barbero_nombre: u ? `${u.nombre} ${u.apellido || ""}`.trim() : "Barbero",
          insumo_nombre: ins ? ins.nombre : "Insumo",
          unidad_medida: ins ? ins.unidad_medida : "Unidad",
          insumo_categoria: ins ? ins.categoria : "General"
        };
      })
      .filter((h) => {
        const matchesBarber = barberId === "all" || Number(h.id_barbero) === Number(barberId);
        const matchesInsumo = insumoId === "all" || Number(h.id_insumo) === Number(insumoId);
        return matchesBarber && matchesInsumo;
      })
      .sort((a, b) => b.fecha_reposicion.localeCompare(a.fecha_reposicion))
      .slice(0, Number(limit));
  }

  static async getPerformanceMetrics({ barberId = "all" } = {}) {
    const stations = await this.getAllStations({ barberId });
    const history = await this.getRestockHistory({ barberId, limit: 500 });
    const warehouse = await this.getWarehouseItems();

    // Contadores globales
    let countRojo = 0;
    let countAmarillo = 0;
    let countVerde = 0;

    stations.forEach((s) => {
      if (s.estado_semaforo === "ROJO") countRojo++;
      else if (s.estado_semaforo === "AMARILLO") countAmarillo++;
      else countVerde++;
    });

    const lowStockWarehouseCount = warehouse.filter((w) => w.bajo_stock).length;

    // 1. Agrupamiento por barbero para métricas consolidadas (1 sola tarjeta por barbero)
    const barberMap = new Map();

    // Obtener todos los barberos registrados para incluirlos siempre (presentes y futuros)
    if (isDatabaseConnected()) {
      try {
        const registeredBarbers = await executeQuery(`
          SELECT b.id_barbero, CONCAT(u.nombre, ' ', u.apellido) as barbero_nombre,
                 u.correo as barbero_correo, b.especialidad as barbero_especialidad, b.imagen_url as barbero_foto
          FROM barbero b
          JOIN usuario u ON b.id_usuario = u.id_usuario
          WHERE u.estado = 1
        `);
        (registeredBarbers || []).forEach((b) => {
          const bId = Number(b.id_barbero);
          if (bId && !barberMap.has(bId)) {
            barberMap.set(bId, {
              id_barbero: bId,
              barbero_nombre: b.barbero_nombre || "Barbero",
              barbero_correo: b.barbero_correo || "",
              barbero_especialidad: b.barbero_especialidad || "Barbero Profesional",
              barbero_foto: b.barbero_foto || null,
              insumos: [],
              historialCiclos: []
            });
          }
        });
      } catch (err) {}
    } else {
      (mockStore.barberos || []).forEach((b) => {
        const u = (mockStore.usuarios || []).find((usr) => Number(usr.id_usuario) === Number(b.id_usuario));
        const bId = Number(b.id_barbero);
        if (bId && !barberMap.has(bId)) {
          barberMap.set(bId, {
            id_barbero: bId,
            barbero_nombre: u ? `${u.nombre} ${u.apellido || ""}`.trim() : (b.nombre || "Barbero"),
            barbero_correo: u ? u.correo : "",
            barbero_especialidad: b.especialidad || "Barbero Profesional",
            barbero_foto: b.imagen_url || null,
            insumos: [],
            historialCiclos: []
          });
        }
      });
    }

    stations.forEach((s) => {
      const bId = Number(s.id_barbero || s.barbero_id);
      if (!bId) return;
      if (!barberMap.has(bId)) {
        barberMap.set(bId, {
          id_barbero: bId,
          barbero_nombre: s.barbero_nombre || "Barbero",
          barbero_correo: s.barbero_correo || "",
          barbero_especialidad: s.barbero_especialidad || "Barbero Profesional",
          barbero_foto: s.barbero_foto || null,
          insumos: [],
          historialCiclos: []
        });
      }
      barberMap.get(bId).insumos.push(s);
    });

    history.forEach((h) => {
      const bId = Number(h.id_barbero || h.barbero_id);
      if (!bId) return;
      if (!barberMap.has(bId)) {
        barberMap.set(bId, {
          id_barbero: bId,
          barbero_nombre: h.barbero_nombre || "Barbero",
          barbero_correo: "",
          barbero_especialidad: "Barbero Profesional",
          barbero_foto: null,
          insumos: [],
          historialCiclos: []
        });
      }
      barberMap.get(bId).historialCiclos.push(h);
    });

    const promediosPorBarbero = Array.from(barberMap.values()).map((barber) => {
      const assigned = barber.insumos || [];
      const historyList = barber.historialCiclos || [];

      // Si el barbero no tiene insumos asignados ni historial, todas sus métricas son 0 reales
      if (assigned.length === 0 && historyList.length === 0) {
        return {
          id_barbero: barber.id_barbero,
          barbero_nombre: barber.barbero_nombre,
          barbero_correo: barber.barbero_correo,
          barbero_especialidad: barber.barbero_especialidad,
          barbero_foto: barber.barbero_foto,
          promedioDiasGlobal: 0,
          diasActualPromedio: 0,
          totalInsumosAsignados: 0,
          totalReposicionesCompletadas: 0,
          conteoVerde: 0,
          conteoAmarillo: 0,
          conteoRojo: 0,
          estadoGlobal: "VACIO",
          insumos: []
        };
      }

      // Duraciones históricas registradas de este barbero (> 0)
      const validHistoricalDurations = historyList
        .map((h) => Number(h.dias_duracion_anterior))
        .filter((d) => d > 0);

      // Calcular promedio por cada insumo asignado a este barbero
      const insumosConMetricas = assigned.map((item) => {
        const itemHistory = historyList.filter(
          (h) => Number(h.id_insumo) === Number(item.id_insumo) && Number(h.dias_duracion_anterior) > 0
        );
        const itemDurations = itemHistory.map((h) => Number(h.dias_duracion_anterior));

        let avg = 0;
        if (itemDurations.length > 0) {
          avg = Math.round(itemDurations.reduce((acc, d) => acc + d, 0) / itemDurations.length);
        } else {
          // Si no tiene historial previo este barbero, buscar promedio del mismo insumo en toda la barbería
          const shopHistory = history.filter(
            (h) => Number(h.id_insumo) === Number(item.id_insumo) && Number(h.dias_duracion_anterior) > 0
          );
          if (shopHistory.length > 0) {
            avg = Math.round(shopHistory.reduce((acc, h) => acc + Number(h.dias_duracion_anterior), 0) / shopHistory.length);
          } else {
            avg = 0; // Primer ciclo en uso (sin métrica histórica previa)
          }
        }

        const currentDays = Number(item.dias_en_estacion || 0);
        const diff = avg > 0 ? currentDays - avg : 0;
        const isOver = avg > 0 ? diff > 0 : false;
        const pct = avg > 0 ? Math.min(100, Math.round((currentDays / avg) * 100)) : (currentDays > 0 ? 50 : 0);

        return {
          id_insumo: item.id_insumo,
          id_estacion_insumo: item.id_estacion_insumo,
          insumo_nombre: item.insumo_nombre,
          insumo_categoria: item.insumo_categoria,
          unidad_medida: item.unidad_medida,
          estado_semaforo: item.estado_semaforo,
          stock_actual: item.stock_actual,
          promedioDiasDuracion: avg,
          diasActualEnUso: currentDays,
          diffFromAvg: diff,
          isOverAvg: isOver,
          totalReposiciones: itemHistory.length,
          porcentajeCiclo: pct
        };
      });

      // Promedio general de duración de insumos para este barbero
      let avgGlobal = 0;
      if (validHistoricalDurations.length > 0) {
        avgGlobal = Math.round(
          validHistoricalDurations.reduce((sum, d) => sum + d, 0) / validHistoricalDurations.length
        );
      } else {
        const validItemAvgs = insumosConMetricas.map((i) => i.promedioDiasDuracion).filter((d) => d > 0);
        if (validItemAvgs.length > 0) {
          avgGlobal = Math.round(validItemAvgs.reduce((sum, i) => sum + i, 0) / validItemAvgs.length);
        } else {
          avgGlobal = 0;
        }
      }

      // Días promedio en uso actual
      const avgDiasActual = insumosConMetricas.length > 0
        ? Math.round(insumosConMetricas.reduce((sum, i) => sum + i.diasActualEnUso, 0) / insumosConMetricas.length)
        : 0;

      const verdeCount = assigned.filter((i) => i.estado_semaforo === "VERDE").length;
      const amarilloCount = assigned.filter((i) => i.estado_semaforo === "AMARILLO").length;
      const rojoCount = assigned.filter((i) => i.estado_semaforo === "ROJO").length;

      const globalState =
        assigned.length === 0
          ? "VACIO"
          : rojoCount > 0
          ? "ROJO"
          : amarilloCount > 0
          ? "AMARILLO"
          : "VERDE";

      return {
        id_barbero: barber.id_barbero,
        barbero_nombre: barber.barbero_nombre,
        barbero_correo: barber.barbero_correo,
        barbero_especialidad: barber.barbero_especialidad,
        barbero_foto: barber.barbero_foto,
        promedioDiasGlobal: avgGlobal,
        diasActualPromedio: avgDiasActual,
        totalInsumosAsignados: assigned.length,
        totalReposicionesCompletadas: historyList.length,
        conteoVerde: verdeCount,
        conteoAmarillo: amarilloCount,
        conteoRojo: rojoCount,
        estadoGlobal: globalState,
        insumos: insumosConMetricas
      };
    });

    // 2. Formato por pares insumo-barbero (compatibilidad previa)
    const grouping = {};
    history.forEach((h) => {
      const key = `${h.id_barbero}_${h.id_insumo}`;
      if (!grouping[key]) {
        grouping[key] = {
          id_barbero: h.id_barbero,
          barbero_nombre: h.barbero_nombre,
          id_insumo: h.id_insumo,
          insumo_nombre: h.insumo_nombre,
          insumo_categoria: h.insumo_categoria,
          durations: [],
          totalReposiciones: 0
        };
      }
      grouping[key].totalReposiciones += 1;
      if (Number(h.dias_duracion_anterior) > 0) {
        grouping[key].durations.push(Number(h.dias_duracion_anterior));
      }
    });

    const durationMetrics = Object.values(grouping).map((g) => {
      const avg = g.durations.length > 0
        ? Math.round(g.durations.reduce((sum, d) => sum + d, 0) / g.durations.length)
        : 0;

      const currentStation = stations.find(
        (s) => Number(s.id_barbero) === Number(g.id_barbero) && Number(s.id_insumo) === Number(g.id_insumo)
      );

      return {
        ...g,
        promedioDiasDuracion: avg,
        diasActualEnUso: currentStation ? currentStation.dias_en_estacion : 0,
        estadoActual: currentStation ? currentStation.estado_semaforo : "VERDE"
      };
    });

    return {
      resumenSemaforo: {
        rojo: countRojo,
        amarillo: countAmarillo,
        verde: countVerde,
        totalAsignaciones: stations.length,
        alertasActivas: countRojo + countAmarillo
      },
      resumenBodega: {
        totalInsumos: warehouse.length,
        stockBajoCount: lowStockWarehouseCount
      },
      promediosDuracion: durationMetrics,
      promediosPorBarbero: promediosPorBarbero,
      totalReposicionesHistoricas: history.length
    };
  }
}

import { executeQuery, isDatabaseConnected } from "../config/db.js";
import { mockStore } from "../config/mockStore.js";

export class SuppliersRepository {
  static async findAll({ search = "", status = "all" } = {}) {
    if (isDatabaseConnected()) {
      let sql = `
        SELECT id_proveedor, nombre, nit, telefono, correo, direccion, estado
        FROM proveedor
        WHERE 1=1
      `;
      const params = [];

      if (search) {
        sql += ` AND (LOWER(nombre) LIKE ? OR LOWER(nit) LIKE ? OR LOWER(correo) LIKE ?)`;
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

    return mockStore.proveedores
      .filter((p) => {
        const s = (search || "").toLowerCase().trim();
        const matchesSearch =
          s === "" ||
          p.nombre.toLowerCase().includes(s) ||
          (p.nit || "").toLowerCase().includes(s) ||
          (p.correo || "").toLowerCase().includes(s);

        const matchesStatus =
          status === "all" ||
          (status === "1" && p.estado === 1) ||
          (status === "0" && p.estado === 0);

        return matchesSearch && matchesStatus;
      });
  }

  static async findById(id) {
    const supplierId = Number(id);

    if (isDatabaseConnected()) {
      const sql = `SELECT * FROM proveedor WHERE id_proveedor = ? LIMIT 1`;
      const rows = await executeQuery(sql, [supplierId]);
      return rows && rows.length > 0 ? rows[0] : null;
    }

    return mockStore.proveedores.find((p) => p.id_proveedor === supplierId) || null;
  }

  static async findByNit(nit) {
    if (!nit) return null;
    const cleanNit = nit.trim();

    if (isDatabaseConnected()) {
      const sql = `SELECT * FROM proveedor WHERE nit = ? LIMIT 1`;
      const rows = await executeQuery(sql, [cleanNit]);
      return rows && rows.length > 0 ? rows[0] : null;
    }

    return mockStore.proveedores.find((p) => p.nit === cleanNit) || null;
  }

  static async create(supplierData) {
    if (isDatabaseConnected()) {
      const sql = `
        INSERT INTO proveedor (nombre, nit, telefono, correo, direccion, estado)
        VALUES (?, ?, ?, ?, ?, ?)
      `;
      const result = await executeQuery(sql, [
        supplierData.nombre,
        supplierData.nit || null,
        supplierData.telefono || null,
        supplierData.correo || null,
        supplierData.direccion || null,
        supplierData.estado !== undefined ? supplierData.estado : 1
      ]);
      return result.insertId;
    }

    const nextId = Math.max(...mockStore.proveedores.map((p) => p.id_proveedor || 0), 0) + 1;
    const newSupplier = {
      id_proveedor: nextId,
      nombre: supplierData.nombre,
      nit: supplierData.nit || null,
      telefono: supplierData.telefono || null,
      correo: supplierData.correo || null,
      direccion: supplierData.direccion || null,
      estado: supplierData.estado !== undefined ? supplierData.estado : 1
    };
    mockStore.proveedores.push(newSupplier);
    mockStore.saveToFile();
    return nextId;
  }

  static async update(id, supplierData) {
    const supplierId = Number(id);

    if (isDatabaseConnected()) {
      const fields = [];
      const values = [];

      if (supplierData.nombre !== undefined) { fields.push("nombre = ?"); values.push(supplierData.nombre); }
      if (supplierData.nit !== undefined) { fields.push("nit = ?"); values.push(supplierData.nit || null); }
      if (supplierData.telefono !== undefined) { fields.push("telefono = ?"); values.push(supplierData.telefono); }
      if (supplierData.correo !== undefined) { fields.push("correo = ?"); values.push(supplierData.correo); }
      if (supplierData.direccion !== undefined) { fields.push("direccion = ?"); values.push(supplierData.direccion); }
      if (supplierData.estado !== undefined) { fields.push("estado = ?"); values.push(supplierData.estado); }

      if (fields.length === 0) return true;
      values.push(supplierId);

      const sql = `UPDATE proveedor SET ${fields.join(", ")} WHERE id_proveedor = ?`;
      await executeQuery(sql, values);
      return true;
    }

    const p = mockStore.proveedores.find((prov) => prov.id_proveedor === supplierId);
    if (!p) return false;
    if (supplierData.nombre !== undefined) p.nombre = supplierData.nombre;
    if (supplierData.nit !== undefined) p.nit = supplierData.nit;
    if (supplierData.telefono !== undefined) p.telefono = supplierData.telefono;
    if (supplierData.correo !== undefined) p.correo = supplierData.correo;
    if (supplierData.direccion !== undefined) p.direccion = supplierData.direccion;
    if (supplierData.estado !== undefined) p.estado = supplierData.estado;
    mockStore.saveToFile();
    return true;
  }

  static async toggleStatus(id) {
    const supplierId = Number(id);
    const p = await this.findById(supplierId);
    if (!p) return null;

    const newStatus = p.estado === 1 ? 0 : 1;

    if (isDatabaseConnected()) {
      await executeQuery(`UPDATE proveedor SET estado = ? WHERE id_proveedor = ?`, [newStatus, supplierId]);
      return newStatus;
    }

    const target = mockStore.proveedores.find((prov) => prov.id_proveedor === supplierId);
    if (target) target.estado = newStatus;
    mockStore.saveToFile();
    return newStatus;
  }

  static async delete(id) {
    const supplierId = Number(id);
    if (isDatabaseConnected()) {
      await executeQuery(`DELETE FROM proveedor WHERE id_proveedor = ?`, [supplierId]);
      return true;
    }
    mockStore.proveedores = mockStore.proveedores.filter((prov) => prov.id_proveedor !== supplierId);
    mockStore.saveToFile();
    return true;
  }
}

export { SuppliersRepository as SuppliersModel };
export default SuppliersRepository;

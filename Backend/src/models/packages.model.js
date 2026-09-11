import { executeQuery, executeTransaction, isDatabaseConnected } from "../config/db.js";
import { mockStore } from "../config/mockStore.js";

export class PackagesRepository {
  static async findAll({ status = "all" } = {}) {
    if (isDatabaseConnected()) {
      let sql = `
        SELECT p.id_paquete, p.nombre, p.descuento_porcentaje, p.estado
        FROM paquete_servicio p
        WHERE 1=1
      `;
      const params = [];
      if (status !== "all") {
        sql += ` AND p.estado = ?`;
        params.push(Number(status));
      }
      sql += ` ORDER BY p.nombre ASC`;

      const packages = await executeQuery(sql, params);

      // Cargar servicios de cada paquete
      for (const pkg of packages) {
        const detSql = `
          SELECT s.id_servicio, s.nombre, s.precio, s.duracion_minutos, s.imagen_url
          FROM paquete_servicio_detalle psd
          JOIN servicio s ON psd.id_servicio = s.id_servicio
          WHERE psd.id_paquete = ?
        `;
        pkg.servicios = await executeQuery(detSql, [pkg.id_paquete]);
        pkg.servicios_ids = pkg.servicios.map((s) => s.id_servicio);
        const totalBase = pkg.servicios.reduce((acc, curr) => acc + Number(curr.precio), 0);
        pkg.precio_base = totalBase;
        pkg.precio_final = Math.round(totalBase * (1 - Number(pkg.descuento_porcentaje) / 100));
      }

      return packages;
    }

    return mockStore.paquete_servicios
      .filter((p) => status === "all" || p.estado === Number(status))
      .map((p) => {
        const details = mockStore.paquete_servicio_detalles.filter((d) => d.id_paquete === p.id_paquete);
        const servicios = details
          .map((d) => mockStore.servicios.find((s) => s.id_servicio === d.id_servicio))
          .filter(Boolean);
        const totalBase = servicios.reduce((acc, curr) => acc + Number(curr.precio), 0);
        return {
          ...p,
          servicios,
          servicios_ids: servicios.map((s) => s.id_servicio),
          precio_base: totalBase,
          precio_final: Math.round(totalBase * (1 - Number(p.descuento_porcentaje) / 100))
        };
      });
  }

  static async findById(id) {
    const pkgId = Number(id);

    if (isDatabaseConnected()) {
      const sql = `SELECT * FROM paquete_servicio WHERE id_paquete = ? LIMIT 1`;
      const rows = await executeQuery(sql, [pkgId]);
      if (!rows || rows.length === 0) return null;

      const pkg = rows[0];
      const detSql = `
        SELECT s.id_servicio, s.nombre, s.precio, s.duracion_minutos, s.imagen_url
        FROM paquete_servicio_detalle psd
        JOIN servicio s ON psd.id_servicio = s.id_servicio
        WHERE psd.id_paquete = ?
      `;
      pkg.servicios = await executeQuery(detSql, [pkgId]);
      pkg.servicios_ids = pkg.servicios.map((s) => s.id_servicio);
      const totalBase = pkg.servicios.reduce((acc, curr) => acc + Number(curr.precio), 0);
      pkg.precio_base = totalBase;
      pkg.precio_final = Math.round(totalBase * (1 - Number(pkg.descuento_porcentaje) / 100));
      return pkg;
    }

    const p = mockStore.paquete_servicios.find((pkg) => pkg.id_paquete === pkgId);
    if (!p) return null;
    const details = mockStore.paquete_servicio_detalles.filter((d) => d.id_paquete === pkgId);
    const servicios = details
      .map((d) => mockStore.servicios.find((s) => s.id_servicio === d.id_servicio))
      .filter(Boolean);
    const totalBase = servicios.reduce((acc, curr) => acc + Number(curr.precio), 0);
    return {
      ...p,
      servicios,
      servicios_ids: servicios.map((s) => s.id_servicio),
      precio_base: totalBase,
      precio_final: Math.round(totalBase * (1 - Number(p.descuento_porcentaje) / 100))
    };
  }

  static async create(packageData) {
    return await executeTransaction(async (conn) => {
      if (isDatabaseConnected() && conn) {
        const [result] = await conn.execute(
          `INSERT INTO paquete_servicio (nombre, descuento_porcentaje, estado) VALUES (?, ?, ?)`,
          [packageData.nombre, Number(packageData.descuento_porcentaje), packageData.estado !== undefined ? packageData.estado : 1]
        );
        const pkgId = result.insertId;

        if (Array.isArray(packageData.servicios_ids)) {
          for (const sId of packageData.servicios_ids) {
            await conn.execute(
              `INSERT INTO paquete_servicio_detalle (id_paquete, id_servicio) VALUES (?, ?)`,
              [pkgId, Number(sId)]
            );
          }
        }
        return pkgId;
      }

      const nextId = Math.max(...mockStore.paquete_servicios.map((p) => p.id_paquete || 0), 0) + 1;
      const newPkg = {
        id_paquete: nextId,
        nombre: packageData.nombre,
        descuento_porcentaje: Number(packageData.descuento_porcentaje),
        estado: packageData.estado !== undefined ? packageData.estado : 1
      };
      mockStore.paquete_servicios.push(newPkg);

      if (Array.isArray(packageData.servicios_ids)) {
        packageData.servicios_ids.forEach((sId) => {
          const nextDetId = Math.max(...mockStore.paquete_servicio_detalles.map((d) => d.id_paquete_detalle || 0), 0) + 1;
          mockStore.paquete_servicio_detalles.push({
            id_paquete_detalle: nextDetId,
            id_paquete: nextId,
            id_servicio: Number(sId)
          });
        });
      }

      return nextId;
    });
  }

  static async update(id, packageData) {
    const pkgId = Number(id);

    return await executeTransaction(async (conn) => {
      if (isDatabaseConnected() && conn) {
        if (packageData.nombre || packageData.descuento_porcentaje !== undefined || packageData.estado !== undefined) {
          const fields = [];
          const values = [];
          if (packageData.nombre) { fields.push("nombre = ?"); values.push(packageData.nombre); }
          if (packageData.descuento_porcentaje !== undefined) { fields.push("descuento_porcentaje = ?"); values.push(Number(packageData.descuento_porcentaje)); }
          if (packageData.estado !== undefined) { fields.push("estado = ?"); values.push(packageData.estado); }
          values.push(pkgId);
          await conn.execute(`UPDATE paquete_servicio SET ${fields.join(", ")} WHERE id_paquete = ?`, values);
        }

        if (Array.isArray(packageData.servicios_ids)) {
          await conn.execute(`DELETE FROM paquete_servicio_detalle WHERE id_paquete = ?`, [pkgId]);
          for (const sId of packageData.servicios_ids) {
            await conn.execute(
              `INSERT INTO paquete_servicio_detalle (id_paquete, id_servicio) VALUES (?, ?)`,
              [pkgId, Number(sId)]
            );
          }
        }
        return true;
      }

      const p = mockStore.paquete_servicios.find((pkg) => pkg.id_paquete === pkgId);
      if (!p) return false;
      if (packageData.nombre) p.nombre = packageData.nombre;
      if (packageData.descuento_porcentaje !== undefined) p.descuento_porcentaje = Number(packageData.descuento_porcentaje);
      if (packageData.estado !== undefined) p.estado = packageData.estado;

      if (Array.isArray(packageData.servicios_ids)) {
        mockStore.paquete_servicio_detalles = mockStore.paquete_servicio_detalles.filter((d) => d.id_paquete !== pkgId);
        packageData.servicios_ids.forEach((sId) => {
          const nextDetId = Math.max(...mockStore.paquete_servicio_detalles.map((d) => d.id_paquete_detalle || 0), 0) + 1;
          mockStore.paquete_servicio_detalles.push({
            id_paquete_detalle: nextDetId,
            id_paquete: pkgId,
            id_servicio: Number(sId)
          });
        });
      }
      return true;
    });
  }

  static async toggleStatus(id) {
    const pkgId = Number(id);
    const p = await this.findById(pkgId);
    if (!p) return null;

    const newStatus = p.estado === 1 ? 0 : 1;

    if (isDatabaseConnected()) {
      await executeQuery(`UPDATE paquete_servicio SET estado = ? WHERE id_paquete = ?`, [newStatus, pkgId]);
      return newStatus;
    }

    const target = mockStore.paquete_servicios.find((pkg) => pkg.id_paquete === pkgId);
    if (target) target.estado = newStatus;
    return newStatus;
  }
}

export { PackagesRepository as PackagesModel };
export default PackagesRepository;

import { executeQuery, isDatabaseConnected } from "../config/db.js";
import { mockStore } from "../config/mockStore.js";

export class ServicesRepository {
  static async findAll({ search = "", status = "all", category = "all" } = {}) {
    if (isDatabaseConnected()) {
      let sql = `
        SELECT s.id_servicio, s.nombre, s.id_categoria_servicio, s.precio, s.duracion_minutos, s.imagen_url, s.estado,
               cs.nombre as categoria
        FROM servicio s
        JOIN categoria_servicio cs ON s.id_categoria_servicio = cs.id_categoria_servicio
        WHERE 1=1
      `;
      const params = [];

      if (search) {
        sql += ` AND (LOWER(s.nombre) LIKE ? OR LOWER(cs.nombre) LIKE ?)`;
        const s = `%${search.toLowerCase()}%`;
        params.push(s, s);
      }

      if (status !== "all") {
        sql += ` AND s.estado = ?`;
        params.push(Number(status));
      }

      if (category !== "all") {
        sql += ` AND s.id_categoria_servicio = ?`;
        params.push(Number(category));
      }

      sql += ` ORDER BY s.nombre ASC`;
      return await executeQuery(sql, params);
    }

    return mockStore.servicios
      .map((s) => {
        const cat = mockStore.categoria_servicios.find((c) => c.id_categoria_servicio === s.id_categoria_servicio);
        return {
          ...s,
          categoria: cat ? cat.nombre : "Sin Categoría"
        };
      })
      .filter((s) => {
        const str = (search || "").toLowerCase().trim();
        const matchesSearch =
          str === "" || s.nombre.toLowerCase().includes(str) || s.categoria.toLowerCase().includes(str);

        const matchesStatus =
          status === "all" ||
          (status === "1" && s.estado === 1) ||
          (status === "0" && s.estado === 0);

        const matchesCategory = category === "all" || String(s.id_categoria_servicio) === String(category);

        return matchesSearch && matchesStatus && matchesCategory;
      });
  }

  static async findById(id) {
    const serviceId = Number(id);

    if (isDatabaseConnected()) {
      const sql = `
        SELECT s.id_servicio, s.nombre, s.id_categoria_servicio, s.precio, s.duracion_minutos, s.imagen_url, s.estado,
               cs.nombre as categoria
        FROM servicio s
        JOIN categoria_servicio cs ON s.id_categoria_servicio = cs.id_categoria_servicio
        WHERE s.id_servicio = ?
        LIMIT 1
      `;
      const rows = await executeQuery(sql, [serviceId]);
      return rows && rows.length > 0 ? rows[0] : null;
    }

    const s = mockStore.servicios.find((serv) => serv.id_servicio === serviceId);
    if (!s) return null;
    const cat = mockStore.categoria_servicios.find((c) => c.id_categoria_servicio === s.id_categoria_servicio);
    return {
      ...s,
      categoria: cat ? cat.nombre : "Sin Categoría"
    };
  }

  static async create(serviceData) {
    if (isDatabaseConnected()) {
      const sql = `
        INSERT INTO servicio (nombre, id_categoria_servicio, precio, duracion_minutos, imagen_url, estado)
        VALUES (?, ?, ?, ?, ?, ?)
      `;
      const result = await executeQuery(sql, [
        serviceData.nombre,
        Number(serviceData.id_categoria_servicio),
        Number(serviceData.precio),
        Number(serviceData.duracion_minutos),
        serviceData.imagen_url || null,
        serviceData.estado !== undefined ? serviceData.estado : 1
      ]);
      return result.insertId;
    }

    const nextId = Math.max(...mockStore.servicios.map((s) => s.id_servicio || 0), 0) + 1;
    const newService = {
      id_servicio: nextId,
      nombre: serviceData.nombre,
      id_categoria_servicio: Number(serviceData.id_categoria_servicio),
      precio: Number(serviceData.precio),
      duracion_minutos: Number(serviceData.duracion_minutos),
      imagen_url: serviceData.imagen_url || "",
      estado: serviceData.estado !== undefined ? serviceData.estado : 1
    };
    mockStore.servicios.push(newService);
    return nextId;
  }

  static async update(id, serviceData) {
    const serviceId = Number(id);

    if (isDatabaseConnected()) {
      const fields = [];
      const values = [];

      if (serviceData.nombre !== undefined) { fields.push("nombre = ?"); values.push(serviceData.nombre); }
      if (serviceData.id_categoria_servicio !== undefined) { fields.push("id_categoria_servicio = ?"); values.push(Number(serviceData.id_categoria_servicio)); }
      if (serviceData.precio !== undefined) { fields.push("precio = ?"); values.push(Number(serviceData.precio)); }
      if (serviceData.duracion_minutos !== undefined) { fields.push("duracion_minutos = ?"); values.push(Number(serviceData.duracion_minutos)); }
      if (serviceData.imagen_url !== undefined) { fields.push("imagen_url = ?"); values.push(serviceData.imagen_url); }
      if (serviceData.estado !== undefined) { fields.push("estado = ?"); values.push(serviceData.estado); }

      if (fields.length === 0) return true;
      values.push(serviceId);

      const sql = `UPDATE servicio SET ${fields.join(", ")} WHERE id_servicio = ?`;
      await executeQuery(sql, values);
      return true;
    }

    const s = mockStore.servicios.find((serv) => serv.id_servicio === serviceId);
    if (!s) return false;
    if (serviceData.nombre !== undefined) s.nombre = serviceData.nombre;
    if (serviceData.id_categoria_servicio !== undefined) s.id_categoria_servicio = Number(serviceData.id_categoria_servicio);
    if (serviceData.precio !== undefined) s.precio = Number(serviceData.precio);
    if (serviceData.duracion_minutos !== undefined) s.duracion_minutos = Number(serviceData.duracion_minutos);
    if (serviceData.imagen_url !== undefined) s.imagen_url = serviceData.imagen_url;
    if (serviceData.estado !== undefined) s.estado = serviceData.estado;

    return true;
  }

  static async toggleStatus(id) {
    const serviceId = Number(id);
    const s = await this.findById(serviceId);
    if (!s) return null;

    const newStatus = s.estado === 1 ? 0 : 1;

    if (isDatabaseConnected()) {
      await executeQuery(`UPDATE servicio SET estado = ? WHERE id_servicio = ?`, [newStatus, serviceId]);
      return newStatus;
    }

    const target = mockStore.servicios.find((serv) => serv.id_servicio === serviceId);
    if (target) target.estado = newStatus;
    return newStatus;
  }

  static async findAllCategories() {
    if (isDatabaseConnected()) {
      const sql = `SELECT * FROM categoria_servicio WHERE estado = 1 ORDER BY nombre ASC`;
      return await executeQuery(sql);
    }
    return mockStore.categoria_servicios.filter((c) => c.estado === 1);
  }

  static async createCategory(nombre) {
    if (isDatabaseConnected()) {
      const sql = `INSERT INTO categoria_servicio (nombre, estado) VALUES (?, 1)`;
      const res = await executeQuery(sql, [nombre]);
      return res.insertId;
    }
    const nextId = Math.max(...mockStore.categoria_servicios.map((c) => c.id_categoria_servicio || 0), 0) + 1;
    mockStore.categoria_servicios.push({ id_categoria_servicio: nextId, nombre, estado: 1 });
    return nextId;
  }
}

export { ServicesRepository as ServicesModel };
export default ServicesRepository;

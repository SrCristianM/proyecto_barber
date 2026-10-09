import { executeQuery, isDatabaseConnected } from "../config/db.js";
import { mockStore } from "../config/mockStore.js";

export class UsersRepository {
  static async findAll({ search = "", status = "all", role = "all", sortField = "nombre", sortDir = "asc" } = {}) {
    if (isDatabaseConnected()) {
      let sql = `
        SELECT u.id_usuario, u.nombre, u.apellido, u.documento, u.correo, u.telefono, u.id_rol, u.estado, u.fecha_registro, r.nombre_rol as rol
        FROM usuario u
        JOIN rol r ON u.id_rol = r.id_rol
        WHERE 1=1
      `;
      const params = [];

      if (search) {
        sql += ` AND (LOWER(CONCAT(u.nombre, ' ', u.apellido)) LIKE ? OR LOWER(u.correo) LIKE ? OR u.telefono LIKE ? OR (u.documento IS NOT NULL AND u.documento LIKE ?))`;
        const s = `%${search.toLowerCase()}%`;
        params.push(s, s, s, s);
      }

      if (status !== "all") {
        sql += ` AND u.estado = ?`;
        params.push(Number(status));
      }

      if (role !== "all") {
        sql += ` AND u.id_rol = ?`;
        params.push(Number(role));
      }

      const validSort = ["nombre", "apellido", "documento", "correo", "fecha_registro", "id_usuario", "estado"].includes(sortField) ? sortField : "nombre";
      const validDir = sortDir.toLowerCase() === "desc" ? "DESC" : "ASC";
      sql += ` ORDER BY u.${validSort} ${validDir}`;

      return await executeQuery(sql, params);
    }

    // Fallback store
    return mockStore.usuarios
      .filter((user) => {
        const fullName = `${user.nombre} ${user.apellido}`.toLowerCase();
        const s = (search || "").toLowerCase().trim();
        const matchesSearch =
          s === "" ||
          fullName.includes(s) ||
          user.correo.toLowerCase().includes(s) ||
          (user.telefono || "").includes(s) ||
          (user.documento && user.documento.includes(s));

        const matchesStatus =
          status === "all" ||
          (status === "1" && user.estado === 1) ||
          (status === "0" && user.estado === 0);

        const matchesRole = role === "all" || String(user.id_rol) === String(role);

        return matchesSearch && matchesStatus && matchesRole;
      })
      .map((user) => {
        const roleObj = mockStore.roles.find((r) => r.id_rol === user.id_rol);
        const { contrasena, ...safe } = user;
        return { ...safe, rol: roleObj ? roleObj.nombre_rol : "Sin Rol" };
      })
      .sort((a, b) => {
        const valA = (a[sortField] ?? "").toString().toLowerCase();
        const valB = (b[sortField] ?? "").toString().toLowerCase();
        if (valA < valB) return sortDir === "asc" ? -1 : 1;
        if (valA > valB) return sortDir === "asc" ? 1 : -1;
        return 0;
      });
  }

  static async findById(id) {
    const userId = Number(id);

    if (isDatabaseConnected()) {
      const sql = `
        SELECT u.id_usuario, u.nombre, u.apellido, u.documento, u.correo, u.telefono, u.id_rol, u.estado, u.fecha_registro, r.nombre_rol as rol
        FROM usuario u
        JOIN rol r ON u.id_rol = r.id_rol
        WHERE u.id_usuario = ?
        LIMIT 1
      `;
      const rows = await executeQuery(sql, [userId]);
      return rows && rows.length > 0 ? rows[0] : null;
    }

    const user = mockStore.usuarios.find((u) => u.id_usuario === userId);
    if (!user) return null;
    const roleObj = mockStore.roles.find((r) => r.id_rol === user.id_rol);
    const { contrasena, ...safe } = user;
    return { ...safe, rol: roleObj ? roleObj.nombre_rol : "Sin Rol" };
  }

  static async findByEmail(email) {
    const clean = email.trim().toLowerCase();

    if (isDatabaseConnected()) {
      const sql = `SELECT * FROM usuario WHERE LOWER(correo) = ? LIMIT 1`;
      const rows = await executeQuery(sql, [clean]);
      return rows && rows.length > 0 ? rows[0] : null;
    }

    return mockStore.usuarios.find((u) => u.correo.toLowerCase() === clean) || null;
  }

  static async findByDocumento(documento) {
    if (!documento) return null;
    const cleanDoc = String(documento).trim();

    if (isDatabaseConnected()) {
      const sql = `SELECT * FROM usuario WHERE documento = ? LIMIT 1`;
      const rows = await executeQuery(sql, [cleanDoc]);
      return rows && rows.length > 0 ? rows[0] : null;
    }

    return mockStore.usuarios.find((u) => u.documento && String(u.documento).trim() === cleanDoc) || null;
  }

  static async create(userData) {
    if (isDatabaseConnected()) {
      const sql = `
        INSERT INTO usuario (nombre, apellido, documento, correo, contrasena, telefono, id_rol, estado)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `;
      const result = await executeQuery(sql, [
        userData.nombre,
        userData.apellido,
        userData.documento || null,
        userData.correo,
        userData.contrasena,
        userData.telefono || null,
        Number(userData.id_rol),
        userData.estado !== undefined ? Number(userData.estado) : 1
      ]);
      const newUserId = result.insertId;

      // Auto-sincronizar con entidad correspondiente según rol
      if (Number(userData.id_rol) === 4) {
        await executeQuery(
          "INSERT INTO cliente (id_usuario, nivel_fidelidad, direccion, estado) VALUES (?, 'Nuevo', ?, 1)",
          [newUserId, userData.direccion || null]
        );
      } else if (Number(userData.id_rol) === 3) {
        await executeQuery(
          "INSERT INTO barbero (id_usuario, especialidad, imagen_url, estado) VALUES (?, 'Corte Clásico', NULL, 1)",
          [newUserId]
        );
      }
      return newUserId;
    }

    const nextId = Math.max(...mockStore.usuarios.map((u) => u.id_usuario || 0), 0) + 1;
    const newUser = {
      id_usuario: nextId,
      nombre: userData.nombre,
      apellido: userData.apellido,
      documento: userData.documento || null,
      correo: userData.correo,
      contrasena: userData.contrasena,
      telefono: userData.telefono || null,
      id_rol: Number(userData.id_rol),
      estado: userData.estado !== undefined ? Number(userData.estado) : 1,
      fecha_registro: new Date().toISOString().replace("T", " ").substring(0, 19)
    };
    mockStore.usuarios.push(newUser);

    // Auto-sincronizar en almacén local
    if (Number(userData.id_rol) === 4) {
      const nextClientId = Math.max(...mockStore.clientes.map((c) => c.id_cliente || 0), 0) + 1;
      mockStore.clientes.push({
        id_cliente: nextClientId,
        id_usuario: nextId,
        nivel_fidelidad: "Nuevo",
        direccion: userData.direccion || "",
        estado: 1
      });
    } else if (Number(userData.id_rol) === 3) {
      const nextBarberId = Math.max(...mockStore.barberos.map((b) => b.id_barbero || 0), 0) + 1;
      mockStore.barberos.push({
        id_barbero: nextBarberId,
        id_usuario: nextId,
        especialidad: "Corte Clásico",
        imagen_url: "",
        estado: 1
      });
    }

    mockStore.saveToFile();
    return nextId;
  }

  static async update(id, userData) {
    const userId = Number(id);

    if (isDatabaseConnected()) {
      const fields = [];
      const values = [];

      if (userData.nombre !== undefined) { fields.push("nombre = ?"); values.push(userData.nombre); }
      if (userData.apellido !== undefined) { fields.push("apellido = ?"); values.push(userData.apellido); }
      if (userData.documento !== undefined) { fields.push("documento = ?"); values.push(userData.documento || null); }
      if (userData.correo !== undefined) { fields.push("correo = ?"); values.push(userData.correo); }
      if (userData.telefono !== undefined) { fields.push("telefono = ?"); values.push(userData.telefono); }
      if (userData.id_rol !== undefined) { fields.push("id_rol = ?"); values.push(Number(userData.id_rol)); }
      if (userData.estado !== undefined) { fields.push("estado = ?"); values.push(Number(userData.estado)); }
      if (userData.contrasena) { fields.push("contrasena = ?"); values.push(userData.contrasena); }

      if (fields.length > 0) {
        values.push(userId);
        const sql = `UPDATE usuario SET ${fields.join(", ")} WHERE id_usuario = ?`;
        await executeQuery(sql, values);
      }

      // Sincronizar roles asociados
      if (userData.id_rol !== undefined) {
        const roleId = Number(userData.id_rol);
        if (roleId === 4) {
          const clientRows = await executeQuery("SELECT id_cliente FROM cliente WHERE id_usuario = ?", [userId]);
          if (!clientRows || clientRows.length === 0) {
            await executeQuery("INSERT INTO cliente (id_usuario, nivel_fidelidad, direccion, estado) VALUES (?, 'Nuevo', NULL, 1)", [userId]);
          }
        } else if (roleId === 3) {
          const barberRows = await executeQuery("SELECT id_barbero FROM barbero WHERE id_usuario = ?", [userId]);
          if (!barberRows || barberRows.length === 0) {
            await executeQuery("INSERT INTO barbero (id_usuario, especialidad, imagen_url, estado) VALUES (?, 'Corte Clásico', NULL, 1)", [userId]);
          }
        }
      }

      if (userData.estado !== undefined) {
        const st = Number(userData.estado);
        await executeQuery("UPDATE cliente SET estado = ? WHERE id_usuario = ?", [st, userId]);
        await executeQuery("UPDATE barbero SET estado = ? WHERE id_usuario = ?", [st, userId]);
      }

      return true;
    }

    const user = mockStore.usuarios.find((u) => u.id_usuario === userId);
    if (!user) return false;

    if (userData.nombre !== undefined) user.nombre = userData.nombre;
    if (userData.apellido !== undefined) user.apellido = userData.apellido;
    if (userData.documento !== undefined) user.documento = userData.documento;
    if (userData.correo !== undefined) user.correo = userData.correo;
    if (userData.telefono !== undefined) user.telefono = userData.telefono;
    if (userData.id_rol !== undefined) {
      user.id_rol = Number(userData.id_rol);
      if (user.id_rol === 4 && !mockStore.clientes.some((c) => c.id_usuario === userId)) {
        const nextCId = Math.max(...mockStore.clientes.map((c) => c.id_cliente || 0), 0) + 1;
        mockStore.clientes.push({ id_cliente: nextCId, id_usuario: userId, nivel_fidelidad: "Nuevo", direccion: "", estado: user.estado || 1 });
      } else if (user.id_rol === 3 && !mockStore.barberos.some((b) => b.id_usuario === userId)) {
        const nextBId = Math.max(...mockStore.barberos.map((b) => b.id_barbero || 0), 0) + 1;
        mockStore.barberos.push({ id_barbero: nextBId, id_usuario: userId, especialidad: "Corte Clásico", imagen_url: "", estado: user.estado || 1 });
      }
    }
    if (userData.estado !== undefined) {
      user.estado = Number(userData.estado);
      const c = mockStore.clientes.find((cl) => cl.id_usuario === userId);
      if (c) c.estado = user.estado;
      const b = mockStore.barberos.find((ba) => ba.id_usuario === userId);
      if (b) b.estado = user.estado;
    }
    if (userData.contrasena) user.contrasena = userData.contrasena;

    mockStore.saveToFile();
    return true;
  }

  static async toggleStatus(id, explicitStatus = null) {
    const userId = Number(id);
    const currentUser = await this.findById(userId);
    if (!currentUser) return null;

    const newStatus = explicitStatus !== null ? Number(explicitStatus) : currentUser.estado === 1 ? 0 : 1;

    if (isDatabaseConnected()) {
      const sql = `UPDATE usuario SET estado = ? WHERE id_usuario = ?`;
      await executeQuery(sql, [newStatus, userId]);
      await executeQuery(`UPDATE cliente SET estado = ? WHERE id_usuario = ?`, [newStatus, userId]);
      await executeQuery(`UPDATE barbero SET estado = ? WHERE id_usuario = ?`, [newStatus, userId]);
      return newStatus;
    }

    const user = mockStore.usuarios.find((u) => u.id_usuario === userId);
    if (user) {
      user.estado = newStatus;
      const c = mockStore.clientes.find((cl) => cl.id_usuario === userId);
      if (c) c.estado = newStatus;
      const b = mockStore.barberos.find((ba) => ba.id_usuario === userId);
      if (b) b.estado = newStatus;
      mockStore.saveToFile();
    }
    return newStatus;
  }

  static async delete(id) {
    const userId = Number(id);

    if (isDatabaseConnected()) {
      try {
        await executeQuery(`DELETE FROM barbero WHERE id_usuario = ?`, [userId]);
        await executeQuery(`DELETE FROM cliente WHERE id_usuario = ?`, [userId]);
        await executeQuery(`DELETE FROM usuario WHERE id_usuario = ?`, [userId]);
      } catch (err) {
        await executeQuery(`DELETE FROM usuario WHERE id_usuario = ?`, [userId]);
      }
      return true;
    }

    mockStore.usuarios = mockStore.usuarios.filter((u) => u.id_usuario !== userId);
    mockStore.barberos = mockStore.barberos.filter((b) => b.id_usuario !== userId);
    mockStore.clientes = mockStore.clientes.filter((c) => c.id_usuario !== userId);
    mockStore.saveToFile();
    return true;
  }
}

export { UsersRepository as UsersModel };
export default UsersRepository;

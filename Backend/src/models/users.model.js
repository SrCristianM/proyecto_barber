import { executeQuery, isDatabaseConnected } from "../config/db.js";
import { mockStore } from "../config/mockStore.js";

export class UsersRepository {
  static async findAll({ search = "", status = "all", role = "all", sortField = "nombre", sortDir = "asc" } = {}) {
    if (isDatabaseConnected()) {
      let sql = `
        SELECT u.id_usuario, u.nombre, u.apellido, u.correo, u.telefono, u.id_rol, u.estado, u.fecha_registro, r.nombre_rol as rol
        FROM usuario u
        JOIN rol r ON u.id_rol = r.id_rol
        WHERE 1=1
      `;
      const params = [];

      if (search) {
        sql += ` AND (LOWER(CONCAT(u.nombre, ' ', u.apellido)) LIKE ? OR LOWER(u.correo) LIKE ? OR u.telefono LIKE ?)`;
        const s = `%${search.toLowerCase()}%`;
        params.push(s, s, s);
      }

      if (status !== "all") {
        sql += ` AND u.estado = ?`;
        params.push(Number(status));
      }

      if (role !== "all") {
        sql += ` AND u.id_rol = ?`;
        params.push(Number(role));
      }

      const validSort = ["nombre", "apellido", "correo", "fecha_registro", "id_usuario", "estado"].includes(sortField) ? sortField : "nombre";
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
          (user.telefono || "").includes(s);

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
        SELECT u.id_usuario, u.nombre, u.apellido, u.correo, u.telefono, u.id_rol, u.estado, u.fecha_registro, r.nombre_rol as rol
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

  static async create(userData) {
    if (isDatabaseConnected()) {
      const sql = `
        INSERT INTO usuario (nombre, apellido, correo, contrasena, telefono, id_rol, estado)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `;
      const result = await executeQuery(sql, [
        userData.nombre,
        userData.apellido,
        userData.correo,
        userData.contrasena,
        userData.telefono || null,
        userData.id_rol,
        userData.estado !== undefined ? userData.estado : 1
      ]);
      return result.insertId;
    }

    const nextId = Math.max(...mockStore.usuarios.map((u) => u.id_usuario || 0), 0) + 1;
    const newUser = {
      id_usuario: nextId,
      nombre: userData.nombre,
      apellido: userData.apellido,
      correo: userData.correo,
      contrasena: userData.contrasena,
      telefono: userData.telefono || null,
      id_rol: Number(userData.id_rol),
      estado: userData.estado !== undefined ? userData.estado : 1,
      fecha_registro: new Date().toISOString().replace("T", " ").substring(0, 19)
    };
    mockStore.usuarios.push(newUser);
    return nextId;
  }

  static async update(id, userData) {
    const userId = Number(id);

    if (isDatabaseConnected()) {
      const fields = [];
      const values = [];

      if (userData.nombre !== undefined) { fields.push("nombre = ?"); values.push(userData.nombre); }
      if (userData.apellido !== undefined) { fields.push("apellido = ?"); values.push(userData.apellido); }
      if (userData.correo !== undefined) { fields.push("correo = ?"); values.push(userData.correo); }
      if (userData.telefono !== undefined) { fields.push("telefono = ?"); values.push(userData.telefono); }
      if (userData.id_rol !== undefined) { fields.push("id_rol = ?"); values.push(userData.id_rol); }
      if (userData.estado !== undefined) { fields.push("estado = ?"); values.push(userData.estado); }
      if (userData.contrasena) { fields.push("contrasena = ?"); values.push(userData.contrasena); }

      if (fields.length === 0) return true;

      values.push(userId);
      const sql = `UPDATE usuario SET ${fields.join(", ")} WHERE id_usuario = ?`;
      await executeQuery(sql, values);
      return true;
    }

    const user = mockStore.usuarios.find((u) => u.id_usuario === userId);
    if (!user) return false;

    if (userData.nombre !== undefined) user.nombre = userData.nombre;
    if (userData.apellido !== undefined) user.apellido = userData.apellido;
    if (userData.correo !== undefined) user.correo = userData.correo;
    if (userData.telefono !== undefined) user.telefono = userData.telefono;
    if (userData.id_rol !== undefined) user.id_rol = Number(userData.id_rol);
    if (userData.estado !== undefined) user.estado = Number(userData.estado);
    if (userData.contrasena) user.contrasena = userData.contrasena;

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
      return newStatus;
    }

    const user = mockStore.usuarios.find((u) => u.id_usuario === userId);
    if (user) {
      user.estado = newStatus;
    }
    return newStatus;
  }

  static async delete(id) {
    // Desactivación lógica estándar de seguridad
    return await this.toggleStatus(id, 0);
  }
}

export { UsersRepository as UsersModel };
export default UsersRepository;

import { executeQuery, executeTransaction, isDatabaseConnected } from "../config/db.js";
import { mockStore } from "../config/mockStore.js";
import { ROLES } from "../config/constants.js";

export class BarbersRepository {
  static async findAll({ search = "", status = "all", specialty = "" } = {}) {
    if (isDatabaseConnected()) {
      let sql = `
        SELECT b.id_barbero, b.id_usuario, b.especialidad, b.imagen_url, b.estado,
               u.nombre, u.apellido, u.correo, u.telefono
        FROM barbero b
        JOIN usuario u ON b.id_usuario = u.id_usuario
        WHERE 1=1
      `;
      const params = [];

      if (search) {
        sql += ` AND (LOWER(CONCAT(u.nombre, ' ', u.apellido)) LIKE ? OR LOWER(u.correo) LIKE ? OR u.telefono LIKE ?)`;
        const s = `%${search.toLowerCase()}%`;
        params.push(s, s, s);
      }

      if (status !== "all") {
        sql += ` AND b.estado = ?`;
        params.push(Number(status));
      }

      if (specialty) {
        sql += ` AND LOWER(b.especialidad) LIKE ?`;
        params.push(`%${specialty.toLowerCase()}%`);
      }

      sql += ` ORDER BY u.nombre ASC`;
      return await executeQuery(sql, params);
    }

    return mockStore.barberos
      .map((b) => {
        const u = mockStore.usuarios.find((user) => user.id_usuario === b.id_usuario);
        return {
          id_barbero: b.id_barbero,
          id_usuario: b.id_usuario,
          especialidad: b.especialidad,
          imagen_url: b.imagen_url,
          estado: b.estado,
          nombre: u ? u.nombre : "Sin Nombre",
          apellido: u ? u.apellido : "",
          correo: u ? u.correo : "",
          telefono: u ? u.telefono : ""
        };
      })
      .filter((b) => {
        const fullName = `${b.nombre} ${b.apellido}`.toLowerCase();
        const s = (search || "").toLowerCase().trim();
        const matchesSearch =
          s === "" || fullName.includes(s) || b.correo.toLowerCase().includes(s) || b.telefono.includes(s);

        const matchesStatus =
          status === "all" ||
          (status === "1" && b.estado === 1) ||
          (status === "0" && b.estado === 0);

        const matchesSpecialty =
          !specialty || (b.especialidad || "").toLowerCase().includes(specialty.toLowerCase());

        return matchesSearch && matchesStatus && matchesSpecialty;
      });
  }

  static async findById(id) {
    const barberId = Number(id);

    if (isDatabaseConnected()) {
      const sql = `
        SELECT b.id_barbero, b.id_usuario, b.especialidad, b.imagen_url, b.estado,
               u.nombre, u.apellido, u.correo, u.telefono
        FROM barbero b
        JOIN usuario u ON b.id_usuario = u.id_usuario
        WHERE b.id_barbero = ?
        LIMIT 1
      `;
      const rows = await executeQuery(sql, [barberId]);
      return rows && rows.length > 0 ? rows[0] : null;
    }

    const b = mockStore.barberos.find((barber) => barber.id_barbero === barberId);
    if (!b) return null;
    const u = mockStore.usuarios.find((user) => user.id_usuario === b.id_usuario);
    return {
      id_barbero: b.id_barbero,
      id_usuario: b.id_usuario,
      especialidad: b.especialidad,
      imagen_url: b.imagen_url,
      estado: b.estado,
      nombre: u ? u.nombre : "",
      apellido: u ? u.apellido : "",
      correo: u ? u.correo : "",
      telefono: u ? u.telefono : ""
    };
  }

  static async create(barberData, hashedPassword) {
    return await executeTransaction(async (conn) => {
      if (isDatabaseConnected() && conn) {
        // 1. Crear usuario con rol Barbero (3)
        const [userResult] = await conn.execute(
          `INSERT INTO usuario (nombre, apellido, correo, contrasena, telefono, id_rol, estado) VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            barberData.nombre,
            barberData.apellido,
            barberData.correo,
            hashedPassword,
            barberData.telefono || null,
            ROLES.BARBERO,
            1
          ]
        );
        const userId = userResult.insertId;

        // 2. Crear barbero vinculado
        const [barberResult] = await conn.execute(
          `INSERT INTO barbero (id_usuario, especialidad, imagen_url, estado) VALUES (?, ?, ?, ?)`,
          [userId, barberData.especialidad || "Corte Clásico", barberData.imagen_url || null, 1]
        );

        return barberResult.insertId;
      }

      // Fallback
      const nextUserId = Math.max(...mockStore.usuarios.map((u) => u.id_usuario || 0), 0) + 1;
      const newUser = {
        id_usuario: nextUserId,
        nombre: barberData.nombre,
        apellido: barberData.apellido,
        correo: barberData.correo,
        contrasena: hashedPassword,
        telefono: barberData.telefono || null,
        id_rol: ROLES.BARBERO,
        estado: 1,
        fecha_registro: new Date().toISOString().replace("T", " ").substring(0, 19)
      };
      mockStore.usuarios.push(newUser);

      const nextBarberId = Math.max(...mockStore.barberos.map((b) => b.id_barbero || 0), 0) + 1;
      const newBarber = {
        id_barbero: nextBarberId,
        id_usuario: nextUserId,
        especialidad: barberData.especialidad || "Corte Clásico",
        imagen_url: barberData.imagen_url || "",
        estado: 1
      };
      mockStore.barberos.push(newBarber);

      return nextBarberId;
    });
  }

  static async update(id, barberData) {
    const barberId = Number(id);

    return await executeTransaction(async (conn) => {
      const barber = await this.findById(barberId);
      if (!barber) return false;

      if (isDatabaseConnected() && conn) {
        // Actualizar usuario
        await conn.execute(
          `UPDATE usuario SET nombre = ?, apellido = ?, correo = ?, telefono = ? WHERE id_usuario = ?`,
          [
            barberData.nombre !== undefined ? barberData.nombre : barber.nombre,
            barberData.apellido !== undefined ? barberData.apellido : barber.apellido,
            barberData.correo !== undefined ? barberData.correo : barber.correo,
            barberData.telefono !== undefined ? barberData.telefono : barber.telefono,
            barber.id_usuario
          ]
        );

        // Actualizar barbero
        await conn.execute(
          `UPDATE barbero SET especialidad = ?, imagen_url = ?, estado = ? WHERE id_barbero = ?`,
          [
            barberData.especialidad !== undefined ? barberData.especialidad : barber.especialidad,
            barberData.imagen_url !== undefined ? barberData.imagen_url : barber.imagen_url,
            barberData.estado !== undefined ? barberData.estado : barber.estado,
            barberId
          ]
        );
        return true;
      }

      // Fallback
      const bObj = mockStore.barberos.find((b) => b.id_barbero === barberId);
      const uObj = mockStore.usuarios.find((u) => u.id_usuario === barber.id_usuario);
      if (bObj && uObj) {
        if (barberData.nombre) uObj.nombre = barberData.nombre;
        if (barberData.apellido) uObj.apellido = barberData.apellido;
        if (barberData.correo) uObj.correo = barberData.correo;
        if (barberData.telefono !== undefined) uObj.telefono = barberData.telefono;
        if (barberData.especialidad !== undefined) bObj.especialidad = barberData.especialidad;
        if (barberData.imagen_url !== undefined) bObj.imagen_url = barberData.imagen_url;
        if (barberData.estado !== undefined) bObj.estado = barberData.estado;
      }
      return true;
    });
  }

  static async toggleStatus(id) {
    const barberId = Number(id);
    const barber = await this.findById(barberId);
    if (!barber) return null;

    const newStatus = barber.estado === 1 ? 0 : 1;

    if (isDatabaseConnected()) {
      await executeQuery(`UPDATE barbero SET estado = ? WHERE id_barbero = ?`, [newStatus, barberId]);
      await executeQuery(`UPDATE usuario SET estado = ? WHERE id_usuario = ?`, [newStatus, barber.id_usuario]);
      return newStatus;
    }

    const b = mockStore.barberos.find((barb) => barb.id_barbero === barberId);
    if (b) b.estado = newStatus;
    const u = mockStore.usuarios.find((user) => user.id_usuario === barber.id_usuario);
    if (u) u.estado = newStatus;

    return newStatus;
  }
}

export { BarbersRepository as BarbersModel };
export default BarbersRepository;

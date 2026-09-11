import { executeQuery, executeTransaction, isDatabaseConnected } from "../config/db.js";
import { mockStore } from "../config/mockStore.js";
import { ROLES } from "../config/constants.js";

export class ClientsRepository {
  static async findAll({ search = "", status = "all", fidelity = "all" } = {}) {
    if (isDatabaseConnected()) {
      let sql = `
        SELECT c.id_cliente, c.id_usuario, c.nivel_fidelidad, c.direccion, c.estado,
               u.nombre, u.apellido, u.correo, u.telefono
        FROM cliente c
        JOIN usuario u ON c.id_usuario = u.id_usuario
        WHERE 1=1
      `;
      const params = [];

      if (search) {
        sql += ` AND (LOWER(CONCAT(u.nombre, ' ', u.apellido)) LIKE ? OR LOWER(u.correo) LIKE ? OR u.telefono LIKE ?)`;
        const s = `%${search.toLowerCase()}%`;
        params.push(s, s, s);
      }

      if (status !== "all") {
        sql += ` AND c.estado = ?`;
        params.push(Number(status));
      }

      if (fidelity !== "all") {
        sql += ` AND c.nivel_fidelidad = ?`;
        params.push(fidelity);
      }

      sql += ` ORDER BY u.nombre ASC`;
      return await executeQuery(sql, params);
    }

    return mockStore.clientes
      .map((c) => {
        const u = mockStore.usuarios.find((user) => user.id_usuario === c.id_usuario);
        return {
          id_cliente: c.id_cliente,
          id_usuario: c.id_usuario,
          nivel_fidelidad: c.nivel_fidelidad,
          direccion: c.direccion,
          estado: c.estado,
          nombre: u ? u.nombre : "Sin Nombre",
          apellido: u ? u.apellido : "",
          correo: u ? u.correo : "",
          telefono: u ? u.telefono : ""
        };
      })
      .filter((c) => {
        const fullName = `${c.nombre} ${c.apellido}`.toLowerCase();
        const s = (search || "").toLowerCase().trim();
        const matchesSearch =
          s === "" || fullName.includes(s) || c.correo.toLowerCase().includes(s) || c.telefono.includes(s);

        const matchesStatus =
          status === "all" ||
          (status === "1" && c.estado === 1) ||
          (status === "0" && c.estado === 0);

        const matchesFidelity = fidelity === "all" || c.nivel_fidelidad === fidelity;

        return matchesSearch && matchesStatus && matchesFidelity;
      });
  }

  static async findById(id) {
    const clientId = Number(id);

    if (isDatabaseConnected()) {
      const sql = `
        SELECT c.id_cliente, c.id_usuario, c.nivel_fidelidad, c.direccion, c.estado,
               u.nombre, u.apellido, u.correo, u.telefono
        FROM cliente c
        JOIN usuario u ON c.id_usuario = u.id_usuario
        WHERE c.id_cliente = ?
        LIMIT 1
      `;
      const rows = await executeQuery(sql, [clientId]);
      return rows && rows.length > 0 ? rows[0] : null;
    }

    const c = mockStore.clientes.find((cl) => cl.id_cliente === clientId);
    if (!c) return null;
    const u = mockStore.usuarios.find((user) => user.id_usuario === c.id_usuario);
    return {
      id_cliente: c.id_cliente,
      id_usuario: c.id_usuario,
      nivel_fidelidad: c.nivel_fidelidad,
      direccion: c.direccion,
      estado: c.estado,
      nombre: u ? u.nombre : "",
      apellido: u ? u.apellido : "",
      correo: u ? u.correo : "",
      telefono: u ? u.telefono : ""
    };
  }

  static async findByUserId(userId) {
    const uId = Number(userId);

    if (isDatabaseConnected()) {
      const sql = `
        SELECT c.id_cliente, c.id_usuario, c.nivel_fidelidad, c.direccion, c.estado,
               u.nombre, u.apellido, u.correo, u.telefono
        FROM cliente c
        JOIN usuario u ON c.id_usuario = u.id_usuario
        WHERE c.id_usuario = ?
        LIMIT 1
      `;
      const rows = await executeQuery(sql, [uId]);
      return rows && rows.length > 0 ? rows[0] : null;
    }

    const c = mockStore.clientes.find((cl) => cl.id_usuario === uId);
    if (!c) return null;
    const u = mockStore.usuarios.find((user) => user.id_usuario === c.id_usuario);
    return {
      id_cliente: c.id_cliente,
      id_usuario: c.id_usuario,
      nivel_fidelidad: c.nivel_fidelidad,
      direccion: c.direccion,
      estado: c.estado,
      nombre: u ? u.nombre : "",
      apellido: u ? u.apellido : "",
      correo: u ? u.correo : "",
      telefono: u ? u.telefono : ""
    };
  }

  static async create(clientData, hashedPassword) {
    return await executeTransaction(async (conn) => {
      if (isDatabaseConnected() && conn) {
        // Crear usuario con rol Cliente (4)
        const [userResult] = await conn.execute(
          `INSERT INTO usuario (nombre, apellido, correo, contrasena, telefono, id_rol, estado) VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            clientData.nombre,
            clientData.apellido,
            clientData.correo,
            hashedPassword,
            clientData.telefono || null,
            ROLES.CLIENTE,
            1
          ]
        );
        const userId = userResult.insertId;

        // Crear cliente vinculado
        const [clientResult] = await conn.execute(
          `INSERT INTO cliente (id_usuario, nivel_fidelidad, direccion, estado) VALUES (?, ?, ?, ?)`,
          [userId, clientData.nivel_fidelidad || "Nuevo", clientData.direccion || null, 1]
        );

        return clientResult.insertId;
      }

      // Fallback
      const nextUserId = Math.max(...mockStore.usuarios.map((u) => u.id_usuario || 0), 0) + 1;
      const newUser = {
        id_usuario: nextUserId,
        nombre: clientData.nombre,
        apellido: clientData.apellido,
        correo: clientData.correo,
        contrasena: hashedPassword,
        telefono: clientData.telefono || null,
        id_rol: ROLES.CLIENTE,
        estado: 1,
        fecha_registro: new Date().toISOString().replace("T", " ").substring(0, 19)
      };
      mockStore.usuarios.push(newUser);

      const nextClientId = Math.max(...mockStore.clientes.map((c) => c.id_cliente || 0), 0) + 1;
      const newClient = {
        id_cliente: nextClientId,
        id_usuario: nextUserId,
        nivel_fidelidad: clientData.nivel_fidelidad || "Nuevo",
        direccion: clientData.direccion || "",
        estado: 1
      };
      mockStore.clientes.push(newClient);

      return nextClientId;
    });
  }

  static async update(id, clientData) {
    const clientId = Number(id);

    return await executeTransaction(async (conn) => {
      const client = await this.findById(clientId);
      if (!client) return false;

      if (isDatabaseConnected() && conn) {
        await conn.execute(
          `UPDATE usuario SET nombre = ?, apellido = ?, correo = ?, telefono = ? WHERE id_usuario = ?`,
          [
            clientData.nombre !== undefined ? clientData.nombre : client.nombre,
            clientData.apellido !== undefined ? clientData.apellido : client.apellido,
            clientData.correo !== undefined ? clientData.correo : client.correo,
            clientData.telefono !== undefined ? clientData.telefono : client.telefono,
            client.id_usuario
          ]
        );

        await conn.execute(
          `UPDATE cliente SET nivel_fidelidad = ?, direccion = ?, estado = ? WHERE id_cliente = ?`,
          [
            clientData.nivel_fidelidad !== undefined ? clientData.nivel_fidelidad : client.nivel_fidelidad,
            clientData.direccion !== undefined ? clientData.direccion : client.direccion,
            clientData.estado !== undefined ? clientData.estado : client.estado,
            clientId
          ]
        );
        return true;
      }

      // Fallback
      const cObj = mockStore.clientes.find((c) => c.id_cliente === clientId);
      const uObj = mockStore.usuarios.find((u) => u.id_usuario === client.id_usuario);
      if (cObj && uObj) {
        if (clientData.nombre) uObj.nombre = clientData.nombre;
        if (clientData.apellido) uObj.apellido = clientData.apellido;
        if (clientData.correo) uObj.correo = clientData.correo;
        if (clientData.telefono !== undefined) uObj.telefono = clientData.telefono;
        if (clientData.nivel_fidelidad !== undefined) cObj.nivel_fidelidad = clientData.nivel_fidelidad;
        if (clientData.direccion !== undefined) cObj.direccion = clientData.direccion;
        if (clientData.estado !== undefined) cObj.estado = clientData.estado;
      }
      return true;
    });
  }

  static async toggleStatus(id) {
    const clientId = Number(id);
    const client = await this.findById(clientId);
    if (!client) return null;

    const newStatus = client.estado === 1 ? 0 : 1;

    if (isDatabaseConnected()) {
      await executeQuery(`UPDATE cliente SET estado = ? WHERE id_cliente = ?`, [newStatus, clientId]);
      await executeQuery(`UPDATE usuario SET estado = ? WHERE id_usuario = ?`, [newStatus, client.id_usuario]);
      return newStatus;
    }

    const c = mockStore.clientes.find((cl) => cl.id_cliente === clientId);
    if (c) c.estado = newStatus;
    const u = mockStore.usuarios.find((user) => user.id_usuario === client.id_usuario);
    if (u) u.estado = newStatus;

    return newStatus;
  }
}

export { ClientsRepository as ClientsModel };
export default ClientsRepository;

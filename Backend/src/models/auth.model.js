import { executeQuery, isDatabaseConnected } from "../config/db.js";
import { mockStore } from "../config/mockStore.js";

export class AuthRepository {
  static async findByEmail(email) {
    const cleanEmail = email.trim().toLowerCase();

    if (isDatabaseConnected()) {
      const sql = `
        SELECT u.*, r.nombre_rol as rol
        FROM usuario u
        JOIN rol r ON u.id_rol = r.id_rol
        WHERE LOWER(u.correo) = ?
        LIMIT 1
      `;
      const rows = await executeQuery(sql, [cleanEmail]);
      return rows && rows.length > 0 ? rows[0] : null;
    }

    // Fallback store
    const user = mockStore.usuarios.find((u) => u.correo.toLowerCase() === cleanEmail);
    if (!user) return null;
    const role = mockStore.roles.find((r) => r.id_rol === user.id_rol);
    return { ...user, rol: role ? role.nombre_rol : "Cliente" };
  }

  static async findById(id_usuario) {
    const id = Number(id_usuario);

    if (isDatabaseConnected()) {
      const sql = `
        SELECT u.id_usuario, u.nombre, u.apellido, u.correo, u.telefono, u.id_rol, u.estado, u.fecha_registro, r.nombre_rol as rol
        FROM usuario u
        JOIN rol r ON u.id_rol = r.id_rol
        WHERE u.id_usuario = ?
        LIMIT 1
      `;
      const rows = await executeQuery(sql, [id]);
      return rows && rows.length > 0 ? rows[0] : null;
    }

    const user = mockStore.usuarios.find((u) => u.id_usuario === id);
    if (!user) return null;
    const role = mockStore.roles.find((r) => r.id_rol === user.id_rol);
    const { contrasena, ...safeUser } = user;
    return { ...safeUser, rol: role ? role.nombre_rol : "Cliente" };
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
        userData.id_rol || 4,
        userData.estado !== undefined ? userData.estado : 1
      ]);
      const userId = result.insertId;

      // Si es rol 4 (Cliente), asegurar creación de fila cliente con nivel mínimo 'Nuevo'
      if ((userData.id_rol || 4) === 4) {
        await executeQuery(
          `INSERT INTO cliente (id_usuario, nivel_fidelidad, direccion, estado) VALUES (?, 'Nuevo', ?, 1)`,
          [userId, userData.direccion || null]
        );
      }

      return userId;
    }

    const nextId = Math.max(...mockStore.usuarios.map((u) => u.id_usuario || 0), 0) + 1;
    const newUser = {
      id_usuario: nextId,
      nombre: userData.nombre,
      apellido: userData.apellido,
      correo: userData.correo,
      contrasena: userData.contrasena,
      telefono: userData.telefono || null,
      id_rol: userData.id_rol || 4,
      estado: userData.estado !== undefined ? userData.estado : 1,
      fecha_registro: new Date().toISOString().replace("T", " ").substring(0, 19)
    };
    mockStore.usuarios.push(newUser);

    // Si es rol 4 (Cliente), inicializar cliente con nivel mínimo 'Nuevo' en mockStore
    if ((userData.id_rol || 4) === 4) {
      const nextClientId = Math.max(...mockStore.clientes.map((c) => c.id_cliente || 0), 0) + 1;
      mockStore.clientes.push({
        id_cliente: nextClientId,
        id_usuario: nextId,
        nivel_fidelidad: "Nuevo",
        direccion: userData.direccion || "",
        estado: 1
      });
    }

    return nextId;
  }

  static async updatePassword(id_usuario, newPasswordHash) {
    const id = Number(id_usuario);

    if (isDatabaseConnected()) {
      const sql = `UPDATE usuario SET contrasena = ? WHERE id_usuario = ?`;
      await executeQuery(sql, [newPasswordHash, id]);
      return true;
    }

    const user = mockStore.usuarios.find((u) => u.id_usuario === id);
    if (user) {
      user.contrasena = newPasswordHash;
      return true;
    }
    return false;
  }

  static async updateProfile(id_usuario, profileData) {
    const id = Number(id_usuario);

    if (isDatabaseConnected()) {
      const sql = `UPDATE usuario SET nombre = ?, apellido = ?, telefono = ? WHERE id_usuario = ?`;
      await executeQuery(sql, [profileData.nombre, profileData.apellido, profileData.telefono || null, id]);
      return true;
    }

    const user = mockStore.usuarios.find((u) => u.id_usuario === id);
    if (user) {
      user.nombre = profileData.nombre;
      user.apellido = profileData.apellido;
      user.telefono = profileData.telefono || null;
      return true;
    }
    return false;
  }

  static async findClientByUserId(id_usuario) {
    const id = Number(id_usuario);
    if (isDatabaseConnected()) {
      const sql = `SELECT * FROM cliente WHERE id_usuario = ? LIMIT 1`;
      const rows = await executeQuery(sql, [id]);
      return rows && rows.length > 0 ? rows[0] : null;
    }
    return mockStore.clientes.find((c) => c.id_usuario === id) || null;
  }

  static async logAccess(id_usuario, accion, ip_origen) {
    const id = Number(id_usuario);
    const now = new Date().toISOString().replace("T", " ").substring(0, 19);

    if (isDatabaseConnected()) {
      const sql = `INSERT INTO bitacora_acceso (id_usuario, accion, ip_origen, fecha_hora) VALUES (?, ?, ?, ?)`;
      await executeQuery(sql, [id, accion, ip_origen || null, now]);
      return;
    }

    mockStore.bitacora.push({
      id_log: mockStore.bitacora.length + 1,
      id_usuario: id,
      accion,
      ip_origen,
      fecha_hora: now
    });
  }

  static async getUserPermissions(id_rol) {
    const roleId = Number(id_rol);

    if (isDatabaseConnected()) {
      const sql = `
        SELECT p.accion, m.nombre_modulo
        FROM rol_permiso rp
        JOIN permiso p ON rp.id_permiso = p.id_permiso
        JOIN modulo m ON p.id_modulo = m.id_modulo
        WHERE rp.id_rol = ?
      `;
      const rows = await executeQuery(sql, [roleId]);
      return rows ? rows.map((r) => `${r.nombre_modulo}_${r.accion}`) : [];
    }

    const assigned = mockStore.rol_permisos.filter((rp) => rp.id_rol === roleId);
    return assigned.map((rp) => {
      const p = mockStore.permisos.find((perm) => perm.id_permiso === rp.id_permiso);
      if (!p) return "";
      const m = mockStore.modulos.find((mod) => mod.id_modulo === p.id_modulo);
      return m ? `${m.nombre_modulo}_${p.accion}` : p.accion;
    }).filter(Boolean);
  }
}

export { AuthRepository as AuthModel };
export default AuthRepository;

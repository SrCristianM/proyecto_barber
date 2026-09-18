import { executeQuery, executeTransaction, isDatabaseConnected } from "../config/db.js";
import { mockStore } from "../config/mockStore.js";

export class RolesRepository {
  static async findAll() {
    if (isDatabaseConnected()) {
      const sql = `
        SELECT r.id_rol, r.nombre_rol, r.descripcion, r.estado, r.fecha_creacion,
               COUNT(u.id_usuario) as total_usuarios
        FROM rol r
        LEFT JOIN usuario u ON r.id_rol = u.id_rol AND u.estado = 1
        GROUP BY r.id_rol
        ORDER BY r.id_rol ASC
      `;
      const roles = await executeQuery(sql);

      // Traer permisos de cada rol
      for (const role of roles) {
        const permsSql = `
          SELECT p.id_permiso, p.accion, m.nombre_modulo
          FROM rol_permiso rp
          JOIN permiso p ON rp.id_permiso = p.id_permiso
          JOIN modulo m ON p.id_modulo = m.id_modulo
          WHERE rp.id_rol = ?
        `;
        const perms = await executeQuery(permsSql, [role.id_rol]);
        role.permisos = perms.map((p) => `${p.nombre_modulo}_${p.accion}`);
      }

      return roles;
    }

    return mockStore.roles.map((r) => {
      const assigned = mockStore.rol_permisos.filter((rp) => rp.id_rol === r.id_rol);
      const permisos = assigned.map((rp) => {
        const p = mockStore.permisos.find((perm) => perm.id_permiso === rp.id_permiso);
        if (!p) return "";
        const m = mockStore.modulos.find((mod) => mod.id_modulo === p.id_modulo);
        return m ? `${m.nombre_modulo}_${p.accion}` : p.accion;
      }).filter(Boolean);

      const userCount = mockStore.usuarios.filter((u) => u.id_rol === r.id_rol && u.estado === 1).length;
      return {
        ...r,
        permisos,
        total_usuarios: userCount
      };
    });
  }

  static async findById(id) {
    const roleId = Number(id);

    if (isDatabaseConnected()) {
      const sql = `
        SELECT r.id_rol, r.nombre_rol, r.descripcion, r.estado, r.fecha_creacion
        FROM rol r
        WHERE r.id_rol = ?
        LIMIT 1
      `;
      const rows = await executeQuery(sql, [roleId]);
      if (!rows || rows.length === 0) return null;

      const role = rows[0];
      const permsSql = `
        SELECT p.id_permiso, p.accion, m.nombre_modulo
        FROM rol_permiso rp
        JOIN permiso p ON rp.id_permiso = p.id_permiso
        JOIN modulo m ON p.id_modulo = m.id_modulo
        WHERE rp.id_rol = ?
      `;
      const perms = await executeQuery(permsSql, [roleId]);
      role.permisos = perms.map((p) => `${p.nombre_modulo}_${p.accion}`);
      return role;
    }

    const r = mockStore.roles.find((role) => role.id_rol === roleId);
    if (!r) return null;

    const assigned = mockStore.rol_permisos.filter((rp) => rp.id_rol === r.id_rol);
    const permisos = assigned.map((rp) => {
      const p = mockStore.permisos.find((perm) => perm.id_permiso === rp.id_permiso);
      if (!p) return "";
      const m = mockStore.modulos.find((mod) => mod.id_modulo === p.id_modulo);
      return m ? `${m.nombre_modulo}_${p.accion}` : p.accion;
    }).filter(Boolean);

    return { ...r, permisos };
  }

  static async create(roleData) {
    return await executeTransaction(async (conn) => {
      if (isDatabaseConnected() && conn) {
        const insertRoleSql = `INSERT INTO rol (nombre_rol, descripcion, estado) VALUES (?, ?, ?)`;
        const [result] = await conn.execute(insertRoleSql, [
          roleData.nombre_rol,
          roleData.descripcion || null,
          roleData.estado !== undefined ? roleData.estado : 1
        ]);
        const roleId = result.insertId;

        // Asignar permisos si fueron provistos
        if (Array.isArray(roleData.permisos) && roleData.permisos.length > 0) {
          for (const permKey of roleData.permisos) {
            const delimiter = permKey.includes(":") ? ":" : "_";
            const parts = permKey.split(delimiter);
            if (parts.length >= 2) {
              const mod = parts[0];
              const acc = parts.slice(1).join(delimiter);
              const [pRows] = await conn.execute(
                `SELECT p.id_permiso FROM permiso p JOIN modulo m ON p.id_modulo = m.id_modulo WHERE LOWER(m.nombre_modulo) = LOWER(?) AND LOWER(p.accion) = LOWER(?) LIMIT 1`,
                [mod, acc]
              );
              let idPermiso = pRows.length > 0 ? pRows[0].id_permiso : null;
              if (!idPermiso) {
                let [mRows] = await conn.execute(`SELECT id_modulo FROM modulo WHERE LOWER(nombre_modulo) = LOWER(?) LIMIT 1`, [mod]);
                let idModulo = mRows.length > 0 ? mRows[0].id_modulo : null;
                if (!idModulo) {
                  const [mRes] = await conn.execute(`INSERT INTO modulo (nombre_modulo) VALUES (?)`, [mod]);
                  idModulo = mRes.insertId;
                }
                const [pRes] = await conn.execute(`INSERT INTO permiso (id_modulo, accion) VALUES (?, ?)`, [idModulo, acc]);
                idPermiso = pRes.insertId;
              }
              await conn.execute(`INSERT IGNORE INTO rol_permiso (id_rol, id_permiso) VALUES (?, ?)`, [roleId, idPermiso]);
            }
          }
        }
        return roleId;
      }

      const nextId = Math.max(...mockStore.roles.map((r) => r.id_rol || 0), 0) + 1;
      const newRole = {
        id_rol: nextId,
        nombre_rol: roleData.nombre_rol,
        descripcion: roleData.descripcion || "",
        estado: roleData.estado !== undefined ? roleData.estado : 1,
        fecha_creacion: new Date().toISOString().replace("T", " ").substring(0, 19)
      };
      mockStore.roles.push(newRole);

      if (Array.isArray(roleData.permisos)) {
        roleData.permisos.forEach((permKey) => {
          const delimiter = permKey.includes(":") ? ":" : "_";
          const parts = permKey.split(delimiter);
          const modName = parts[0] || "general";
          const acc = parts.slice(1).join(delimiter) || permKey;

          let permObj = mockStore.permisos.find((p) => {
            const m = mockStore.modulos.find((mod) => mod.id_modulo === p.id_modulo);
            if (!m) return false;
            return m.nombre_modulo.toLowerCase() === modName.toLowerCase() &&
                   p.accion.toLowerCase() === acc.toLowerCase();
          });
          if (!permObj) {
            let mObj = mockStore.modulos.find((m) => m.nombre_modulo.toLowerCase() === modName.toLowerCase());
            if (!mObj) {
              mObj = { id_modulo: mockStore.modulos.length + 1, nombre_modulo: modName };
              mockStore.modulos.push(mObj);
            }
            permObj = { id_permiso: mockStore.permisos.length + 1, id_modulo: mObj.id_modulo, accion: acc };
            mockStore.permisos.push(permObj);
          }
          mockStore.rol_permisos.push({ id_rol: nextId, id_permiso: permObj.id_permiso });
        });
      }
      mockStore.saveToFile();

      return nextId;
    });
  }

  static async update(id, roleData) {
    const roleId = Number(id);

    // Regla de sistema anti-lockout: el rol 1 (Administrador) SIEMPRE debe retener los permisos de gestión de roles
    if (roleId === 1 && Array.isArray(roleData.permisos)) {
      const requiredRolesPerms = ["roles_ver", "roles_crear", "roles_editar", "roles_eliminar", "roles_asignar"];
      roleData.permisos = Array.from(new Set([...roleData.permisos, ...requiredRolesPerms]));
    }

    return await executeTransaction(async (conn) => {
      if (isDatabaseConnected() && conn) {
        if (roleData.nombre_rol || roleData.descripcion !== undefined || roleData.estado !== undefined) {
          const fields = [];
          const values = [];
          if (roleData.nombre_rol) { fields.push("nombre_rol = ?"); values.push(roleData.nombre_rol); }
          if (roleData.descripcion !== undefined) { fields.push("descripcion = ?"); values.push(roleData.descripcion); }
          if (roleData.estado !== undefined) { fields.push("estado = ?"); values.push(roleData.estado); }
          values.push(roleId);
          await conn.execute(`UPDATE rol SET ${fields.join(", ")} WHERE id_rol = ?`, values);
        }

        if (Array.isArray(roleData.permisos)) {
          // Reemplazar permisos
          await conn.execute(`DELETE FROM rol_permiso WHERE id_rol = ?`, [roleId]);
          for (const rawPerm of roleData.permisos) {
            if (rawPerm === null || rawPerm === undefined) continue;
            if (typeof rawPerm === "number" || (!isNaN(Number(rawPerm)) && !String(rawPerm).includes(":") && !String(rawPerm).includes("_"))) {
              await conn.execute(`INSERT IGNORE INTO rol_permiso (id_rol, id_permiso) VALUES (?, ?)`, [roleId, Number(rawPerm)]);
              continue;
            }
            const permKey = String(rawPerm);
            const delimiter = permKey.includes(":") ? ":" : "_";
            const parts = permKey.split(delimiter);
            if (parts.length >= 2) {
              const mod = parts[0];
              const acc = parts.slice(1).join(delimiter);
              const [pRows] = await conn.execute(
                `SELECT p.id_permiso FROM permiso p JOIN modulo m ON p.id_modulo = m.id_modulo WHERE LOWER(m.nombre_modulo) = LOWER(?) AND LOWER(p.accion) = LOWER(?) LIMIT 1`,
                [mod, acc]
              );
              let idPermiso = pRows.length > 0 ? pRows[0].id_permiso : null;
              if (!idPermiso) {
                let [mRows] = await conn.execute(`SELECT id_modulo FROM modulo WHERE LOWER(nombre_modulo) = LOWER(?) LIMIT 1`, [mod]);
                let idModulo = mRows.length > 0 ? mRows[0].id_modulo : null;
                if (!idModulo) {
                  const [mRes] = await conn.execute(`INSERT INTO modulo (nombre_modulo) VALUES (?)`, [mod]);
                  idModulo = mRes.insertId;
                }
                const [pRes] = await conn.execute(`INSERT INTO permiso (id_modulo, accion) VALUES (?, ?)`, [idModulo, acc]);
                idPermiso = pRes.insertId;
              }
              await conn.execute(`INSERT IGNORE INTO rol_permiso (id_rol, id_permiso) VALUES (?, ?)`, [roleId, idPermiso]);
            }
          }
        }
        return true;
      }

      const role = mockStore.roles.find((r) => r.id_rol === roleId);
      if (!role) return false;
      if (roleData.nombre_rol) role.nombre_rol = roleData.nombre_rol;
      if (roleData.descripcion !== undefined) role.descripcion = roleData.descripcion;
      if (roleData.estado !== undefined) role.estado = roleData.estado;

      if (Array.isArray(roleData.permisos)) {
        mockStore.rol_permisos = mockStore.rol_permisos.filter((rp) => rp.id_rol !== roleId);
        roleData.permisos.forEach((rawPerm) => {
          if (rawPerm === null || rawPerm === undefined) return;
          if (typeof rawPerm === "number" || (!isNaN(Number(rawPerm)) && !String(rawPerm).includes(":") && !String(rawPerm).includes("_"))) {
            const numId = Number(rawPerm);
            const permObj = mockStore.permisos.find((p) => p.id_permiso === numId);
            if (permObj) {
              mockStore.rol_permisos.push({ id_rol: roleId, id_permiso: permObj.id_permiso });
            }
            return;
          }
          const permKey = String(rawPerm);
          const delimiter = permKey.includes(":") ? ":" : "_";
          const parts = permKey.split(delimiter);
          const modName = parts[0] || "general";
          const acc = parts.slice(1).join(delimiter) || permKey;

          let permObj = mockStore.permisos.find((p) => {
            const m = mockStore.modulos.find((mod) => mod.id_modulo === p.id_modulo);
            if (!m) return false;
            return m.nombre_modulo.toLowerCase() === modName.toLowerCase() &&
                   p.accion.toLowerCase() === acc.toLowerCase();
          });
          if (!permObj) {
            let mObj = mockStore.modulos.find((m) => m.nombre_modulo.toLowerCase() === modName.toLowerCase());
            if (!mObj) {
              mObj = { id_modulo: mockStore.modulos.length + 1, nombre_modulo: modName };
              mockStore.modulos.push(mObj);
            }
            permObj = { id_permiso: mockStore.permisos.length + 1, id_modulo: mObj.id_modulo, accion: acc };
            mockStore.permisos.push(permObj);
          }
          mockStore.rol_permisos.push({ id_rol: roleId, id_permiso: permObj.id_permiso });
        });
      }
      mockStore.saveToFile();

      return true;
    });
  }

  static async toggleStatus(id) {
    const roleId = Number(id);
    const role = await this.findById(roleId);
    if (!role) return null;

    const newStatus = role.estado === 1 ? 0 : 1;

    if (isDatabaseConnected()) {
      await executeQuery(`UPDATE rol SET estado = ? WHERE id_rol = ?`, [newStatus, roleId]);
      return newStatus;
    }

    const target = mockStore.roles.find((r) => r.id_rol === roleId);
    if (target) target.estado = newStatus;
    mockStore.saveToFile();
    return newStatus;
  }

  static async delete(id) {
    const roleId = Number(id);
    if (isDatabaseConnected()) {
      await executeQuery(`DELETE FROM rol_permiso WHERE id_rol = ?`, [roleId]);
      await executeQuery(`DELETE FROM rol WHERE id_rol = ?`, [roleId]);
      return true;
    }
    mockStore.rol_permisos = mockStore.rol_permisos.filter((rp) => rp.id_rol !== roleId);
    mockStore.roles = mockStore.roles.filter((r) => r.id_rol !== roleId);
    mockStore.saveToFile();
    return true;
  }

  static async getSystemModules() {
    if (isDatabaseConnected()) {
      const sql = `
        SELECT m.id_modulo, m.nombre_modulo,
               JSON_ARRAYAGG(JSON_OBJECT('id_permiso', p.id_permiso, 'accion', p.accion)) as acciones
        FROM modulo m
        LEFT JOIN permiso p ON m.id_modulo = p.id_modulo
        GROUP BY m.id_modulo
        ORDER BY m.id_modulo ASC
      `;
      return await executeQuery(sql);
    }

    return mockStore.modulos.map((m) => {
      const perms = mockStore.permisos.filter((p) => p.id_modulo === m.id_modulo);
      return {
        id_modulo: m.id_modulo,
        nombre_modulo: m.nombre_modulo,
        acciones: perms.map((p) => ({ id_permiso: p.id_permiso, accion: p.accion }))
      };
    });
  }
}

export { RolesRepository as RolesModel };
export default RolesRepository;

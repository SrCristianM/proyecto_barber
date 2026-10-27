import { executeQuery, isDatabaseConnected } from "../config/db.js";
import { mockStore } from "../config/mockStore.js";

export class AuthRepository {
  static async findByEmail(email) {
    const cleanEmail = email.trim().toLowerCase();

    if (isDatabaseConnected()) {
      const sql = "SELECT u.*, r.nombre_rol as rol FROM usuario u JOIN rol r ON u.id_rol = r.id_rol WHERE LOWER(u.correo) = ? LIMIT 1";
      const rows = await executeQuery(sql, [cleanEmail]);
      if (rows && rows.length > 0) {
        const row = rows[0];
        const img = row.imagen_url && !row.imagen_url.includes("unsplash.com") ? row.imagen_url : null;
        return { ...row, imagen_url: img, avatar_url: img };
      }
      return null;
    }

    // Fallback store
    const user = mockStore.usuarios.find((u) => u.correo.toLowerCase() === cleanEmail);
    if (!user) return null;
    const role = mockStore.roles.find((r) => r.id_rol === user.id_rol);
    const barber = mockStore.barberos.find((b) => b.id_usuario === user.id_usuario);
    const client = mockStore.clientes.find((c) => c.id_usuario === user.id_usuario);
    
    // Si el usuario tiene imagen_url explícita (incluso null/vacía tras eliminarla), respetarla
    let cleanImg = null;
    const userPhoto = user.imagen_url !== undefined ? user.imagen_url : user.avatar_url;
    if (userPhoto && typeof userPhoto === "string" && userPhoto.trim() && !userPhoto.includes("unsplash.com")) {
      cleanImg = userPhoto.trim();
    } else if (userPhoto === undefined) {
      const bPhoto = barber?.imagen_url;
      if (bPhoto && typeof bPhoto === "string" && bPhoto.trim() && !bPhoto.includes("unsplash.com")) {
        cleanImg = bPhoto.trim();
      }
    }

    return {
      ...user,
      imagen_url: cleanImg,
      avatar_url: cleanImg,
      rol: role ? role.nombre_rol : "Cliente"
    };
  }

  static async findById(id_usuario) {
    const id = Number(id_usuario);

    if (isDatabaseConnected()) {
      const sql = "SELECT u.id_usuario, u.nombre, u.apellido, u.documento, u.correo, u.telefono, u.id_rol, u.estado, u.fecha_registro, u.imagen_url, r.nombre_rol as rol FROM usuario u JOIN rol r ON u.id_rol = r.id_rol WHERE u.id_usuario = ? LIMIT 1";
      const rows = await executeQuery(sql, [id]);
      if (rows && rows.length > 0) {
        const row = rows[0];
        const img = row.imagen_url && !row.imagen_url.includes("unsplash.com") && row.imagen_url.trim() ? row.imagen_url.trim() : null;
        return { ...row, imagen_url: img, avatar_url: img };
      }
      return null;
    }

    const user = mockStore.usuarios.find((u) => u.id_usuario === id);
    if (!user) return null;
    const role = mockStore.roles.find((r) => r.id_rol === user.id_rol);
    const barber = mockStore.barberos.find((b) => b.id_usuario === id);
    const client = mockStore.clientes.find((c) => c.id_usuario === id);
    
    // Si el usuario tiene imagen_url explícita (incluso null/vacía tras eliminarla), respetarla
    let cleanImg = null;
    const userPhoto = user.imagen_url !== undefined ? user.imagen_url : user.avatar_url;
    if (userPhoto && typeof userPhoto === "string" && userPhoto.trim() && !userPhoto.includes("unsplash.com")) {
      cleanImg = userPhoto.trim();
    } else if (userPhoto === undefined) {
      const bPhoto = barber?.imagen_url;
      if (bPhoto && typeof bPhoto === "string" && bPhoto.trim() && !bPhoto.includes("unsplash.com")) {
        cleanImg = bPhoto.trim();
      }
    }

    const { contrasena, ...safeUser } = user;
    return {
      ...safeUser,
      imagen_url: cleanImg,
      avatar_url: cleanImg,
      rol: role ? role.nombre_rol : "Cliente"
    };
  }

  static async findByDocumento(documento) {
    if (!documento) return null;
    const cleanDoc = String(documento).trim();

    if (isDatabaseConnected()) {
      const sql = "SELECT u.*, r.nombre_rol as rol FROM usuario u JOIN rol r ON u.id_rol = r.id_rol WHERE u.documento = ? LIMIT 1";
      const rows = await executeQuery(sql, [cleanDoc]);
      return rows && rows.length > 0 ? rows[0] : null;
    }

    const user = mockStore.usuarios.find(
      (u) => u.documento && String(u.documento).trim() === cleanDoc
    );
    if (!user) return null;
    const role = mockStore.roles.find((r) => r.id_rol === user.id_rol);
    return { ...user, rol: role ? role.nombre_rol : "Cliente" };
  }

  static async getAllActiveUsers() {
    if (isDatabaseConnected()) {
      const sql = "SELECT u.id_usuario, u.nombre, u.apellido, u.correo, u.id_rol, u.imagen_url, r.nombre_rol as rol FROM usuario u JOIN rol r ON u.id_rol = r.id_rol WHERE u.estado = 1 ORDER BY u.id_rol ASC, u.id_usuario ASC";
      const rows = await executeQuery(sql);
      return (rows || []).map((u) => ({
        id_usuario: u.id_usuario,
        nombre: (u.nombre + " " + (u.apellido || "")).trim(),
        email: u.correo,
        id_rol: u.id_rol,
        rol_nombre: u.rol,
        imagen_url: u.imagen_url && !u.imagen_url.includes("unsplash.com") ? u.imagen_url : null
      }));
    }

    return mockStore.usuarios
      .filter((u) => u.estado === 1)
      .map((u) => {
        const role = mockStore.roles.find((r) => r.id_rol === u.id_rol);
        const barber = mockStore.barberos.find((b) => b.id_usuario === u.id_usuario);
        const client = mockStore.clientes.find((c) => c.id_usuario === u.id_usuario);
        const rawImg = u.imagen_url || u.avatar_url || barber?.imagen_url || client?.avatar_url || null;
        const cleanImg = rawImg && !rawImg.includes("unsplash.com") ? rawImg : null;

        return {
          id_usuario: u.id_usuario,
          nombre: (u.nombre + " " + (u.apellido || "")).trim(),
          email: u.correo,
          id_rol: u.id_rol,
          rol_nombre: role ? role.nombre_rol : "Cliente",
          imagen_url: cleanImg
        };
      });
  }

  static async create(userData) {
    const rawImg = userData.imagen_url || userData.avatar_url || null;
    const cleanImg = rawImg && !rawImg.includes("unsplash.com") ? rawImg : null;

    if (isDatabaseConnected()) {
      const sql = "INSERT INTO usuario (nombre, apellido, documento, correo, contrasena, telefono, id_rol, imagen_url, estado) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
      const result = await executeQuery(sql, [
        userData.nombre,
        userData.apellido,
        userData.documento || null,
        userData.correo,
        userData.contrasena,
        userData.telefono || null,
        userData.id_rol || 4,
        cleanImg,
        userData.estado !== undefined ? userData.estado : 1
      ]);
      const userId = result.insertId;

      // Si es rol 4 (Cliente), asegurar creación de fila cliente con nivel mínimo 'Nuevo'
      if ((userData.id_rol || 4) === 4) {
        await executeQuery(
          "INSERT INTO cliente (id_usuario, nivel_fidelidad, direccion, estado) VALUES (?, 'Nuevo', ?, 1)",
          [userId, userData.direccion || null]
        );
      }

      return userId;
    }

    const nextId = Math.max(...mockStore.usuarios.map((u) => u.id_usuario || 0), 0) + 1;
    const newUser = {
      id_usuario: nextId,
      tipo_documento: userData.tipo_documento || "CC",
      nombre: userData.nombre,
      apellido: userData.apellido,
      documento: userData.documento || null,
      correo: userData.correo,
      contrasena: userData.contrasena,
      telefono: userData.telefono || null,
      id_rol: userData.id_rol || 4,
      imagen_url: cleanImg,
      avatar_url: cleanImg,
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
        tipo_documento: userData.tipo_documento || "CC",
        documento: userData.documento || null,
        nivel_fidelidad: "Nuevo",
        direccion: userData.direccion || "",
        imagen_url: cleanImg,
        estado: 1
      });
    }

    mockStore.saveToFile();
    return nextId;
  }

  static async updatePassword(id_usuario, newPasswordHash) {
    const id = Number(id_usuario);

    if (isDatabaseConnected()) {
      const sql = "UPDATE usuario SET contrasena = ? WHERE id_usuario = ?";
      await executeQuery(sql, [newPasswordHash, id]);
      return true;
    }

    const user = mockStore.usuarios.find((u) => u.id_usuario === id);
    if (user) {
      user.contrasena = newPasswordHash;
      mockStore.saveToFile();
      return true;
    }
    return false;
  }

  static async updateProfile(id_usuario, profileData) {
    const id = Number(id_usuario);
    const hasPhoto = ("imagen_url" in profileData) || ("avatar_url" in profileData) || ("foto" in profileData);
    const rawPhoto = profileData.imagen_url !== undefined
      ? profileData.imagen_url
      : (profileData.avatar_url !== undefined ? profileData.avatar_url : profileData.foto);
    const cleanPhoto = (rawPhoto && typeof rawPhoto === "string" && !rawPhoto.includes("unsplash.com"))
      ? rawPhoto.trim() || null
      : null;

    if (isDatabaseConnected()) {
      const hasDoc = profileData.documento !== undefined;

      let sql = "UPDATE usuario SET nombre = ?, apellido = ?, telefono = ?";
      const params = [profileData.nombre, profileData.apellido, profileData.telefono || null];

      if (hasDoc) {
        sql += ", documento = ?";
        params.push(profileData.documento || null);
      }
      if (hasPhoto) {
        sql += ", imagen_url = ?";
        params.push(cleanPhoto);
      }

      sql += " WHERE id_usuario = ?";
      params.push(id);

      await executeQuery(sql, params);

      // Si es barbero o cliente, sincronizar imagen en sus tablas respectivas
      if (hasPhoto) {
        await executeQuery("UPDATE barbero SET imagen_url = ? WHERE id_usuario = ?", [cleanPhoto, id]);
        await executeQuery("UPDATE cliente SET imagen_url = ? WHERE id_usuario = ?", [cleanPhoto, id]);
      }

      return true;
    }

    const user = mockStore.usuarios.find((u) => u.id_usuario === id);
    if (user) {
      user.nombre = profileData.nombre;
      user.apellido = profileData.apellido;
      if (profileData.documento !== undefined) user.documento = profileData.documento || null;
      user.telefono = profileData.telefono || null;
      
      if (hasPhoto) {
        user.imagen_url = cleanPhoto;
        user.avatar_url = cleanPhoto;
      }

      const barber = mockStore.barberos.find((b) => b.id_usuario === id);
      if (barber && hasPhoto) {
        barber.imagen_url = cleanPhoto;
      }
      const client = mockStore.clientes.find((c) => c.id_usuario === id);
      if (client && hasPhoto) {
        client.avatar_url = cleanPhoto;
        client.imagen_url = cleanPhoto;
      }

      mockStore.saveToFile();
      return true;
    }
    return false;
  }

  static async findClientByUserId(id_usuario) {
    const id = Number(id_usuario);
    if (isDatabaseConnected()) {
      const sql = "SELECT * FROM cliente WHERE id_usuario = ? LIMIT 1";
      const rows = await executeQuery(sql, [id]);
      return rows && rows.length > 0 ? rows[0] : null;
    }
    return mockStore.clientes.find((c) => c.id_usuario === id) || null;
  }

  static async findBarberByUserId(id_usuario) {
    const id = Number(id_usuario);
    if (isDatabaseConnected()) {
      const sql = "SELECT * FROM barbero WHERE id_usuario = ? LIMIT 1";
      const rows = await executeQuery(sql, [id]);
      if (rows && rows.length > 0) {
        const row = rows[0];
        const clean = row.imagen_url && !row.imagen_url.includes("unsplash.com") && row.imagen_url.trim() ? row.imagen_url.trim() : null;
        return { ...row, imagen_url: clean };
      }
      return null;
    }
    const b = mockStore.barberos.find((barb) => barb.id_usuario === id);
    if (!b) return null;
    const clean = b.imagen_url && !b.imagen_url.includes("unsplash.com") && typeof b.imagen_url === "string" && b.imagen_url.trim() ? b.imagen_url.trim() : null;
    return { ...b, imagen_url: clean };
  }

  static async getUserPermissions(id_rol) {
    const roleId = Number(id_rol);

    if (isDatabaseConnected()) {
      const sql = "SELECT p.accion, m.nombre_modulo FROM rol_permiso rp JOIN permiso p ON rp.id_permiso = p.id_permiso JOIN modulo m ON p.id_modulo = m.id_modulo WHERE rp.id_rol = ?";
      const rows = await executeQuery(sql, [roleId]);
      return rows ? rows.map((r) => (r.nombre_modulo + "_" + r.accion).toLowerCase()) : [];
    }

    const assigned = mockStore.rol_permisos.filter((rp) => rp.id_rol === roleId);
    return assigned.map((rp) => {
      const p = mockStore.permisos.find((perm) => perm.id_permiso === rp.id_permiso);
      if (!p) return "";
      const m = mockStore.modulos.find((mod) => mod.id_modulo === p.id_modulo);
      return m ? (m.nombre_modulo + "_" + p.accion).toLowerCase() : p.accion.toLowerCase();
    }).filter(Boolean);
  }
}

export { AuthRepository as AuthModel };
export default AuthRepository;

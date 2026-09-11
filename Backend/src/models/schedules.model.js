import { executeQuery, executeTransaction, isDatabaseConnected } from "../config/db.js";
import { mockStore } from "../config/mockStore.js";

export class SchedulesRepository {
  static async findAll({ barber = "all", status = "all", day = "all" } = {}) {
    if (isDatabaseConnected()) {
      let sql = `
        SELECT h.id_horario, h.id_barbero, h.dia_semana, h.hora_inicio, h.hora_fin, h.estado,
               CONCAT(u.nombre, ' ', u.apellido) as barbero_nombre
        FROM horario h
        JOIN barbero b ON h.id_barbero = b.id_barbero
        JOIN usuario u ON b.id_usuario = u.id_usuario
        WHERE 1=1
      `;
      const params = [];

      if (barber !== "all") {
        sql += ` AND h.id_barbero = ?`;
        params.push(Number(barber));
      }

      if (status !== "all") {
        sql += ` AND h.estado = ?`;
        params.push(Number(status));
      }

      if (day !== "all") {
        sql += ` AND h.dia_semana = ?`;
        params.push(day);
      }

      sql += ` ORDER BY h.id_barbero, FIELD(h.dia_semana, 'Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado', 'Domingo')`;
      return await executeQuery(sql, params);
    }

    return mockStore.horarios
      .map((h) => {
        const b = mockStore.barberos.find((barb) => barb.id_barbero === h.id_barbero);
        const u = b ? mockStore.usuarios.find((usr) => usr.id_usuario === b.id_usuario) : null;
        return {
          ...h,
          barbero_nombre: u ? `${u.nombre} ${u.apellido}` : "Sin Barbero"
        };
      })
      .filter((h) => {
        const matchesBarber = barber === "all" || String(h.id_barbero) === String(barber);
        const matchesStatus = status === "all" || (status === "1" && h.estado === 1) || (status === "0" && h.estado === 0);
        const matchesDay = day === "all" || h.dia_semana === day;
        return matchesBarber && matchesStatus && matchesDay;
      });
  }

  static async findById(id) {
    const scheduleId = Number(id);

    if (isDatabaseConnected()) {
      const sql = `
        SELECT h.id_horario, h.id_barbero, h.dia_semana, h.hora_inicio, h.hora_fin, h.estado,
               CONCAT(u.nombre, ' ', u.apellido) as barbero_nombre
        FROM horario h
        JOIN barbero b ON h.id_barbero = b.id_barbero
        JOIN usuario u ON b.id_usuario = u.id_usuario
        WHERE h.id_horario = ?
        LIMIT 1
      `;
      const rows = await executeQuery(sql, [scheduleId]);
      return rows && rows.length > 0 ? rows[0] : null;
    }

    const h = mockStore.horarios.find((hor) => hor.id_horario === scheduleId);
    if (!h) return null;
    const b = mockStore.barberos.find((barb) => barb.id_barbero === h.id_barbero);
    const u = b ? mockStore.usuarios.find((usr) => usr.id_usuario === b.id_usuario) : null;
    return {
      ...h,
      barbero_nombre: u ? `${u.nombre} ${u.apellido}` : "Sin Barbero"
    };
  }

  static async findByBarberAndDay(barberId, dayOfWeek) {
    const bId = Number(barberId);

    if (isDatabaseConnected()) {
      const sql = `SELECT * FROM horario WHERE id_barbero = ? AND dia_semana = ? AND estado = 1 LIMIT 1`;
      const rows = await executeQuery(sql, [bId, dayOfWeek]);
      return rows && rows.length > 0 ? rows[0] : null;
    }

    return mockStore.horarios.find((h) => h.id_barbero === bId && h.dia_semana === dayOfWeek && h.estado === 1) || null;
  }

  static async createMultipleDays(scheduleData) {
    const barberId = Number(scheduleData.id_barbero);
    const days = scheduleData.dias_semana;
    const horaInicio = scheduleData.hora_inicio.length === 5 ? `${scheduleData.hora_inicio}:00` : scheduleData.hora_inicio;
    const horaFin = scheduleData.hora_fin.length === 5 ? `${scheduleData.hora_fin}:00` : scheduleData.hora_fin;

    return await executeTransaction(async (conn) => {
      if (isDatabaseConnected() && conn) {
        for (const day of days) {
          const sql = `
            INSERT INTO horario (id_barbero, dia_semana, hora_inicio, hora_fin, estado)
            VALUES (?, ?, ?, ?, 1)
            ON DUPLICATE KEY UPDATE hora_inicio = VALUES(hora_inicio), hora_fin = VALUES(hora_fin), estado = 1
          `;
          await conn.execute(sql, [barberId, day, horaInicio, horaFin]);
        }
        return true;
      }

      // Fallback
      days.forEach((day) => {
        const existing = mockStore.horarios.find((h) => h.id_barbero === barberId && h.dia_semana === day);
        if (existing) {
          existing.hora_inicio = horaInicio;
          existing.hora_fin = horaFin;
          existing.estado = 1;
        } else {
          const nextId = Math.max(...mockStore.horarios.map((h) => h.id_horario || 0), 0) + 1;
          mockStore.horarios.push({
            id_horario: nextId,
            id_barbero: barberId,
            dia_semana: day,
            hora_inicio: horaInicio,
            hora_fin: horaFin,
            estado: 1
          });
        }
      });
      return true;
    });
  }

  static async update(id, scheduleData) {
    const scheduleId = Number(id);

    if (isDatabaseConnected()) {
      const fields = [];
      const values = [];

      if (scheduleData.hora_inicio) {
        const hI = scheduleData.hora_inicio.length === 5 ? `${scheduleData.hora_inicio}:00` : scheduleData.hora_inicio;
        fields.push("hora_inicio = ?");
        values.push(hI);
      }
      if (scheduleData.hora_fin) {
        const hF = scheduleData.hora_fin.length === 5 ? `${scheduleData.hora_fin}:00` : scheduleData.hora_fin;
        fields.push("hora_fin = ?");
        values.push(hF);
      }
      if (scheduleData.estado !== undefined) {
        fields.push("estado = ?");
        values.push(scheduleData.estado);
      }

      if (fields.length === 0) return true;
      values.push(scheduleId);
      const sql = `UPDATE horario SET ${fields.join(", ")} WHERE id_horario = ?`;
      await executeQuery(sql, values);
      return true;
    }

    const h = mockStore.horarios.find((hor) => hor.id_horario === scheduleId);
    if (!h) return false;
    if (scheduleData.hora_inicio) h.hora_inicio = scheduleData.hora_inicio.length === 5 ? `${scheduleData.hora_inicio}:00` : scheduleData.hora_inicio;
    if (scheduleData.hora_fin) h.hora_fin = scheduleData.hora_fin.length === 5 ? `${scheduleData.hora_fin}:00` : scheduleData.hora_fin;
    if (scheduleData.estado !== undefined) h.estado = scheduleData.estado;
    return true;
  }

  static async delete(id) {
    const scheduleId = Number(id);

    if (isDatabaseConnected()) {
      await executeQuery(`DELETE FROM horario WHERE id_horario = ?`, [scheduleId]);
      return true;
    }

    mockStore.horarios = mockStore.horarios.filter((h) => h.id_horario !== scheduleId);
    return true;
  }

  // ==========================================
  // NOVEDADES DE HORARIO
  // ==========================================
  static async findAllNovelties({ barber = "all", status = "all" } = {}) {
    if (isDatabaseConnected()) {
      let sql = `
        SELECT n.id_novedad, n.id_barbero, n.tipo, n.fecha, n.descripcion, n.estado, n.fecha_registro,
               CONCAT(u.nombre, ' ', u.apellido) as barbero_nombre
        FROM novedad_horario n
        JOIN barbero b ON n.id_barbero = b.id_barbero
        JOIN usuario u ON b.id_usuario = u.id_usuario
        WHERE 1=1
      `;
      const params = [];

      if (barber !== "all") {
        sql += ` AND n.id_barbero = ?`;
        params.push(Number(barber));
      }

      if (status !== "all") {
        sql += ` AND n.estado = ?`;
        params.push(status);
      }

      sql += ` ORDER BY n.fecha DESC`;
      return await executeQuery(sql, params);
    }

    return mockStore.novedades
      .map((n) => {
        const b = mockStore.barberos.find((barb) => barb.id_barbero === n.id_barbero);
        const u = b ? mockStore.usuarios.find((usr) => usr.id_usuario === b.id_usuario) : null;
        return {
          ...n,
          barbero_nombre: u ? `${u.nombre} ${u.apellido}` : "Sin Barbero"
        };
      })
      .filter((n) => {
        const matchesBarber = barber === "all" || String(n.id_barbero) === String(barber);
        const matchesStatus = status === "all" || n.estado === status;
        return matchesBarber && matchesStatus;
      });
  }

  static async createNovelty(noveltyData) {
    const now = new Date().toISOString().replace("T", " ").substring(0, 19);

    if (isDatabaseConnected()) {
      const sql = `
        INSERT INTO novedad_horario (id_barbero, tipo, fecha, descripcion, estado, fecha_registro)
        VALUES (?, ?, ?, ?, 'Pendiente', ?)
      `;
      const res = await executeQuery(sql, [
        Number(noveltyData.id_barbero),
        noveltyData.tipo,
        noveltyData.fecha,
        noveltyData.descripcion || null,
        now
      ]);
      return res.insertId;
    }

    const nextId = Math.max(...mockStore.novedades.map((n) => n.id_novedad || 0), 0) + 1;
    mockStore.novedades.push({
      id_novedad: nextId,
      id_barbero: Number(noveltyData.id_barbero),
      tipo: noveltyData.tipo,
      fecha: noveltyData.fecha,
      descripcion: noveltyData.descripcion || "",
      estado: "Pendiente",
      fecha_registro: now
    });
    return nextId;
  }

  static async updateNoveltyStatus(id, newStatus) {
    const noveltyId = Number(id);

    if (isDatabaseConnected()) {
      await executeQuery(`UPDATE novedad_horario SET estado = ? WHERE id_novedad = ?`, [newStatus, noveltyId]);
      return true;
    }

    const n = mockStore.novedades.find((nov) => nov.id_novedad === noveltyId);
    if (n) {
      n.estado = newStatus;
      return true;
    }
    return false;
  }

  static async hasApprovedNovelty(barberId, date) {
    const bId = Number(barberId);

    if (isDatabaseConnected()) {
      const sql = `SELECT * FROM novedad_horario WHERE id_barbero = ? AND fecha = ? AND estado = 'Aprobado' AND tipo IN ('Ausencia', 'Permiso') LIMIT 1`;
      const rows = await executeQuery(sql, [bId, date]);
      return rows && rows.length > 0;
    }

    return mockStore.novedades.some(
      (n) => n.id_barbero === bId && n.fecha === date && n.estado === "Aprobado" && ["Ausencia", "Permiso"].includes(n.tipo)
    );
  }
}

export { SchedulesRepository as SchedulesModel };
export default SchedulesRepository;

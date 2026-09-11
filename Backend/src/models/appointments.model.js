import { executeQuery, executeTransaction, isDatabaseConnected } from "../config/db.js";
import { mockStore } from "../config/mockStore.js";

export class AppointmentsRepository {
  static async findAll({ barber = "all", client = "all", date = "", status = "all", startDate = "", endDate = "" } = {}) {
    if (isDatabaseConnected()) {
      let sql = `
        SELECT c.id_cita, c.id_cliente, c.id_barbero, c.fecha, c.hora, c.estado, c.fecha_registro,
               CONCAT(uc.nombre, ' ', uc.apellido) as cliente_nombre, uc.telefono as cliente_telefono, uc.correo as cliente_correo,
               CONCAT(ub.nombre, ' ', ub.apellido) as barbero_nombre,
               COALESCE(SUM(cd.precio), 0) as total_precio
        FROM cita c
        JOIN cliente cl ON c.id_cliente = cl.id_cliente
        JOIN usuario uc ON cl.id_usuario = uc.id_usuario
        JOIN barbero b ON c.id_barbero = b.id_barbero
        JOIN usuario ub ON b.id_usuario = ub.id_usuario
        LEFT JOIN cita_detalle cd ON c.id_cita = cd.id_cita
        WHERE 1=1
      `;
      const params = [];

      if (barber !== "all") {
        sql += ` AND c.id_barbero = ?`;
        params.push(Number(barber));
      }

      if (client !== "all") {
        sql += ` AND c.id_cliente = ?`;
        params.push(Number(client));
      }

      if (date) {
        sql += ` AND c.fecha = ?`;
        params.push(date);
      }

      if (startDate) {
        sql += ` AND c.fecha >= ?`;
        params.push(startDate);
      }

      if (endDate) {
        sql += ` AND c.fecha <= ?`;
        params.push(endDate);
      }

      if (status !== "all") {
        sql += ` AND c.estado = ?`;
        params.push(status);
      }

      sql += ` GROUP BY c.id_cita ORDER BY c.fecha DESC, c.hora ASC`;
      const appointments = await executeQuery(sql, params);

      // Cargar detalles de servicios de cada cita
      for (const app of appointments) {
        const detSql = `
          SELECT cd.id_cita_detalle, cd.id_servicio, cd.precio, s.nombre as servicio_nombre, s.duracion_minutos
          FROM cita_detalle cd
          JOIN servicio s ON cd.id_servicio = s.id_servicio
          WHERE cd.id_cita = ?
        `;
        app.detalles = await executeQuery(detSql, [app.id_cita]);
        app.servicios = app.detalles;
        app.id_servicio = app.detalles.length > 0 ? app.detalles[0].id_servicio : null;
        app.precio = app.total_precio;
      }

      return appointments;
    }

    return mockStore.citas
      .map((c) => {
        const cl = mockStore.clientes.find((cli) => cli.id_cliente === c.id_cliente);
        const uc = cl ? mockStore.usuarios.find((u) => u.id_usuario === cl.id_usuario) : null;
        const b = mockStore.barberos.find((barb) => barb.id_barbero === c.id_barbero);
        const ub = b ? mockStore.usuarios.find((u) => u.id_usuario === b.id_usuario) : null;

        const details = mockStore.cita_detalles
          .filter((cd) => cd.id_cita === c.id_cita)
          .map((cd) => {
            const serv = mockStore.servicios.find((s) => s.id_servicio === cd.id_servicio);
            return {
              id_cita_detalle: cd.id_cita_detalle,
              id_servicio: cd.id_servicio,
              precio: cd.precio,
              servicio_nombre: serv ? serv.nombre : "Servicio",
              duracion_minutos: serv ? serv.duracion_minutos : 30
            };
          });

        const totalPrice = details.reduce((acc, curr) => acc + Number(curr.precio), 0);

        return {
          ...c,
          cliente_nombre: uc ? `${uc.nombre} ${uc.apellido}` : "Cliente",
          cliente_telefono: uc ? uc.telefono : "",
          cliente_correo: uc ? uc.correo : "",
          barbero_nombre: ub ? `${ub.nombre} ${ub.apellido}` : "Barbero",
          detalles: details,
          servicios: details,
          id_servicio: details.length > 0 ? details[0].id_servicio : null,
          precio: totalPrice,
          total_precio: totalPrice
        };
      })
      .filter((c) => {
        const matchesBarber = barber === "all" || String(c.id_barbero) === String(barber);
        const matchesClient = client === "all" || String(c.id_cliente) === String(client);
        const matchesDate = !date || c.fecha === date;
        const matchesStartDate = !startDate || c.fecha >= startDate;
        const matchesEndDate = !endDate || c.fecha <= endDate;
        const matchesStatus = status === "all" || c.estado === status;

        return matchesBarber && matchesClient && matchesDate && matchesStartDate && matchesEndDate && matchesStatus;
      })
      .sort((a, b) => b.fecha.localeCompare(a.fecha) || a.hora.localeCompare(b.hora));
  }

  static async findById(id) {
    const appointmentId = Number(id);

    if (isDatabaseConnected()) {
      const sql = `
        SELECT c.id_cita, c.id_cliente, c.id_barbero, c.fecha, c.hora, c.estado, c.fecha_registro,
               CONCAT(uc.nombre, ' ', uc.apellido) as cliente_nombre, uc.telefono as cliente_telefono, uc.correo as cliente_correo,
               CONCAT(ub.nombre, ' ', ub.apellido) as barbero_nombre
        FROM cita c
        JOIN cliente cl ON c.id_cliente = cl.id_cliente
        JOIN usuario uc ON cl.id_usuario = uc.id_usuario
        JOIN barbero b ON c.id_barbero = b.id_barbero
        JOIN usuario ub ON b.id_usuario = ub.id_usuario
        WHERE c.id_cita = ?
        LIMIT 1
      `;
      const rows = await executeQuery(sql, [appointmentId]);
      if (!rows || rows.length === 0) return null;

      const app = rows[0];
      const detSql = `
        SELECT cd.id_cita_detalle, cd.id_servicio, cd.precio, s.nombre as servicio_nombre, s.duracion_minutos
        FROM cita_detalle cd
        JOIN servicio s ON cd.id_servicio = s.id_servicio
        WHERE cd.id_cita = ?
      `;
      app.detalles = await executeQuery(detSql, [appointmentId]);
      app.servicios = app.detalles;
      app.id_servicio = app.detalles.length > 0 ? app.detalles[0].id_servicio : null;
      app.precio = app.detalles.reduce((acc, curr) => acc + Number(curr.precio), 0);
      return app;
    }

    const c = mockStore.citas.find((app) => app.id_cita === appointmentId);
    if (!c) return null;

    const cl = mockStore.clientes.find((cli) => cli.id_cliente === c.id_cliente);
    const uc = cl ? mockStore.usuarios.find((u) => u.id_usuario === cl.id_usuario) : null;
    const b = mockStore.barberos.find((barb) => barb.id_barbero === c.id_barbero);
    const ub = b ? mockStore.usuarios.find((u) => u.id_usuario === b.id_usuario) : null;

    const details = mockStore.cita_detalles
      .filter((cd) => cd.id_cita === c.id_cita)
      .map((cd) => {
        const serv = mockStore.servicios.find((s) => s.id_servicio === cd.id_servicio);
        return {
          id_cita_detalle: cd.id_cita_detalle,
          id_servicio: cd.id_servicio,
          precio: cd.precio,
          servicio_nombre: serv ? serv.nombre : "Servicio",
          duracion_minutos: serv ? serv.duracion_minutos : 30
        };
      });

    return {
      ...c,
      cliente_nombre: uc ? `${uc.nombre} ${uc.apellido}` : "Cliente",
      cliente_telefono: uc ? uc.telefono : "",
      cliente_correo: uc ? uc.correo : "",
      barbero_nombre: ub ? `${ub.nombre} ${ub.apellido}` : "Barbero",
      detalles: details,
      servicios: details,
      id_servicio: details.length > 0 ? details[0].id_servicio : null,
      precio: details.reduce((acc, curr) => acc + Number(curr.precio), 0)
    };
  }

  static async findConflict(barberId, date, time, excludeAppointmentId = null) {
    const bId = Number(barberId);
    const formattedTime = time.length === 5 ? `${time}:00` : time;

    if (isDatabaseConnected()) {
      let sql = `
        SELECT id_cita FROM cita
        WHERE id_barbero = ? AND fecha = ? AND hora = ? AND estado IN ('Programada', 'Reprogramada')
      `;
      const params = [bId, date, formattedTime];
      if (excludeAppointmentId) {
        sql += ` AND id_cita != ?`;
        params.push(Number(excludeAppointmentId));
      }
      const rows = await executeQuery(sql, params);
      return rows && rows.length > 0;
    }

    return mockStore.citas.some((c) => {
      if (excludeAppointmentId && c.id_cita === Number(excludeAppointmentId)) return false;
      const cTime = c.hora.substring(0, 5);
      const targetTime = time.substring(0, 5);
      return (
        c.id_barbero === bId &&
        c.fecha === date &&
        cTime === targetTime &&
        ["Programada", "Reprogramada"].includes(c.estado)
      );
    });
  }

  static async create(appointmentData, servicesWithPrice) {
    const hora = appointmentData.hora.length === 5 ? `${appointmentData.hora}:00` : appointmentData.hora;
    const now = new Date().toISOString().replace("T", " ").substring(0, 19);

    return await executeTransaction(async (conn) => {
      if (isDatabaseConnected() && conn) {
        const [result] = await conn.execute(
          `INSERT INTO cita (id_cliente, id_barbero, fecha, hora, estado, fecha_registro) VALUES (?, ?, ?, ?, ?, ?)`,
          [
            Number(appointmentData.id_cliente),
            Number(appointmentData.id_barbero),
            appointmentData.fecha,
            hora,
            appointmentData.estado || "Programada",
            now
          ]
        );
        const citaId = result.insertId;

        for (const s of servicesWithPrice) {
          await conn.execute(
            `INSERT INTO cita_detalle (id_cita, id_servicio, precio) VALUES (?, ?, ?)`,
            [citaId, Number(s.id_servicio), Number(s.precio)]
          );
        }

        return citaId;
      }

      // Fallback
      const nextId = Math.max(...mockStore.citas.map((c) => c.id_cita || 0), 0) + 1;
      const newCita = {
        id_cita: nextId,
        id_cliente: Number(appointmentData.id_cliente),
        id_barbero: Number(appointmentData.id_barbero),
        fecha: appointmentData.fecha,
        hora,
        estado: appointmentData.estado || "Programada",
        fecha_registro: now
      };
      mockStore.citas.push(newCita);

      servicesWithPrice.forEach((s) => {
        const nextDetId = Math.max(...mockStore.cita_detalles.map((d) => d.id_cita_detalle || 0), 0) + 1;
        mockStore.cita_detalles.push({
          id_cita_detalle: nextDetId,
          id_cita: nextId,
          id_servicio: Number(s.id_servicio),
          precio: Number(s.precio)
        });
      });
      mockStore.saveToFile();

      return nextId;
    });
  }

  static async update(id, appointmentData, servicesWithPrice = null) {
    const appointmentId = Number(id);

    return await executeTransaction(async (conn) => {
      if (isDatabaseConnected() && conn) {
        const fields = [];
        const values = [];

        if (appointmentData.id_barbero) { fields.push("id_barbero = ?"); values.push(Number(appointmentData.id_barbero)); }
        if (appointmentData.fecha) { fields.push("fecha = ?"); values.push(appointmentData.fecha); }
        if (appointmentData.hora) {
          const h = appointmentData.hora.length === 5 ? `${appointmentData.hora}:00` : appointmentData.hora;
          fields.push("hora = ?");
          values.push(h);
        }
        if (appointmentData.estado) { fields.push("estado = ?"); values.push(appointmentData.estado); }

        if (fields.length > 0) {
          values.push(appointmentId);
          await conn.execute(`UPDATE cita SET ${fields.join(", ")} WHERE id_cita = ?`, values);
        }

        if (Array.isArray(servicesWithPrice) && servicesWithPrice.length > 0) {
          await conn.execute(`DELETE FROM cita_detalle WHERE id_cita = ?`, [appointmentId]);
          for (const s of servicesWithPrice) {
            await conn.execute(
              `INSERT INTO cita_detalle (id_cita, id_servicio, precio) VALUES (?, ?, ?)`,
              [appointmentId, Number(s.id_servicio), Number(s.precio)]
            );
          }
        }
        return true;
      }

      // Fallback
      const c = mockStore.citas.find((app) => app.id_cita === appointmentId);
      if (!c) return false;

      if (appointmentData.id_barbero) c.id_barbero = Number(appointmentData.id_barbero);
      if (appointmentData.fecha) c.fecha = appointmentData.fecha;
      if (appointmentData.hora) c.hora = appointmentData.hora.length === 5 ? `${appointmentData.hora}:00` : appointmentData.hora;
      if (appointmentData.estado) c.estado = appointmentData.estado;

      if (Array.isArray(servicesWithPrice) && servicesWithPrice.length > 0) {
        mockStore.cita_detalles = mockStore.cita_detalles.filter((d) => d.id_cita !== appointmentId);
        servicesWithPrice.forEach((s) => {
          const nextDetId = Math.max(...mockStore.cita_detalles.map((d) => d.id_cita_detalle || 0), 0) + 1;
          mockStore.cita_detalles.push({
            id_cita_detalle: nextDetId,
            id_cita: appointmentId,
            id_servicio: Number(s.id_servicio),
            precio: Number(s.precio)
          });
        });
      }
      mockStore.saveToFile();

      return true;
    });
  }

  static async updateStatus(id, newStatus) {
    const appointmentId = Number(id);

    if (isDatabaseConnected()) {
      await executeQuery(`UPDATE cita SET estado = ? WHERE id_cita = ?`, [newStatus, appointmentId]);
      return true;
    }

    const c = mockStore.citas.find((app) => app.id_cita === appointmentId);
    if (c) {
      c.estado = newStatus;
      mockStore.saveToFile();
      return true;
    }
    return false;
  }

  static async delete(id) {
    const appointmentId = Number(id);

    if (isDatabaseConnected()) {
      await executeQuery(`DELETE FROM cita_detalle WHERE id_cita = ?`, [appointmentId]);
      await executeQuery(`DELETE FROM cita WHERE id_cita = ?`, [appointmentId]);
      return true;
    }

    mockStore.cita_detalles = mockStore.cita_detalles.filter((d) => d.id_cita !== appointmentId);
    mockStore.citas = mockStore.citas.filter((c) => c.id_cita !== appointmentId);
    mockStore.saveToFile();
    return true;
  }
}

export { AppointmentsRepository as AppointmentsModel };
export default AppointmentsRepository;

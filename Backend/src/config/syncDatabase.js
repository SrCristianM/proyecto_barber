import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { logger } from "../utils/logger.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function ensureDatabaseSync(pool) {
  if (!pool) return;

  try {
    // 1. Verificar si las columnas documento e imagen_url existen en la tabla usuario
    const [cols] = await pool.execute("DESCRIBE usuario");
    const colNames = cols.map((c) => c.Field);

    if (!colNames.includes("documento")) {
      logger.info("🔧 Agregando columna 'documento' a la tabla usuario...");
      await pool.query("ALTER TABLE usuario ADD COLUMN documento VARCHAR(20) NULL AFTER apellido");
    }
    if (!colNames.includes("imagen_url")) {
      logger.info("🔧 Agregando columna 'imagen_url' a la tabla usuario...");
      await pool.query("ALTER TABLE usuario ADD COLUMN imagen_url VARCHAR(255) NULL AFTER fecha_registro");
    }

    // 2. Verificar columnas de novedad_horario
    try {
      await pool.query("ALTER TABLE novedad_horario MODIFY COLUMN tipo VARCHAR(60) NOT NULL");
      await pool.query("ALTER TABLE novedad_horario MODIFY COLUMN estado VARCHAR(60) NOT NULL");
    } catch (_) {}

    // 3. Comprobar si la tabla usuario tiene registros
    const [userRows] = await pool.execute("SELECT count(*) as count FROM usuario");
    const userCount = userRows[0]?.count || 0;

    if (userCount === 0) {
      logger.info("⚠️ La base de datos MySQL está vacía. Sincronizando datos maestros desde db_store.json...");
      await seedFromDbStore(pool);
    }
  } catch (error) {
    logger.warn(`⚠️ Error durante sincronización automática de base de datos: ${error.message}`);
  }
}

async function seedFromDbStore(p) {
  const storePath = path.resolve(__dirname, "../../data/db_store.json");
  if (!fs.existsSync(storePath)) return;

  const rawStore = fs.readFileSync(storePath, "utf8");
  const store = JSON.parse(rawStore);

  await p.query("SET FOREIGN_KEY_CHECKS = 0;");

  try {
    // Roles
    if (store.roles?.length) {
      for (const r of store.roles) {
        await p.query(
          "INSERT INTO rol (id_rol, nombre_rol, descripcion, estado, fecha_creacion) VALUES (?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE nombre_rol=VALUES(nombre_rol), descripcion=VALUES(descripcion), estado=VALUES(estado)",
          [r.id_rol, r.nombre_rol, r.descripcion || null, r.estado ?? 1, r.fecha_creacion || new Date()]
        );
      }
    }

    // Modulos
    if (store.modulos?.length) {
      for (const m of store.modulos) {
        await p.query(
          "INSERT INTO modulo (id_modulo, nombre_modulo) VALUES (?, ?) ON DUPLICATE KEY UPDATE nombre_modulo=VALUES(nombre_modulo)",
          [m.id_modulo, m.nombre_modulo]
        );
      }
    }

    // Permisos
    if (store.permisos?.length) {
      for (const pm of store.permisos) {
        await p.query(
          "INSERT INTO permiso (id_permiso, id_modulo, accion) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE id_modulo=VALUES(id_modulo), accion=VALUES(accion)",
          [pm.id_permiso, pm.id_modulo, pm.accion]
        );
      }
    }

    // Rol_Permiso
    if (store.rol_permisos?.length) {
      for (const rp of store.rol_permisos) {
        await p.query(
          "INSERT IGNORE INTO rol_permiso (id_rol, id_permiso) VALUES (?, ?)",
          [rp.id_rol, rp.id_permiso]
        );
      }
    }

    // Usuarios
    if (store.usuarios?.length) {
      for (const u of store.usuarios) {
        const img = u.imagen_url || u.avatar_url || null;
        await p.query(
          "INSERT INTO usuario (id_usuario, nombre, apellido, documento, correo, contrasena, telefono, id_rol, estado, fecha_registro, imagen_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE nombre=VALUES(nombre), apellido=VALUES(apellido), documento=VALUES(documento), contrasena=VALUES(contrasena), telefono=VALUES(telefono), id_rol=VALUES(id_rol), estado=VALUES(estado), imagen_url=VALUES(imagen_url)",
          [
            u.id_usuario,
            u.nombre,
            u.apellido,
            u.documento || null,
            u.correo.toLowerCase().trim(),
            u.contrasena,
            u.telefono || null,
            u.id_rol,
            u.estado ?? 1,
            u.fecha_registro || new Date(),
            img
          ]
        );
      }
    }

    // Barberos
    if (store.barberos?.length) {
      for (const b of store.barberos) {
        await p.query(
          "INSERT INTO barbero (id_barbero, id_usuario, especialidad, imagen_url, estado) VALUES (?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE especialidad=VALUES(especialidad), imagen_url=VALUES(imagen_url), estado=VALUES(estado)",
          [b.id_barbero, b.id_usuario, b.especialidad || null, b.imagen_url || null, b.estado ?? 1]
        );
      }
    }

    // Clientes
    if (store.clientes?.length) {
      for (const c of store.clientes) {
        await p.query(
          "INSERT INTO cliente (id_cliente, id_usuario, nivel_fidelidad, direccion, estado) VALUES (?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE nivel_fidelidad=VALUES(nivel_fidelidad), direccion=VALUES(direccion), estado=VALUES(estado)",
          [c.id_cliente, c.id_usuario, c.nivel_fidelidad || "Nuevo", c.direccion || null, c.estado ?? 1]
        );
      }
    }

    // Categoria Servicios
    if (store.categoria_servicios?.length) {
      for (const cs of store.categoria_servicios) {
        await p.query(
          "INSERT INTO categoria_servicio (id_categoria_servicio, nombre, estado) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE nombre=VALUES(nombre), estado=VALUES(estado)",
          [cs.id_categoria_servicio, cs.nombre, cs.estado ?? 1]
        );
      }
    }

    // Servicios
    if (store.servicios?.length) {
      for (const s of store.servicios) {
        await p.query(
          "INSERT INTO servicio (id_servicio, nombre, id_categoria_servicio, precio, duracion_minutos, imagen_url, estado) VALUES (?, ?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE nombre=VALUES(nombre), id_categoria_servicio=VALUES(id_categoria_servicio), precio=VALUES(precio), duracion_minutos=VALUES(duracion_minutos), imagen_url=VALUES(imagen_url), estado=VALUES(estado)",
          [s.id_servicio, s.nombre, s.id_categoria_servicio, s.precio, s.duracion_minutos, s.imagen_url || null, s.estado ?? 1]
        );
      }
    }

    // Paquetes
    if (store.paquete_servicios?.length) {
      for (const pq of store.paquete_servicios) {
        await p.query(
          "INSERT INTO paquete_servicio (id_paquete, nombre, descuento_porcentaje, estado) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE nombre=VALUES(nombre), descuento_porcentaje=VALUES(descuento_porcentaje), estado=VALUES(estado)",
          [pq.id_paquete, pq.nombre, pq.descuento_porcentaje || 0, pq.estado ?? 1]
        );
      }
    }
    if (store.paquete_servicio_detalles?.length) {
      for (const pqd of store.paquete_servicio_detalles) {
        await p.query(
          "INSERT INTO paquete_servicio_detalle (id_paquete_detalle, id_paquete, id_servicio) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE id_paquete=VALUES(id_paquete), id_servicio=VALUES(id_servicio)",
          [pqd.id_paquete_detalle, pqd.id_paquete, pqd.id_servicio]
        );
      }
    }

    // Categoria Productos
    if (store.categoria_productos?.length) {
      for (const cp of store.categoria_productos) {
        await p.query(
          "INSERT INTO categoria_producto (id_categoria_producto, nombre, estado) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE nombre=VALUES(nombre), estado=VALUES(estado)",
          [cp.id_categoria_producto, cp.nombre, cp.estado ?? 1]
        );
      }
    }

    // Productos
    if (store.productos?.length) {
      for (const pr of store.productos) {
        await p.query(
          "INSERT INTO producto (id_producto, nombre, id_categoria_producto, precio, stock, imagen_url, estado) VALUES (?, ?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE nombre=VALUES(nombre), id_categoria_producto=VALUES(id_categoria_producto), precio=VALUES(precio), stock=VALUES(stock), imagen_url=VALUES(imagen_url), estado=VALUES(estado)",
          [pr.id_producto, pr.nombre, pr.id_categoria_producto, pr.precio, pr.stock, pr.imagen_url || null, pr.estado ?? 1]
        );
      }
    }

    // Proveedores
    if (store.proveedores?.length) {
      for (const pv of store.proveedores) {
        await p.query(
          "INSERT INTO proveedor (id_proveedor, nombre, nit, telefono, correo, direccion, estado) VALUES (?, ?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE nombre=VALUES(nombre), nit=VALUES(nit), telefono=VALUES(telefono), correo=VALUES(correo), direccion=VALUES(direccion), estado=VALUES(estado)",
          [pv.id_proveedor, pv.nombre, pv.nit || null, pv.telefono || null, pv.correo || null, pv.direccion || null, pv.estado ?? 1]
        );
      }
    }

    // Horarios
    if (store.horarios?.length) {
      for (const h of store.horarios) {
        await p.query(
          "INSERT INTO horario (id_horario, id_barbero, dia_semana, hora_inicio, hora_fin, estado) VALUES (?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE id_barbero=VALUES(id_barbero), dia_semana=VALUES(dia_semana), hora_inicio=VALUES(hora_inicio), hora_fin=VALUES(hora_fin), estado=VALUES(estado)",
          [h.id_horario, h.id_barbero, h.dia_semana, h.hora_inicio, h.hora_fin, h.estado ?? 1]
        );
      }
    }

    // Novedades
    if (store.novedades?.length) {
      for (const n of store.novedades) {
        await p.query(
          "INSERT INTO novedad_horario (id_novedad, id_barbero, tipo, fecha, descripcion, estado, fecha_registro) VALUES (?, ?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE tipo=VALUES(tipo), fecha=VALUES(fecha), descripcion=VALUES(descripcion), estado=VALUES(estado)",
          [n.id_novedad, n.id_barbero, n.tipo, n.fecha, n.descripcion || null, n.estado, n.fecha_registro || new Date()]
        );
      }
    }

    // Citas y detalles
    if (store.citas?.length) {
      for (const ci of store.citas) {
        await p.query(
          "INSERT INTO cita (id_cita, id_cliente, id_barbero, fecha, hora, estado, fecha_registro) VALUES (?, ?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE id_cliente=VALUES(id_cliente), id_barbero=VALUES(id_barbero), fecha=VALUES(fecha), hora=VALUES(hora), estado=VALUES(estado)",
          [ci.id_cita, ci.id_cliente, ci.id_barbero, ci.fecha, ci.hora, ci.estado, ci.fecha_registro || new Date()]
        );
      }
    }
    if (store.cita_detalles?.length) {
      for (const cd of store.cita_detalles) {
        await p.query(
          "INSERT INTO cita_detalle (id_cita_detalle, id_cita, id_servicio, precio) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE precio=VALUES(precio)",
          [cd.id_cita_detalle, cd.id_cita, cd.id_servicio, cd.precio]
        );
      }
    }

    // Compras
    if (store.compras?.length) {
      for (const com of store.compras) {
        await p.query(
          "INSERT INTO compra (id_compra, id_proveedor, id_usuario, fecha, total, estado) VALUES (?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE total=VALUES(total), estado=VALUES(estado)",
          [com.id_compra, com.id_proveedor, com.id_usuario, com.fecha || new Date(), com.total, com.estado || "Registrada"]
        );
      }
    }
    if (store.detalle_compras?.length) {
      for (const dcom of store.detalle_compras) {
        await p.query(
          "INSERT INTO detalle_compra (id_detalle_compra, id_compra, id_producto, cantidad, precio_unitario, subtotal) VALUES (?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE cantidad=VALUES(cantidad), subtotal=VALUES(subtotal)",
          [dcom.id_detalle_compra, dcom.id_compra, dcom.id_producto, dcom.cantidad, dcom.precio_unitario, dcom.subtotal]
        );
      }
    }

    // Ventas
    if (store.ventas?.length) {
      for (const v of store.ventas) {
        await p.query(
          "INSERT INTO venta (id_venta, id_cita, id_cliente, id_usuario, fecha, total, estado) VALUES (?, ?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE total=VALUES(total), estado=VALUES(estado)",
          [v.id_venta, v.id_cita || null, v.id_cliente, v.id_usuario, v.fecha || new Date(), v.total, v.estado || "Activa"]
        );
      }
    }
    if (store.venta_detalles?.length) {
      for (const vd of store.venta_detalles) {
        await p.query(
          "INSERT INTO venta_detalle (id_venta_detalle, id_venta, tipo_item, id_producto, id_servicio, cantidad, precio_unitario, subtotal) VALUES (?, ?, ?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE subtotal=VALUES(subtotal)",
          [vd.id_venta_detalle, vd.id_venta, vd.tipo_item, vd.id_producto || null, vd.id_servicio || null, vd.cantidad, vd.precio_unitario, vd.subtotal]
        );
      }
    }

    logger.info("✅ Sincronización completa de MySQL con datos maestros finalizada con éxito.");
  } finally {
    await p.query("SET FOREIGN_KEY_CHECKS = 1;");
  }
}


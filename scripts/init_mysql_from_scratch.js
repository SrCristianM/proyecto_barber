import { getDatabaseConnection } from "../Backend/src/config/db.js";
import fs from "fs";

async function run() {
  const p = await getDatabaseConnection();
  if (!p) {
    console.error("No MySQL pool connection");
    process.exit(1);
  }

  await p.query("SET FOREIGN_KEY_CHECKS = 0;");

  // Ensure usuario has documento and imagen_url
  try {
    const [cols] = await p.execute("DESCRIBE usuario");
    const colNames = cols.map((c) => c.Field);
    if (!colNames.includes("documento")) {
      console.log("Adding documento column to usuario...");
      await p.query("ALTER TABLE usuario ADD COLUMN documento VARCHAR(20) NULL AFTER apellido");
    }
    if (!colNames.includes("imagen_url")) {
      console.log("Adding imagen_url column to usuario...");
      await p.query("ALTER TABLE usuario ADD COLUMN imagen_url VARCHAR(255) NULL AFTER fecha_registro");
    }
  } catch (err) {
    console.error("Error updating usuario table:", err.message);
  }

  // Ensure novedad_horario columns are wide enough
  try {
    await p.query("ALTER TABLE novedad_horario MODIFY COLUMN tipo VARCHAR(60) NOT NULL");
    await p.query("ALTER TABLE novedad_horario MODIFY COLUMN estado VARCHAR(60) NOT NULL");
  } catch (_) {}

  // Now seed from Backend/data/db_store.json
  console.log("Seeding data from db_store.json...");
  const rawStore = fs.readFileSync("Backend/data/db_store.json", "utf8");
  const store = JSON.parse(rawStore);

  // 1. Roles
  if (store.roles?.length) {
    for (const r of store.roles) {
      await p.query(
        "INSERT INTO rol (id_rol, nombre_rol, descripcion, estado, fecha_creacion) VALUES (?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE nombre_rol=VALUES(nombre_rol), descripcion=VALUES(descripcion), estado=VALUES(estado)",
        [r.id_rol, r.nombre_rol, r.descripcion || null, r.estado ?? 1, r.fecha_creacion || new Date()]
      );
    }
    console.log(`Seeded ${store.roles.length} roles`);
  }

  // 2. Modulos
  if (store.modulos?.length) {
    for (const m of store.modulos) {
      await p.query(
        "INSERT INTO modulo (id_modulo, nombre_modulo) VALUES (?, ?) ON DUPLICATE KEY UPDATE nombre_modulo=VALUES(nombre_modulo)",
        [m.id_modulo, m.nombre_modulo]
      );
    }
    console.log(`Seeded ${store.modulos.length} modulos`);
  }

  // 3. Permisos
  if (store.permisos?.length) {
    for (const pm of store.permisos) {
      await p.query(
        "INSERT INTO permiso (id_permiso, id_modulo, accion) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE id_modulo=VALUES(id_modulo), accion=VALUES(accion)",
        [pm.id_permiso, pm.id_modulo, pm.accion]
      );
    }
    console.log(`Seeded ${store.permisos.length} permisos`);
  }

  // 4. Rol_Permiso
  if (store.rol_permisos?.length) {
    for (const rp of store.rol_permisos) {
      await p.query(
        "INSERT IGNORE INTO rol_permiso (id_rol, id_permiso) VALUES (?, ?)",
        [rp.id_rol, rp.id_permiso]
      );
    }
    console.log(`Seeded ${store.rol_permisos.length} rol_permisos`);
  }

  // 5. Usuarios
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
    console.log(`Seeded ${store.usuarios.length} usuarios`);
  }

  // 6. Barberos
  if (store.barberos?.length) {
    for (const b of store.barberos) {
      await p.query(
        "INSERT INTO barbero (id_barbero, id_usuario, especialidad, imagen_url, estado) VALUES (?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE especialidad=VALUES(especialidad), imagen_url=VALUES(imagen_url), estado=VALUES(estado)",
        [b.id_barbero, b.id_usuario, b.especialidad || null, b.imagen_url || null, b.estado ?? 1]
      );
    }
    console.log(`Seeded ${store.barberos.length} barberos`);
  }

  // 7. Clientes
  if (store.clientes?.length) {
    for (const c of store.clientes) {
      await p.query(
        "INSERT INTO cliente (id_cliente, id_usuario, nivel_fidelidad, direccion, estado) VALUES (?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE nivel_fidelidad=VALUES(nivel_fidelidad), direccion=VALUES(direccion), estado=VALUES(estado)",
        [c.id_cliente, c.id_usuario, c.nivel_fidelidad || "Nuevo", c.direccion || null, c.estado ?? 1]
      );
    }
    console.log(`Seeded ${store.clientes.length} clientes`);
  }

  // 8. Categoria Servicios
  if (store.categoria_servicios?.length) {
    for (const cs of store.categoria_servicios) {
      await p.query(
        "INSERT INTO categoria_servicio (id_categoria_servicio, nombre, estado) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE nombre=VALUES(nombre), estado=VALUES(estado)",
        [cs.id_categoria_servicio, cs.nombre, cs.estado ?? 1]
      );
    }
    console.log(`Seeded ${store.categoria_servicios.length} categoria_servicios`);
  }

  // 9. Servicios
  if (store.servicios?.length) {
    for (const s of store.servicios) {
      await p.query(
        "INSERT INTO servicio (id_servicio, nombre, id_categoria_servicio, precio, duracion_minutos, imagen_url, estado) VALUES (?, ?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE nombre=VALUES(nombre), id_categoria_servicio=VALUES(id_categoria_servicio), precio=VALUES(precio), duracion_minutos=VALUES(duracion_minutos), imagen_url=VALUES(imagen_url), estado=VALUES(estado)",
        [s.id_servicio, s.nombre, s.id_categoria_servicio, s.precio, s.duracion_minutos, s.imagen_url || null, s.estado ?? 1]
      );
    }
    console.log(`Seeded ${store.servicios.length} servicios`);
  }

  // 10. Paquetes y detalles
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

  // 11. Categoria Productos
  if (store.categoria_productos?.length) {
    for (const cp of store.categoria_productos) {
      await p.query(
        "INSERT INTO categoria_producto (id_categoria_producto, nombre, estado) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE nombre=VALUES(nombre), estado=VALUES(estado)",
        [cp.id_categoria_producto, cp.nombre, cp.estado ?? 1]
      );
    }
  }

  // 12. Productos
  if (store.productos?.length) {
    for (const pr of store.productos) {
      await p.query(
        "INSERT INTO producto (id_producto, nombre, id_categoria_producto, precio, stock, imagen_url, estado) VALUES (?, ?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE nombre=VALUES(nombre), id_categoria_producto=VALUES(id_categoria_producto), precio=VALUES(precio), stock=VALUES(stock), imagen_url=VALUES(imagen_url), estado=VALUES(estado)",
        [pr.id_producto, pr.nombre, pr.id_categoria_producto, pr.precio, pr.stock, pr.imagen_url || null, pr.estado ?? 1]
      );
    }
    console.log(`Seeded ${store.productos.length} productos`);
  }

  // 13. Proveedores
  if (store.proveedores?.length) {
    for (const pv of store.proveedores) {
      await p.query(
        "INSERT INTO proveedor (id_proveedor, nombre, nit, telefono, correo, direccion, estado) VALUES (?, ?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE nombre=VALUES(nombre), nit=VALUES(nit), telefono=VALUES(telefono), correo=VALUES(correo), direccion=VALUES(direccion), estado=VALUES(estado)",
        [pv.id_proveedor, pv.nombre, pv.nit || null, pv.telefono || null, pv.correo || null, pv.direccion || null, pv.estado ?? 1]
      );
    }
    console.log(`Seeded ${store.proveedores.length} proveedores`);
  }

  // 14. Horarios
  if (store.horarios?.length) {
    for (const h of store.horarios) {
      await p.query(
        "INSERT INTO horario (id_horario, id_barbero, dia_semana, hora_inicio, hora_fin, estado) VALUES (?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE id_barbero=VALUES(id_barbero), dia_semana=VALUES(dia_semana), hora_inicio=VALUES(hora_inicio), hora_fin=VALUES(hora_fin), estado=VALUES(estado)",
        [h.id_horario, h.id_barbero, h.dia_semana, h.hora_inicio, h.hora_fin, h.estado ?? 1]
      );
    }
    console.log(`Seeded ${store.horarios.length} horarios`);
  }

  // 15. Novedades
  if (store.novedades?.length) {
    for (const n of store.novedades) {
      await p.query(
        "INSERT INTO novedad_horario (id_novedad, id_barbero, tipo, fecha, descripcion, estado, fecha_registro) VALUES (?, ?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE tipo=VALUES(tipo), fecha=VALUES(fecha), descripcion=VALUES(descripcion), estado=VALUES(estado)",
        [n.id_novedad, n.id_barbero, n.tipo, n.fecha, n.descripcion || null, n.estado, n.fecha_registro || new Date()]
      );
    }
    console.log(`Seeded ${store.novedades.length} novedades`);
  }

  // 16. Citas y detalles
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
    console.log(`Seeded ${store.citas.length} citas y ${store.cita_detalles.length} cita_detalles`);
  }

  // 17. Compras y detalle_compras
  if (store.compras?.length) {
    for (const com of store.compras) {
      await p.query(
        "INSERT INTO compra (id_compra, id_proveedor, id_usuario, fecha, total, estado) VALUES (?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE total=VALUES(total), estado=VALUES(estado)",
        [com.id_compra, com.id_proveedor, com.id_usuario, com.fecha || new Date(), com.total, com.estado || 'Registrada']
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
    console.log(`Seeded ${store.compras.length} compras`);
  }

  // 18. Ventas y venta_detalles
  if (store.ventas?.length) {
    for (const v of store.ventas) {
      await p.query(
        "INSERT INTO venta (id_venta, id_cita, id_cliente, id_usuario, fecha, total, estado) VALUES (?, ?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE total=VALUES(total), estado=VALUES(estado)",
        [v.id_venta, v.id_cita || null, v.id_cliente, v.id_usuario, v.fecha || new Date(), v.total, v.estado || 'Activa']
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
    console.log(`Seeded ${store.ventas.length} ventas`);
  }

  // 19. Insumos Bodega
  if (store.insumos_bodega?.length) {
    for (const ib of store.insumos_bodega) {
      await p.query(
        "INSERT INTO insumo_bodega (id_insumo, nombre, categoria, stock_actual, stock_minimo, unidad_medida, id_proveedor, costo_unitario, estado, fecha_registro) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE stock_actual=VALUES(stock_actual), costo_unitario=VALUES(costo_unitario)",
        [
          ib.id_insumo,
          ib.nombre,
          ib.categoria || "General",
          ib.stock_actual ?? 0,
          ib.stock_minimo ?? 5,
          ib.unidad_medida || "Unidad",
          ib.id_proveedor || ib.proveedor_id || null,
          ib.costo_unitario ?? 0,
          ib.estado ?? 1,
          ib.fecha_registro || ib.fecha_creacion || new Date()
        ]
      );
    }
    console.log(`Seeded ${store.insumos_bodega.length} insumos_bodega`);
  }

  // 20. Estaciones Barberos
  if (store.estaciones_barberos?.length) {
    for (const eb of store.estaciones_barberos) {
      const idBarbero = eb.id_barbero || eb.barbero_id;
      const idInsumo = eb.id_insumo || eb.insumo_id;
      const idEstacion = eb.id_estacion_insumo || eb.id_estacion_item;
      await p.query(
        "INSERT INTO estacion_barbero (id_estacion_insumo, id_barbero, id_insumo, cantidad_asignada, estado_semaforo, fecha_ultima_reposicion, fecha_cambio_estado, notas) VALUES (?, ?, ?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE cantidad_asignada=VALUES(cantidad_asignada), estado_semaforo=VALUES(estado_semaforo), notas=VALUES(notas)",
        [
          idEstacion,
          idBarbero,
          idInsumo,
          eb.cantidad_asignada ?? 1,
          eb.estado_semaforo || "VERDE",
          eb.fecha_ultima_reposicion || new Date(),
          eb.fecha_cambio_estado || new Date(),
          eb.notas || null
        ]
      );
    }
    console.log(`Seeded ${store.estaciones_barberos.length} estaciones_barberos`);
  }

  // 21. Historial Reposiciones
  if (store.historial_reposiciones?.length) {
    for (const hr of store.historial_reposiciones) {
      const idBarbero = hr.id_barbero || hr.barbero_id;
      const idInsumo = hr.id_insumo || hr.insumo_id;
      await p.query(
        "INSERT INTO historial_reposicion (id_historial, id_barbero, id_insumo, cantidad_entregada, fecha_reposicion, dias_duracion_anterior, observaciones) VALUES (?, ?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE cantidad_entregada=VALUES(cantidad_entregada), dias_duracion_anterior=VALUES(dias_duracion_anterior)",
        [
          hr.id_historial,
          idBarbero,
          idInsumo,
          hr.cantidad_entregada ?? 1,
          hr.fecha_reposicion || new Date(),
          hr.dias_duracion_anterior ?? 0,
          hr.observaciones || null
        ]
      );
    }
    console.log(`Seeded ${store.historial_reposiciones.length} historial_reposiciones`);
  }

  await p.query("SET FOREIGN_KEY_CHECKS = 1;");
  console.log("✅ DATABASE SETUP AND SEEDING COMPLETED SUCCESSFULLY!");
  process.exit(0);
}

run().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});

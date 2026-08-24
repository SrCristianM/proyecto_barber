/**
 * @file database.js
 * Modelos, constantes y tipos basados estrictamente en la base de datos MySQL `barberia_db`.
 * Fuente de verdad: Data_Base/Database.sql
 */

// ==========================================
// CONSTANTES Y ENUMS DE LA BASE DE DATOS
// ==========================================

export const ROLES = [
  { id_rol: 1, nombre_rol: "Administrador", descripcion: "Control total del sistema", estado: 1, fecha_creacion: "2026-01-15 00:00:00" },
  { id_rol: 2, nombre_rol: "Recepcionista", descripcion: "Gestión de agenda, ventas y clientes", estado: 1, fecha_creacion: "2026-02-20 00:00:00" },
  { id_rol: 3, nombre_rol: "Barbero", descripcion: "Consulta de horarios y citas asignadas", estado: 1, fecha_creacion: "2026-03-10 00:00:00" },
  { id_rol: 4, nombre_rol: "Cliente", descripcion: "Agenda y consulta sus propios servicios", estado: 1, fecha_creacion: "2026-04-05 00:00:00" }
];

export const CATEGORIAS_SERVICIO = [
  { id_categoria_servicio: 1, nombre: "Cortes", estado: 1 },
  { id_categoria_servicio: 2, nombre: "Barba", estado: 1 },
  { id_categoria_servicio: 3, nombre: "Paquetes", estado: 1 },
  { id_categoria_servicio: 4, nombre: "Especiales", estado: 1 }
];

export const CATEGORIAS_PRODUCTO = [
  { id_categoria_producto: 1, nombre: "Estilizado", estado: 1 },
  { id_categoria_producto: 2, nombre: "Cuidado", estado: 1 },
  { id_categoria_producto: 3, nombre: "Barba", estado: 1 },
  { id_categoria_producto: 4, nombre: "Herramientas", estado: 1 }
];

export const ESTADOS_CITA = ["Programada", "Completada", "Cancelada", "Reprogramada"];

export const ESTADOS_VENTA = ["Activa", "Anulada"];

export const ESTADOS_COMPRA = ["Registrada", "Anulada"];

export const ESTADOS_NOVEDAD = ["Pendiente", "Aprobado", "Rechazado"];

export const DIAS_SEMANA = ["Lunes", "Martes", "Miercoles", "Jueves", "Viernes", "Sabado", "Domingo"];

export const TIPOS_ITEM_VENTA = ["Producto", "Servicio"];

export const NIVELES_FIDELIDAD = ["Nuevo", "Bronce", "Plata", "Oro"];

// ==========================================
// DOCUMENTACIÓN DE MODELOS JSDOC (23 TABLAS)
// ==========================================

/**
 * @typedef {Object} Rol
 * @property {number} id_rol
 * @property {string} nombre_rol
 * @property {string|null} descripcion
 * @property {number} estado - 1: Activo, 0: Inactivo
 * @property {string} fecha_creacion
 */

/**
 * @typedef {Object} Modulo
 * @property {number} id_modulo
 * @property {string} nombre_modulo
 */

/**
 * @typedef {Object} Permiso
 * @property {number} id_permiso
 * @property {number} id_modulo
 * @property {string} accion
 */

/**
 * @typedef {Object} RolPermiso
 * @property {number} id_rol
 * @property {number} id_permiso
 */

/**
 * @typedef {Object} Usuario
 * @property {number} id_usuario
 * @property {string} nombre
 * @property {string} apellido
 * @property {string} correo
 * @property {string} contrasena
 * @property {string|null} telefono
 * @property {number} id_rol - FK -> Rol
 * @property {number} estado - 1: Activo, 0: Inactivo
 * @property {string} fecha_registro
 */

/**
 * @typedef {Object} BitacoraAcceso
 * @property {number} id_log
 * @property {number} id_usuario - FK -> Usuario
 * @property {string} accion
 * @property {string} fecha_hora
 * @property {string|null} ip_origen
 */

/**
 * @typedef {Object} Barbero
 * @property {number} id_barbero
 * @property {number} id_usuario - FK -> Usuario (UNIQUE)
 * @property {string|null} especialidad
 * @property {string|null} imagen_url
 * @property {number} estado - 1: Activo, 0: Inactivo
 */

/**
 * @typedef {Object} Cliente
 * @property {number} id_cliente
 * @property {number} id_usuario - FK -> Usuario (UNIQUE)
 * @property {string} nivel_fidelidad - Default: 'Nuevo'
 * @property {string|null} direccion
 * @property {number} estado - 1: Activo, 0: Inactivo
 */

/**
 * @typedef {Object} CategoriaServicio
 * @property {number} id_categoria_servicio
 * @property {string} nombre
 * @property {number} estado - 1: Activo, 0: Inactivo
 */

/**
 * @typedef {Object} Servicio
 * @property {number} id_servicio
 * @property {string} nombre
 * @property {number} id_categoria_servicio - FK -> CategoriaServicio
 * @property {number} precio
 * @property {number} duracion_minutos
 * @property {string|null} imagen_url
 * @property {number} estado - 1: Activo, 0: Inactivo
 */

/**
 * @typedef {Object} PaqueteServicio
 * @property {number} id_paquete
 * @property {string} nombre
 * @property {number} descuento_porcentaje
 * @property {number} estado - 1: Activo, 0: Inactivo
 */

/**
 * @typedef {Object} PaqueteServicioDetalle
 * @property {number} id_paquete_detalle
 * @property {number} id_paquete - FK -> PaqueteServicio
 * @property {number} id_servicio - FK -> Servicio
 */

/**
 * @typedef {Object} CategoriaProducto
 * @property {number} id_categoria_producto
 * @property {string} nombre
 * @property {number} estado - 1: Activo, 0: Inactivo
 */

/**
 * @typedef {Object} Producto
 * @property {number} id_producto
 * @property {string} nombre
 * @property {number} id_categoria_producto - FK -> CategoriaProducto
 * @property {number} precio
 * @property {number} stock
 * @property {string|null} imagen_url
 * @property {number} estado - 1: Activo, 0: Inactivo
 */

/**
 * @typedef {Object} Horario
 * @property {number} id_horario
 * @property {number} id_barbero - FK -> Barbero
 * @property {'Lunes'|'Martes'|'Miercoles'|'Jueves'|'Viernes'|'Sabado'|'Domingo'} dia_semana
 * @property {string} hora_inicio - Format: "HH:MM:SS"
 * @property {string} hora_fin - Format: "HH:MM:SS"
 * @property {number} estado - 1: Activo, 0: Inactivo
 */

/**
 * @typedef {Object} NovedadHorario
 * @property {number} id_novedad
 * @property {number} id_barbero - FK -> Barbero
 * @property {'Ausencia'|'Cambio de turno'|'Permiso'|'Otro'} tipo
 * @property {string} fecha - Format: "YYYY-MM-DD"
 * @property {string|null} descripcion
 * @property {'Pendiente'|'Aprobado'|'Rechazado'} estado
 * @property {string} fecha_registro
 */

/**
 * @typedef {Object} Cita
 * @property {number} id_cita
 * @property {number} id_cliente - FK -> Cliente
 * @property {number} id_barbero - FK -> Barbero
 * @property {string} fecha - Format: "YYYY-MM-DD"
 * @property {string} hora - Format: "HH:MM:SS"
 * @property {'Programada'|'Completada'|'Cancelada'|'Reprogramada'} estado
 * @property {string} fecha_registro
 */

/**
 * @typedef {Object} CitaDetalle
 * @property {number} id_cita_detalle
 * @property {number} id_cita - FK -> Cita
 * @property {number} id_servicio - FK -> Servicio
 * @property {number} precio
 */

/**
 * @typedef {Object} Venta
 * @property {number} id_venta
 * @property {number|null} id_cita - FK -> Cita (NULLABLE)
 * @property {number} id_cliente - FK -> Cliente
 * @property {number} id_usuario - FK -> Usuario
 * @property {string} fecha
 * @property {number} total
 * @property {'Activa'|'Anulada'} estado
 */

/**
 * @typedef {Object} VentaDetalle
 * @property {number} id_venta_detalle
 * @property {number} id_venta - FK -> Venta
 * @property {'Producto'|'Servicio'} tipo_item
 * @property {number|null} id_producto - FK -> Producto (NULL if Servicio)
 * @property {number|null} id_servicio - FK -> Servicio (NULL if Producto)
 * @property {number} cantidad
 * @property {number} precio_unitario
 * @property {number} subtotal
 */

/**
 * @typedef {Object} Proveedor
 * @property {number} id_proveedor
 * @property {string} nombre
 * @property {string|null} nit
 * @property {string|null} telefono
 * @property {string|null} correo
 * @property {string|null} direccion
 * @property {number} estado - 1: Activo, 0: Inactivo
 */

/**
 * @typedef {Object} Compra
 * @property {number} id_compra
 * @property {number} id_proveedor - FK -> Proveedor
 * @property {number} id_usuario - FK -> Usuario
 * @property {string} fecha
 * @property {number} total
 * @property {'Registrada'|'Anulada'} estado
 */

/**
 * @typedef {Object} DetalleCompra
 * @property {number} id_detalle_compra
 * @property {number} id_compra - FK -> Compra
 * @property {number} id_producto - FK -> Producto
 * @property {number} cantidad
 * @property {number} precio_unitario
 * @property {number} subtotal
 */

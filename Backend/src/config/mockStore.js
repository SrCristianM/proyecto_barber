/**
 * @file mockStore.js
 * Almacén en memoria sincronizado con el esquema exacto de Data_Base/Database.sql.
 * Permite el funcionamiento resiliente en entornos de desarrollo cuando MySQL local
 * no está activo, o para la ejecución de pruebas unitarias y de integración sin dependencias externas.
 */

export class MockDataStore {
  constructor() {
    this.init();
  }

  init() {
    const now = new Date().toISOString().replace("T", " ").substring(0, 19);
    const today = new Date().toISOString().split("T")[0];

    this.roles = [
      { id_rol: 1, nombre_rol: "Administrador", descripcion: "Control total del sistema", estado: 1, fecha_creacion: "2026-01-15 00:00:00" },
      { id_rol: 2, nombre_rol: "Recepcionista", descripcion: "Gestión de agenda, ventas y clientes", estado: 1, fecha_creacion: "2026-02-20 00:00:00" },
      { id_rol: 3, nombre_rol: "Barbero", descripcion: "Consulta de horarios y citas asignadas", estado: 1, fecha_creacion: "2026-03-10 00:00:00" },
      { id_rol: 4, nombre_rol: "Cliente", descripcion: "Agenda y consulta sus propios servicios", estado: 1, fecha_creacion: "2026-04-05 00:00:00" }
    ];

    this.modulos = [
      { id_modulo: 1, nombre_modulo: "usuarios" },
      { id_modulo: 2, nombre_modulo: "roles" },
      { id_modulo: 3, nombre_modulo: "citas" },
      { id_modulo: 4, nombre_modulo: "servicios" },
      { id_modulo: 5, nombre_modulo: "productos" },
      { id_modulo: 6, nombre_modulo: "ventas" },
      { id_modulo: 7, nombre_modulo: "horarios" },
      { id_modulo: 8, nombre_modulo: "clientes" },
      { id_modulo: 9, nombre_modulo: "proveedores" },
      { id_modulo: 10, nombre_modulo: "compras" }
    ];

    this.permisos = [
      { id_permiso: 1, id_modulo: 1, accion: "ver" },
      { id_permiso: 2, id_modulo: 1, accion: "crear" },
      { id_permiso: 3, id_modulo: 1, accion: "editar" },
      { id_permiso: 4, id_modulo: 1, accion: "eliminar" },
      { id_permiso: 5, id_modulo: 2, accion: "ver" },
      { id_permiso: 6, id_modulo: 2, accion: "crear" },
      { id_permiso: 7, id_modulo: 2, accion: "editar" },
      { id_permiso: 8, id_modulo: 2, accion: "eliminar" },
      { id_permiso: 9, id_modulo: 3, accion: "ver" },
      { id_permiso: 10, id_modulo: 3, accion: "crear" },
      { id_permiso: 11, id_modulo: 3, accion: "editar" },
      { id_permiso: 12, id_modulo: 3, accion: "cancelar" }
    ];

    this.rol_permisos = [
      { id_rol: 1, id_permiso: 1 }, { id_rol: 1, id_permiso: 2 }, { id_rol: 1, id_permiso: 3 }, { id_rol: 1, id_permiso: 4 },
      { id_rol: 1, id_permiso: 5 }, { id_rol: 1, id_permiso: 6 }, { id_rol: 1, id_permiso: 7 }, { id_rol: 1, id_permiso: 8 },
      { id_rol: 1, id_permiso: 9 }, { id_rol: 1, id_permiso: 10 }, { id_rol: 1, id_permiso: 11 }, { id_rol: 1, id_permiso: 12 },
      { id_rol: 2, id_permiso: 1 }, { id_rol: 2, id_permiso: 9 }, { id_rol: 2, id_permiso: 10 }, { id_rol: 2, id_permiso: 11 },
      { id_rol: 3, id_permiso: 9 }, { id_rol: 3, id_permiso: 11 },
      { id_rol: 4, id_permiso: 9 }, { id_rol: 4, id_permiso: 10 }
    ];

    this.usuarios = [
      { id_usuario: 1, nombre: "Cristian", apellido: "Mazo", correo: "cristianmazo957@gmail.com", contrasena: "$2a$10$R5F7eDK4YIcPt4oUwiPmi.gGrb1DRT8eM2nXwfF39bMU5nTGWqOSu", telefono: "+57 300 987 6543", id_rol: 1, estado: 1, fecha_registro: "2026-01-10 08:00:00" },
      { id_usuario: 2, nombre: "Juan", apellido: "Pérez", correo: "juan@example.com", contrasena: "$2a$10$R5F7eDK4YIcPt4oUwiPmi.gGrb1DRT8eM2nXwfF39bMU5nTGWqOSu", telefono: "+57 300 123 4567", id_rol: 1, estado: 1, fecha_registro: "2026-01-15 10:30:00" },
      { id_usuario: 3, nombre: "María", apellido: "García", correo: "maria@example.com", contrasena: "$2a$10$R5F7eDK4YIcPt4oUwiPmi.gGrb1DRT8eM2nXwfF39bMU5nTGWqOSu", telefono: "+57 301 234 5678", id_rol: 2, estado: 1, fecha_registro: "2026-02-20 14:15:00" },
      { id_usuario: 4, nombre: "Carlos", apellido: "Rodríguez", correo: "barbero@tuturnobarber.com", contrasena: "$2a$10$..d9zrvkZBpDPQANvi.z.eblOC6bCJAR.juYapz84EHqG88H3e16q", telefono: "+57 302 345 6789", id_rol: 3, estado: 1, fecha_registro: "2026-03-10 09:00:00" },
      { id_usuario: 5, nombre: "Miguel", apellido: "Ángel", correo: "miguel@example.com", contrasena: "$2a$10$..d9zrvkZBpDPQANvi.z.eblOC6bCJAR.juYapz84EHqG88H3e16q", telefono: "+57 301 234 5678", id_rol: 3, estado: 1, fecha_registro: "2026-04-05 16:45:00" },
      { id_usuario: 6, nombre: "Javier", apellido: "Torres", correo: "javier@example.com", contrasena: "$2a$10$..d9zrvkZBpDPQANvi.z.eblOC6bCJAR.juYapz84EHqG88H3e16q", telefono: "+57 302 345 6789", id_rol: 3, estado: 1, fecha_registro: "2026-05-12 11:20:00" },
      { id_usuario: 7, nombre: "Pedro", apellido: "López", correo: "cliente@example.com", contrasena: "$2a$10$mpmfmAgedOBo8M./URNXKe28ie6FIfdASHR7.KFB4bPsrgNpmL7K6", telefono: "3001234567", id_rol: 4, estado: 1, fecha_registro: "2026-06-01 08:00:00" },
      { id_usuario: 8, nombre: "Administrador", apellido: "Barber", correo: "admin@barber.com", contrasena: "$2a$10$R5F7eDK4YIcPt4oUwiPmi.gGrb1DRT8eM2nXwfF39bMU5nTGWqOSu", telefono: "+57 300 000 0000", id_rol: 1, estado: 1, fecha_registro: "2026-01-01 00:00:00" }
    ];

    this.barberos = [
      { id_barbero: 1, id_usuario: 4, especialidad: "Corte Clásico & Fade", imagen_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80", estado: 1 },
      { id_barbero: 2, id_usuario: 5, especialidad: "Diseño y Color", imagen_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80", estado: 1 },
      { id_barbero: 3, id_usuario: 6, especialidad: "Barba Premium & Spa", imagen_url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80", estado: 1 }
    ];

    this.clientes = [
      { id_cliente: 1, id_usuario: 7, nivel_fidelidad: "Oro", direccion: "Calle 10 # 5-20", estado: 1 }
    ];

    this.categoria_servicios = [
      { id_categoria_servicio: 1, nombre: "Cortes", estado: 1 },
      { id_categoria_servicio: 2, nombre: "Barba", estado: 1 },
      { id_categoria_servicio: 3, nombre: "Paquetes", estado: 1 },
      { id_categoria_servicio: 4, nombre: "Especiales", estado: 1 }
    ];

    this.servicios = [
      { id_servicio: 1, nombre: "Corte Clásico", id_categoria_servicio: 1, precio: 15000, duracion_minutos: 30, imagen_url: "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=600&auto=format&fit=crop&q=80", estado: 1 },
      { id_servicio: 2, nombre: "Corte + Barba", id_categoria_servicio: 3, precio: 25000, duracion_minutos: 45, imagen_url: "https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=600&auto=format&fit=crop&q=80", estado: 1 },
      { id_servicio: 3, nombre: "Afeitado Premium", id_categoria_servicio: 2, precio: 20000, duracion_minutos: 35, imagen_url: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=600&auto=format&fit=crop&q=80", estado: 1 },
      { id_servicio: 4, nombre: "Diseño y Color", id_categoria_servicio: 4, precio: 30000, duracion_minutos: 60, imagen_url: "https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=600&auto=format&fit=crop&q=80", estado: 1 },
      { id_servicio: 5, nombre: "Corte Niño", id_categoria_servicio: 1, precio: 12000, duracion_minutos: 20, imagen_url: "https://images.unsplash.com/photo-1517832606589-7629c3395909?w=600&auto=format&fit=crop&q=80", estado: 1 }
    ];

    this.paquete_servicios = [
      { id_paquete: 1, nombre: "Paquete Básico", descuento_porcentaje: 10, estado: 1 },
      { id_paquete: 2, nombre: "Paquete Premium", descuento_porcentaje: 20, estado: 1 },
      { id_paquete: 3, nombre: "Paquete Especial Caballero", descuento_porcentaje: 15, estado: 1 }
    ];

    this.paquete_servicio_detalles = [
      { id_paquete_detalle: 1, id_paquete: 1, id_servicio: 1 },
      { id_paquete_detalle: 2, id_paquete: 1, id_servicio: 3 },
      { id_paquete_detalle: 3, id_paquete: 2, id_servicio: 2 },
      { id_paquete_detalle: 4, id_paquete: 2, id_servicio: 4 },
      { id_paquete_detalle: 5, id_paquete: 3, id_servicio: 1 },
      { id_paquete_detalle: 6, id_paquete: 3, id_servicio: 2 }
    ];

    this.categoria_productos = [
      { id_categoria_producto: 1, nombre: "Estilizado", estado: 1 },
      { id_categoria_producto: 2, nombre: "Cuidado", estado: 1 },
      { id_categoria_producto: 3, nombre: "Barba", estado: 1 },
      { id_categoria_producto: 4, nombre: "Herramientas", estado: 1 }
    ];

    this.productos = [
      { id_producto: 1, nombre: "Gel para Cabello Extra Fijación", id_categoria_producto: 1, stock: 25, precio: 15000, imagen_url: "https://images.unsplash.com/photo-1598452963314-b09f397a5c48?w=600&auto=format&fit=crop&q=80", estado: 1 },
      { id_producto: 2, nombre: "Cera Modeladora Mate", id_categoria_producto: 1, stock: 8, precio: 18000, imagen_url: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&auto=format&fit=crop&q=80", estado: 1 },
      { id_producto: 3, nombre: "Shampoo Anticaída con Biotina", id_categoria_producto: 2, stock: 15, precio: 22000, imagen_url: "https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?w=600&auto=format&fit=crop&q=80", estado: 1 },
      { id_producto: 4, nombre: "Aceite Nutritivo para Barba", id_categoria_producto: 3, stock: 12, precio: 25000, imagen_url: "https://images.unsplash.com/photo-1621607512214-68297480165e?w=600&auto=format&fit=crop&q=80", estado: 1 },
      { id_producto: 5, nombre: "Navaja de Afeitar Clásica", id_categoria_producto: 4, stock: 5, precio: 45000, imagen_url: "https://images.unsplash.com/photo-1512690459411-b9245aed614b?w=600&auto=format&fit=crop&q=80", estado: 1 },
      { id_producto: 6, nombre: "Tijeras Profesionales de Corte", id_categoria_producto: 4, stock: 10, precio: 65000, imagen_url: "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=600&auto=format&fit=crop&q=80", estado: 1 },
      { id_producto: 7, nombre: "Peine Antiestático de Carbono", id_categoria_producto: 4, stock: 30, precio: 8000, imagen_url: "https://images.unsplash.com/photo-1590439471364-192aa70c0b53?w=600&auto=format&fit=crop&q=80", estado: 1 },
      { id_producto: 8, nombre: "Bálsamo Calmante Aftershave", id_categoria_producto: 3, stock: 18, precio: 20000, imagen_url: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600&auto=format&fit=crop&q=80", estado: 1 }
    ];

    this.proveedores = [
      { id_proveedor: 1, nombre: "Distribuidora Barber Pro Colombia", nit: "901.234.567-1", telefono: "+57 (601) 745-8920", correo: "ventas@barberprocolombia.com", direccion: "Cra. 15 # 85-32, Zona Rosa", estado: 1 },
      { id_proveedor: 2, nombre: "Cosméticos & Cuidado Capilar S.A.S.", nit: "900.876.543-2", telefono: "+57 (604) 448-1122", correo: "contacto@cuidadocapilar.com.co", direccion: "Calle 10 # 43E-21, El Poblado", estado: 1 },
      { id_proveedor: 3, nombre: "Herramientas & Barber Supplies", nit: "800.345.678-9", telefono: "+57 (602) 667-3344", correo: "pedidos@barbersupplies.co", direccion: "Av. 6N # 28N-50, Sta. Mónica", estado: 1 }
    ];

    this.horarios = [
      { id_horario: 1, id_barbero: 1, dia_semana: "Lunes", hora_inicio: "08:00:00", hora_fin: "18:00:00", estado: 1 },
      { id_horario: 2, id_barbero: 1, dia_semana: "Martes", hora_inicio: "08:00:00", hora_fin: "18:00:00", estado: 1 },
      { id_horario: 3, id_barbero: 1, dia_semana: "Miercoles", hora_inicio: "08:00:00", hora_fin: "18:00:00", estado: 1 },
      { id_horario: 4, id_barbero: 1, dia_semana: "Jueves", hora_inicio: "08:00:00", hora_fin: "18:00:00", estado: 1 },
      { id_horario: 5, id_barbero: 1, dia_semana: "Viernes", hora_inicio: "08:00:00", hora_fin: "18:00:00", estado: 1 },
      { id_horario: 6, id_barbero: 1, dia_semana: "Sabado", hora_inicio: "08:00:00", hora_fin: "18:00:00", estado: 1 },
      { id_horario: 7, id_barbero: 2, dia_semana: "Lunes", hora_inicio: "09:00:00", hora_fin: "19:00:00", estado: 1 },
      { id_horario: 8, id_barbero: 2, dia_semana: "Martes", hora_inicio: "09:00:00", hora_fin: "19:00:00", estado: 1 },
      { id_horario: 9, id_barbero: 2, dia_semana: "Miercoles", hora_inicio: "09:00:00", hora_fin: "19:00:00", estado: 1 },
      { id_horario: 10, id_barbero: 2, dia_semana: "Viernes", hora_inicio: "09:00:00", hora_fin: "19:00:00", estado: 1 },
      { id_horario: 11, id_barbero: 2, dia_semana: "Sabado", hora_inicio: "09:00:00", hora_fin: "19:00:00", estado: 1 }
    ];

    this.novedades = [
      { id_novedad: 1, id_barbero: 2, tipo: "Permiso", fecha: today, descripcion: "Trámites personales", estado: "Pendiente", fecha_registro: now }
    ];

    this.citas = [
      { id_cita: 1, id_cliente: 1, id_barbero: 1, fecha: today, hora: "10:00:00", estado: "Programada", fecha_registro: now },
      { id_cita: 2, id_cliente: 1, id_barbero: 2, fecha: today, hora: "15:00:00", estado: "Programada", fecha_registro: now }
    ];

    this.cita_detalles = [
      { id_cita_detalle: 1, id_cita: 1, id_servicio: 1, precio: 15000 },
      { id_cita_detalle: 2, id_cita: 2, id_servicio: 2, precio: 25000 }
    ];

    this.compras = [
      { id_compra: 1, id_proveedor: 1, id_usuario: 1, fecha: now, total: 300000, estado: "Registrada" }
    ];

    this.detalle_compras = [
      { id_detalle_compra: 1, id_compra: 1, id_producto: 1, cantidad: 20, precio_unitario: 10000, subtotal: 200000 },
      { id_detalle_compra: 2, id_compra: 1, id_producto: 2, cantidad: 10, precio_unitario: 10000, subtotal: 100000 }
    ];

    this.ventas = [
      { id_venta: 1, id_cita: 1, id_cliente: 1, id_usuario: 1, fecha: now, total: 30000, estado: "Activa" }
    ];

    this.venta_detalles = [
      { id_venta_detalle: 1, id_venta: 1, tipo_item: "Servicio", id_producto: null, id_servicio: 1, cantidad: 1, precio_unitario: 15000, subtotal: 15000 },
      { id_venta_detalle: 2, id_venta: 1, tipo_item: "Producto", id_producto: 1, id_servicio: null, cantidad: 1, precio_unitario: 15000, subtotal: 15000 }
    ];

    this.bitacora = [
      { id_log: 1, id_usuario: 1, accion: "Inicio de sesión", fecha_hora: now, ip_origen: "127.0.0.1" }
    ];
  }
}

export const mockStore = new MockDataStore();

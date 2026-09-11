/**
 * @file mockStore.js
 * Almacén sincronizado con el esquema exacto de Data_Base/Database.sql con persistencia a disco (JSON).
 * Permite el funcionamiento 100% resiliente y continuo cuando MySQL local no está activo.
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { logger } from "../utils/logger.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class MockDataStore {
  constructor() {
    this.storageDir = path.resolve(__dirname, "../../data");
    this.storageFile = path.resolve(this.storageDir, "db_store.json");
    this.init();
  }

  init() {
    // 1. Inicializar esquema y datos base
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

    // Usuarios del sistema con contraseñas hash bcrypt
    // Admin123* -> $2a$10$R5F7eDK4YIcPt4oUwiPmi.gGrb1DRT8eM2nXwfF39bMU5nTGWqOSu
    // Recepcionista123* -> $2a$10$Ku.tqQGp/NPVGoaCStVTzOuQFtRYIyoEA9PK01Ly1jriIflVN9WfO
    // Barbero123* -> $2a$10$..d9zrvkZBpDPQANvi.z.eblOC6bCJAR.juYapz84EHqG88H3e16q
    this.usuarios = [
      { id_usuario: 1, nombre: "Cristian", apellido: "Mazo", correo: "cristianmazo957@gmail.com", contrasena: "$2a$10$R5F7eDK4YIcPt4oUwiPmi.gGrb1DRT8eM2nXwfF39bMU5nTGWqOSu", telefono: "+57 300 987 6543", id_rol: 1, estado: 1, fecha_registro: "2026-01-10 08:00:00" },
      { id_usuario: 3, nombre: "María", apellido: "García", correo: "maria@example.com", contrasena: "$2a$10$Ku.tqQGp/NPVGoaCStVTzOuQFtRYIyoEA9PK01Ly1jriIflVN9WfO", telefono: "+57 301 234 5678", id_rol: 2, estado: 1, fecha_registro: "2026-02-20 14:15:00" },
      { id_usuario: 4, nombre: "Carlos", apellido: "Rodríguez", correo: "barbero@tuturnobarber.com", contrasena: "$2a$10$..d9zrvkZBpDPQANvi.z.eblOC6bCJAR.juYapz84EHqG88H3e16q", telefono: "+57 302 345 6789", id_rol: 3, estado: 1, fecha_registro: "2026-03-10 09:00:00" }
    ];

    // Barbero único por defecto (Carlos Rodríguez)
    this.barberos = [
      { id_barbero: 1, id_usuario: 4, especialidad: "Corte Clásico & Fade", imagen_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80", estado: 1 }
    ];

    this.clientes = [];
    this.categoria_servicios = [
      { id_categoria_servicio: 1, nombre: "Cortes", estado: 1 },
      { id_categoria_servicio: 2, nombre: "Barba", estado: 1 },
      { id_categoria_servicio: 3, nombre: "Tratamientos", estado: 1 },
      { id_categoria_servicio: 4, nombre: "Combos", estado: 1 }
    ];
    this.servicios = [
      { id_servicio: 1, nombre: "Corte Clásico", id_categoria_servicio: 1, duracion_minutos: 30, precio: 15000, estado: 1 },
      { id_servicio: 2, nombre: "Corte + Barba", id_categoria_servicio: 4, duracion_minutos: 45, precio: 25000, estado: 1 },
      { id_servicio: 3, nombre: "Afeitado Premium", id_categoria_servicio: 2, duracion_minutos: 35, precio: 20000, estado: 1 },
      { id_servicio: 4, nombre: "Diseño y Color", id_categoria_servicio: 3, duracion_minutos: 60, precio: 30000, estado: 1 }
    ];

    this.paquete_servicios = [];
    this.paquete_servicio_detalles = [];

    this.categoria_productos = [
      { id_categoria_producto: 1, nombre: "Cuidado Capilar", estado: 1 },
      { id_categoria_producto: 2, nombre: "Cuidado Barba", estado: 2 },
      { id_categoria_producto: 3, nombre: "Herramientas & Accesorios", estado: 1 }
    ];
    this.productos = [];
    this.proveedores = [];
    this.horarios = [];
    this.novedades = [];
    this.citas = [];
    this.cita_detalles = [];
    this.compras = [];
    this.detalle_compras = [];
    this.ventas = [];
    this.venta_detalles = [];
    this.bitacora = [];

    // 2. Cargar datos persistidos en disco si existen
    this.loadFromFile();
  }

  loadFromFile() {
    try {
      if (fs.existsSync(this.storageFile)) {
        const raw = fs.readFileSync(this.storageFile, "utf8");
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === "object") {
          for (const key of Object.keys(parsed)) {
            if (Array.isArray(parsed[key]) && Array.isArray(this[key])) {
              this[key] = parsed[key];
            }
          }
          logger.info(`💾 Datos cargados exitosamente desde persistencia local: ${this.storageFile}`);
        }
      }
    } catch (err) {
      logger.warn(`⚠️ Error al leer persistencia local: ${err.message}`);
    }
  }

  saveToFile() {
    try {
      if (!fs.existsSync(this.storageDir)) {
        fs.mkdirSync(this.storageDir, { recursive: true });
      }

      const snapshot = {
        roles: this.roles,
        modulos: this.modulos,
        permisos: this.permisos,
        rol_permisos: this.rol_permisos,
        usuarios: this.usuarios,
        barberos: this.barberos,
        clientes: this.clientes,
        categoria_servicios: this.categoria_servicios,
        servicios: this.servicios,
        paquete_servicios: this.paquete_servicios,
        paquete_servicio_detalles: this.paquete_servicio_detalles,
        categoria_productos: this.categoria_productos,
        productos: this.productos,
        proveedores: this.proveedores,
        horarios: this.horarios,
        novedades: this.novedades,
        citas: this.citas,
        cita_detalles: this.cita_detalles,
        compras: this.compras,
        detalle_compras: this.detalle_compras,
        ventas: this.ventas,
        venta_detalles: this.venta_detalles,
        bitacora: this.bitacora
      };

      fs.writeFileSync(this.storageFile, JSON.stringify(snapshot, null, 2), "utf8");
    } catch (err) {
      logger.warn(`⚠️ Error al guardar persistencia local: ${err.message}`);
    }
  }
}

export const mockStore = new MockDataStore();

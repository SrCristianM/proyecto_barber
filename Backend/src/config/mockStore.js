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
      { id_modulo: 10, nombre_modulo: "compras" },
      { id_modulo: 11, nombre_modulo: "barberos" },
      { id_modulo: 12, nombre_modulo: "paquetes" },
      { id_modulo: 13, nombre_modulo: "abastecimiento" }
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
      { id_permiso: 12, id_modulo: 3, accion: "cancelar" },
      { id_permiso: 13, id_modulo: 4, accion: "ver" },
      { id_permiso: 14, id_modulo: 4, accion: "crear" },
      { id_permiso: 15, id_modulo: 4, accion: "editar" },
      { id_permiso: 16, id_modulo: 4, accion: "eliminar" },
      { id_permiso: 17, id_modulo: 5, accion: "ver" },
      { id_permiso: 18, id_modulo: 5, accion: "crear" },
      { id_permiso: 19, id_modulo: 5, accion: "editar" },
      { id_permiso: 20, id_modulo: 5, accion: "eliminar" },
      { id_permiso: 21, id_modulo: 6, accion: "ver" },
      { id_permiso: 22, id_modulo: 6, accion: "crear" },
      { id_permiso: 23, id_modulo: 6, accion: "editar" },
      { id_permiso: 24, id_modulo: 6, accion: "anular" },
      { id_permiso: 25, id_modulo: 7, accion: "ver" },
      { id_permiso: 26, id_modulo: 7, accion: "crear" },
      { id_permiso: 27, id_modulo: 7, accion: "editar" },
      { id_permiso: 28, id_modulo: 7, accion: "eliminar" },
      { id_permiso: 29, id_modulo: 8, accion: "ver" },
      { id_permiso: 30, id_modulo: 8, accion: "crear" },
      { id_permiso: 31, id_modulo: 8, accion: "editar" },
      { id_permiso: 32, id_modulo: 8, accion: "eliminar" },
      { id_permiso: 33, id_modulo: 9, accion: "ver" },
      { id_permiso: 34, id_modulo: 9, accion: "crear" },
      { id_permiso: 35, id_modulo: 9, accion: "editar" },
      { id_permiso: 36, id_modulo: 9, accion: "eliminar" },
      { id_permiso: 37, id_modulo: 10, accion: "ver" },
      { id_permiso: 38, id_modulo: 10, accion: "crear" },
      { id_permiso: 39, id_modulo: 10, accion: "editar" },
      { id_permiso: 40, id_modulo: 10, accion: "anular" },
      { id_permiso: 41, id_modulo: 10, accion: "eliminar" },
      { id_permiso: 42, id_modulo: 11, accion: "ver" },
      { id_permiso: 43, id_modulo: 11, accion: "crear" },
      { id_permiso: 44, id_modulo: 11, accion: "editar" },
      { id_permiso: 45, id_modulo: 11, accion: "eliminar" },
      { id_permiso: 46, id_modulo: 12, accion: "ver" },
      { id_permiso: 47, id_modulo: 12, accion: "crear" },
      { id_permiso: 48, id_modulo: 12, accion: "editar" },
      { id_permiso: 49, id_modulo: 12, accion: "eliminar" },
      { id_permiso: 50, id_modulo: 1, accion: "activar" },
      { id_permiso: 51, id_modulo: 4, accion: "activar" },
      { id_permiso: 52, id_modulo: 5, accion: "activar" },
      { id_permiso: 53, id_modulo: 7, accion: "activar" },
      { id_permiso: 54, id_modulo: 8, accion: "activar" },
      { id_permiso: 55, id_modulo: 9, accion: "activar" },
      { id_permiso: 56, id_modulo: 11, accion: "activar" },
      { id_permiso: 58, id_modulo: 13, accion: "ver" },
      { id_permiso: 59, id_modulo: 13, accion: "crear" },
      { id_permiso: 60, id_modulo: 13, accion: "anular" },
      { id_permiso: 61, id_modulo: 13, accion: "editar" },
      { id_permiso: 62, id_modulo: 13, accion: "eliminar" }
    ];

    this.rol_permisos = [
      // Admin (rol 1): todos los permisos del sistema
      ...this.permisos.map((p) => ({ id_rol: 1, id_permiso: p.id_permiso })),
      // Recepcionista (rol 2): Citas, Servicios, Productos, Ventas, Horarios, Clientes, Compras, Barberos, Paquetes + Proveedores (ver y eliminar SOLAMENTE)
      { id_rol: 2, id_permiso: 9 }, { id_rol: 2, id_permiso: 10 }, { id_rol: 2, id_permiso: 11 }, { id_rol: 2, id_permiso: 12 },
      { id_rol: 2, id_permiso: 13 }, { id_rol: 2, id_permiso: 14 }, { id_rol: 2, id_permiso: 15 }, { id_rol: 2, id_permiso: 16 }, { id_rol: 2, id_permiso: 51 },
      { id_rol: 2, id_permiso: 17 }, { id_rol: 2, id_permiso: 18 }, { id_rol: 2, id_permiso: 19 }, { id_rol: 2, id_permiso: 20 }, { id_rol: 2, id_permiso: 52 },
      { id_rol: 2, id_permiso: 21 }, { id_rol: 2, id_permiso: 22 }, { id_rol: 2, id_permiso: 23 }, { id_rol: 2, id_permiso: 24 },
      { id_rol: 2, id_permiso: 25 }, { id_rol: 2, id_permiso: 26 }, { id_rol: 2, id_permiso: 27 }, { id_rol: 2, id_permiso: 28 }, { id_rol: 2, id_permiso: 53 },
      { id_rol: 2, id_permiso: 29 }, { id_rol: 2, id_permiso: 30 }, { id_rol: 2, id_permiso: 31 }, { id_rol: 2, id_permiso: 32 }, { id_rol: 2, id_permiso: 54 },
      { id_rol: 2, id_permiso: 33 }, { id_rol: 2, id_permiso: 36 }, // Proveedores: SOLO ver (33) y eliminar (36). NO crear (34) ni editar (35)
      { id_rol: 2, id_permiso: 37 }, { id_rol: 2, id_permiso: 38 }, { id_rol: 2, id_permiso: 39 }, { id_rol: 2, id_permiso: 40 }, { id_rol: 2, id_permiso: 41 },
      { id_rol: 2, id_permiso: 42 }, { id_rol: 2, id_permiso: 43 }, { id_rol: 2, id_permiso: 44 }, { id_rol: 2, id_permiso: 45 }, { id_rol: 2, id_permiso: 56 },
      { id_rol: 2, id_permiso: 46 }, { id_rol: 2, id_permiso: 47 }, { id_rol: 2, id_permiso: 48 }, { id_rol: 2, id_permiso: 49 },
      { id_rol: 2, id_permiso: 58 }, { id_rol: 2, id_permiso: 59 }, { id_rol: 2, id_permiso: 60 },
      // Barbero (rol 3): Citas (ver, crear, editar, cancelar), Horarios (ver, crear, editar, eliminar, activar), Servicios (ver), Paquetes (ver), Productos (ver), Clientes (ver), Ventas (ver)
      { id_rol: 3, id_permiso: 9 }, { id_rol: 3, id_permiso: 10 }, { id_rol: 3, id_permiso: 11 }, { id_rol: 3, id_permiso: 12 },
      { id_rol: 3, id_permiso: 25 }, { id_rol: 3, id_permiso: 26 }, { id_rol: 3, id_permiso: 27 }, { id_rol: 3, id_permiso: 28 }, { id_rol: 3, id_permiso: 53 },
      { id_rol: 3, id_permiso: 13 },
      { id_rol: 3, id_permiso: 46 },
      { id_rol: 3, id_permiso: 17 },
      { id_rol: 3, id_permiso: 29 },
      { id_rol: 3, id_permiso: 21 },
      // Cliente (rol 4): Citas (ver, crear, cancelar), Servicios (ver), Paquetes (ver), Productos (ver), Horarios (ver), Barberos (ver), Ventas (ver, crear)
      { id_rol: 4, id_permiso: 9 }, { id_rol: 4, id_permiso: 10 }, { id_rol: 4, id_permiso: 12 },
      { id_rol: 4, id_permiso: 13 },
      { id_rol: 4, id_permiso: 46 },
      { id_rol: 4, id_permiso: 17 },
      { id_rol: 4, id_permiso: 25 },
      { id_rol: 4, id_permiso: 42 },
      { id_rol: 4, id_permiso: 21 }, { id_rol: 4, id_permiso: 22 }
    ];

    // Usuarios del sistema con contraseñas hash bcrypt
    // Admin123* -> $2a$10$R5F7eDK4YIcPt4oUwiPmi.gGrb1DRT8eM2nXwfF39bMU5nTGWqOSu
    // Recepcionista123* -> $2a$10$Ku.tqQGp/NPVGoaCStVTzOuQFtRYIyoEA9PK01Ly1jriIflVN9WfO
    // Barbero123* -> $2a$10$..d9zrvkZBpDPQANvi.z.eblOC6bCJAR.juYapz84EHqG88H3e16q
    // Cliente123* -> $2a$10$lumBsO42oC1EdmksF1JhreBeDcE5VffsLgTD0UHqM9gyuKX3kTy9.
    this.usuarios = [
      { id_usuario: 1, nombre: "Cristian", apellido: "Mazo", documento: "1000000001", correo: "cristianmazo957@gmail.com", contrasena: "$2a$10$R5F7eDK4YIcPt4oUwiPmi.gGrb1DRT8eM2nXwfF39bMU5nTGWqOSu", telefono: "+57 300 987 6543", id_rol: 1, estado: 1, fecha_registro: "2026-01-10 08:00:00" },
      { id_usuario: 3, nombre: "María", apellido: "García", documento: "1000000002", correo: "maria@example.com", contrasena: "$2a$10$Ku.tqQGp/NPVGoaCStVTzOuQFtRYIyoEA9PK01Ly1jriIflVN9WfO", telefono: "+57 301 234 5678", id_rol: 2, estado: 1, fecha_registro: "2026-02-20 14:15:00" },
      { id_usuario: 4, nombre: "Carlos", apellido: "Rodríguez", documento: "1000000003", correo: "barbero@tuturnobarber.com", contrasena: "$2a$10$..d9zrvkZBpDPQANvi.z.eblOC6bCJAR.juYapz84EHqG88H3e16q", telefono: "+57 302 345 6789", id_rol: 3, estado: 1, fecha_registro: "2026-03-10 09:00:00" },
      { id_usuario: 5, nombre: "Juan", apellido: "Pérez", documento: "1000000005", correo: "cliente@example.com", contrasena: "$2a$10$lumBsO42oC1EdmksF1JhreBeDcE5VffsLgTD0UHqM9gyuKX3kTy9.", telefono: "+57 310 123 4567", id_rol: 4, estado: 1, fecha_registro: "2026-04-05 10:00:00" },
      { id_usuario: 6, nombre: "Juan", apellido: "Pérez", documento: "1000000006", correo: "juan.perez@email.com", contrasena: "$2a$10$lumBsO42oC1EdmksF1JhreBeDcE5VffsLgTD0UHqM9gyuKX3kTy9.", telefono: "+57 310 123 4567", id_rol: 4, estado: 1, fecha_registro: "2026-04-05 10:00:00" },
      { id_usuario: 10, nombre: "barber", apellido: "gold", documento: "CC 9898989898", correo: "barbergoldenapp@gmail.com", contrasena: "$2a$10$lumBsO42oC1EdmksF1JhreBeDcE5VffsLgTD0UHqM9gyuKX3kTy9.", telefono: "+57 318 597 7853", id_rol: 4, estado: 1, fecha_registro: "2026-09-28 00:34:55" }
    ];

    // Barbero único por defecto (Carlos Rodríguez)
    this.barberos = [
      { id_barbero: 1, id_usuario: 4, especialidad: "Corte Clásico & Fade", imagen_url: null, estado: 1 }
    ];

    // Clientes por defecto (Inician en nivel Nuevo con 0 puntos)
    this.clientes = [
      { id_cliente: 1, id_usuario: 5, nivel_fidelidad: "Nuevo", puntos_fidelidad: 0, direccion: "Calle 10 # 40-20, Medellín", estado: 1 },
      { id_cliente: 2, id_usuario: 6, nivel_fidelidad: "Nuevo", puntos_fidelidad: 0, direccion: "Carrera 43A # 1-50, Medellín", estado: 1 }
    ];

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
    this.productos = [
      {
        "id_producto": 1,
        "nombre": "Pomada Matte Fijación Fuerte",
        "id_categoria_producto": 1,
        "precio": 32000,
        "stock": 25,
        "imagen_url": "https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?auto=format&fit=crop&w=600&q=80",
        "estado": 1,
        "descripcion": "Pomada base agua con fijación de alto rendimiento durante todo el día y acabado mate sin brillo. No deja residuos blancos ni sensación pegajosa, y se enjuaga fácilmente con agua.",
        "modo_uso": "Toma una pequeña cantidad con las yemas de los dedos, frótala en las palmas hasta calentar el producto y distribuye uniformemente sobre el cabello seco o húmedo. Estiliza con peine o con los dedos para lograr el peinado deseado.",
        "ingredientes": "Aqua (Agua desionizada), Cera Alba (Cera de abejas natural), Ceteareth-25, Glicerina vegetal, Aceite de Argán puro, Fragancia amaderada de cedro y vainilla.",
        "marca": "BarberBook Classic",
        "presentacion": "Lata metálica de 100g / 3.5 oz",
        "fijacion": "Fuerte (4/5)",
        "acabado": "Mate natural sin brillo"
      },
      {
        "id_producto": 2,
        "nombre": "Aceite Nutritivo para Barba",
        "id_categoria_producto": 2,
        "precio": 25000,
        "stock": 20,
        "imagen_url": "https://images.unsplash.com/photo-1608248597358-1e428c0353c7?auto=format&fit=crop&w=600&q=80",
        "estado": 1,
        "descripcion": "Fórmula hidratante enriquecida con aceites naturales prensados en frío para acondicionar la barba áspera, suavizar la cutícula y calmar la piel debajo previniendo picazón y descamación.",
        "modo_uso": "Dosifica de 3 a 5 gotas en la palma de la mano, frota ligeramente para activar los aceites esenciales y masajea sobre la barba limpia desde la raíz hasta las puntas con movimientos circulares.",
        "ingredientes": "Aceite de Jojoba orgánico, Aceite de Argán de Marruecos, Aceite de semilla de uva, Tocoferol (Vitamina E), Esencias botánicas de cedro y bergamota.",
        "marca": "BarberBook Grooming",
        "presentacion": "Frasco de vidrio ámbar con gotero 50ml / 1.7 fl oz",
        "fijacion": "Nutritivo / Suavizante",
        "acabado": "Brillo sutil sedoso"
      },
      {
        "id_producto": 3,
        "nombre": "Bálsamo Aftershave Calmante",
        "id_categoria_producto": 2,
        "precio": 28000,
        "stock": 15,
        "imagen_url": "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=600&q=80",
        "estado": 1,
        "descripcion": "Bálsamo post-afeitado libre de alcohol formulado con aloe vera orgánico y extracto de hamamelis que alivia al instante el enrojecimiento, cierra los poros y brinda una frescura revitalizante.",
        "modo_uso": "Tras el afeitado o recorte de barba, enjuaga con agua fría y seca con toalla. Aplica una pequeña cantidad sobre el rostro y cuello realizando suaves toques ascendentes hasta su total absorción.",
        "ingredientes": "Jugo de hoja de Aloe Barbadensis, Extracto de Hamamelis, Alantoína, Pantenol (Pro-Vitamina B5), Aceite de árbol de té y mentol natural.",
        "marca": "BarberBook Grooming",
        "presentacion": "Envase ergonómico con dosificador 120ml / 4.0 fl oz",
        "fijacion": "Calmante & Anti-irritación",
        "acabado": "Sensación fresca no grasa"
      }
    ];
    this.proveedores = [];
    this.horarios = [];
    this.novedades = [];
    this.citas = [];
    this.cita_detalles = [];
    this.compras = [];
    this.detalle_compras = [];
    this.ventas = [];
    this.venta_detalles = [];
    this.abastecimientos = [];
    this.abastecimiento_detalles = [];
    this.insumos_bodega = [];
    this.movimientos_bodega = [];
    this.entradas_mercancia = [];
    this.estaciones_barberos = [];
    this.historial_reposiciones = [];

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
              if (key === "modulos") {
                const defaultModulos = [...this.modulos];
                this.modulos = parsed.modulos;
                for (const dm of defaultModulos) {
                  if (!this.modulos.some((m) => m.id_modulo === dm.id_modulo)) {
                    this.modulos.push(dm);
                  }
                }
              } else if (key === "permisos") {
                const defaultPermisos = [...this.permisos];
                this.permisos = parsed.permisos;
                for (const dp of defaultPermisos) {
                  if (!this.permisos.some((p) => p.id_modulo === dp.id_modulo && p.accion === dp.accion)) {
                    this.permisos.push(dp);
                  }
                }
              } else {
                this[key] = parsed[key];
              }
            }
          }
          logger.info(`💾 Datos cargados exitosamente desde persistencia local: ${this.storageFile}`);
        }
      }
      this.ensureRolePermissionsSync();
    } catch (err) {
      logger.warn(`⚠️ Error al leer persistencia local: ${err.message}`);
    }
  }

  ensureRolePermissionsSync() {
    const defaultRolePerms = [
      ...this.permisos.map((p) => ({ id_rol: 1, id_permiso: p.id_permiso })),
      { id_rol: 2, id_permiso: 9 }, { id_rol: 2, id_permiso: 10 }, { id_rol: 2, id_permiso: 11 }, { id_rol: 2, id_permiso: 12 },
      { id_rol: 2, id_permiso: 13 }, { id_rol: 2, id_permiso: 14 }, { id_rol: 2, id_permiso: 15 }, { id_rol: 2, id_permiso: 16 }, { id_rol: 2, id_permiso: 51 },
      { id_rol: 2, id_permiso: 17 }, { id_rol: 2, id_permiso: 18 }, { id_rol: 2, id_permiso: 19 }, { id_rol: 2, id_permiso: 20 }, { id_rol: 2, id_permiso: 52 },
      { id_rol: 2, id_permiso: 21 }, { id_rol: 2, id_permiso: 22 }, { id_rol: 2, id_permiso: 23 }, { id_rol: 2, id_permiso: 24 },
      { id_rol: 2, id_permiso: 25 }, { id_rol: 2, id_permiso: 26 }, { id_rol: 2, id_permiso: 27 }, { id_rol: 2, id_permiso: 28 }, { id_rol: 2, id_permiso: 53 },
      { id_rol: 2, id_permiso: 29 }, { id_rol: 2, id_permiso: 30 }, { id_rol: 2, id_permiso: 31 }, { id_rol: 2, id_permiso: 32 }, { id_rol: 2, id_permiso: 54 },
      { id_rol: 2, id_permiso: 33 }, { id_rol: 2, id_permiso: 36 },
      { id_rol: 2, id_permiso: 37 }, { id_rol: 2, id_permiso: 38 }, { id_rol: 2, id_permiso: 39 }, { id_rol: 2, id_permiso: 40 }, { id_rol: 2, id_permiso: 41 },
      { id_rol: 2, id_permiso: 42 }, { id_rol: 2, id_permiso: 43 }, { id_rol: 2, id_permiso: 44 }, { id_rol: 2, id_permiso: 45 }, { id_rol: 2, id_permiso: 56 },
      { id_rol: 2, id_permiso: 46 }, { id_rol: 2, id_permiso: 47 }, { id_rol: 2, id_permiso: 48 }, { id_rol: 2, id_permiso: 49 },
      { id_rol: 2, id_permiso: 57 }, { id_rol: 2, id_permiso: 58 }, { id_rol: 2, id_permiso: 59 },
      { id_rol: 3, id_permiso: 9 }, { id_rol: 3, id_permiso: 10 }, { id_rol: 3, id_permiso: 11 }, { id_rol: 3, id_permiso: 12 },
      { id_rol: 3, id_permiso: 25 }, { id_rol: 3, id_permiso: 26 }, { id_rol: 3, id_permiso: 27 }, { id_rol: 3, id_permiso: 28 }, { id_rol: 3, id_permiso: 53 },
      { id_rol: 3, id_permiso: 13 },
      { id_rol: 3, id_permiso: 46 },
      { id_rol: 3, id_permiso: 17 },
      { id_rol: 3, id_permiso: 29 },
      { id_rol: 3, id_permiso: 21 },
      { id_rol: 4, id_permiso: 9 }, { id_rol: 4, id_permiso: 10 }, { id_rol: 4, id_permiso: 12 },
      { id_rol: 4, id_permiso: 13 },
      { id_rol: 4, id_permiso: 46 },
      { id_rol: 4, id_permiso: 17 },
      { id_rol: 4, id_permiso: 25 },
      { id_rol: 4, id_permiso: 42 },
      { id_rol: 4, id_permiso: 21 }, { id_rol: 4, id_permiso: 22 }
    ];

    let changed = false;
    for (const rId of [1, 2, 3, 4]) {
      const defaultsForRole = defaultRolePerms.filter((rp) => rp.id_rol === rId);
      for (const def of defaultsForRole) {
        const exists = this.rol_permisos.some(
          (rp) => rp.id_rol === rId && rp.id_permiso === def.id_permiso
        );
        if (!exists) {
          this.rol_permisos.push(def);
          changed = true;
        }
      }
    }

    // Asegurar cuentas base esenciales
    const defaultUsers = [
      { id_usuario: 1, nombre: "Cristian", apellido: "Mazo", documento: "1000000001", correo: "cristianmazo957@gmail.com", contrasena: "$2a$10$R5F7eDK4YIcPt4oUwiPmi.gGrb1DRT8eM2nXwfF39bMU5nTGWqOSu", telefono: "+57 300 987 6543", id_rol: 1, estado: 1, fecha_registro: "2026-01-10 08:00:00" },
      { id_usuario: 3, nombre: "María", apellido: "García", documento: "1000000002", correo: "maria@example.com", contrasena: "$2a$10$Ku.tqQGp/NPVGoaCStVTzOuQFtRYIyoEA9PK01Ly1jriIflVN9WfO", telefono: "+57 301 234 5678", id_rol: 2, estado: 1, fecha_registro: "2026-02-20 14:15:00" },
      { id_usuario: 4, nombre: "Carlos", apellido: "Rodríguez", documento: "1000000003", correo: "barbero@tuturnobarber.com", contrasena: "$2a$10$..d9zrvkZBpDPQANvi.z.eblOC6bCJAR.juYapz84EHqG88H3e16q", telefono: "+57 302 345 6789", id_rol: 3, estado: 1, fecha_registro: "2026-03-10 09:00:00" },
      { id_usuario: 5, nombre: "Juan", apellido: "Pérez", documento: "1000000005", correo: "cliente@example.com", contrasena: "$2a$10$lumBsO42oC1EdmksF1JhreBeDcE5VffsLgTD0UHqM9gyuKX3kTy9.", telefono: "+57 310 123 4567", id_rol: 4, estado: 1, fecha_registro: "2026-04-05 10:00:00" }
    ];

    for (const u of defaultUsers) {
      if (!this.usuarios.some((user) => user.correo.toLowerCase() === u.correo.toLowerCase())) {
        this.usuarios.push(u);
        changed = true;
      }
    }

    if (!this.clientes.some((c) => c.id_cliente === 1)) {
      this.clientes.unshift({ id_cliente: 1, id_usuario: 5, nivel_fidelidad: "Plata", direccion: "Calle 10 # 40-20, Medellín", estado: 1 });
      changed = true;
    }

    // Seed de Proveedores si está vacío
    if (!this.proveedores || this.proveedores.length === 0) {
      this.proveedores = [
        {
          id_proveedor: 1,
          nombre: "Distribuidora Barber Pro",
          contacto: "Álvaro Gómez",
          telefono: "+57 312 456 7890",
          email: "ventas@barberpro.co",
          notas: "Distribuidor oficial de cuchillas Derby, desinfectantes y toallas desechables.",
          estado: 1
        },
        {
          id_proveedor: 2,
          nombre: "Elegance Cosmetics Co.",
          contacto: "Laura Restrepo",
          telefono: "+57 320 654 3210",
          email: "contacto@elegancecolombia.com",
          notas: "Proveedor de geles para afeitar, aceites de barba y talcos mentolados.",
          estado: 1
        }
      ];
      changed = true;
    }

    // Seed de Insumos de Bodega General si está vacío
    if (!this.insumos_bodega || this.insumos_bodega.length === 0) {
      this.insumos_bodega = [
        {
          id_insumo: 1,
          nombre: "Cuchillas Derby Premium (Caja x 100)",
          categoria: "Afeitado y Corte",
          stock_actual: 45,
          stock_minimo: 10,
          unidad_medida: "Caja",
          proveedor_id: 1,
          estado: 1,
          fecha_creacion: "2026-09-01 10:00:00"
        },
        {
          id_insumo: 2,
          nombre: "Gel para Afeitar Elegance 500ml",
          categoria: "Afeitado y Cuidado",
          stock_actual: 14,
          stock_minimo: 5,
          unidad_medida: "Bote 500ml",
          proveedor_id: 2,
          estado: 1,
          fecha_creacion: "2026-09-01 10:00:00"
        },
        {
          id_insumo: 3,
          nombre: "Alcohol Antiséptico 70% 1000ml",
          categoria: "Higiene y Desinfección",
          stock_actual: 9,
          stock_minimo: 4,
          unidad_medida: "Frasco 1L",
          proveedor_id: 1,
          estado: 1,
          fecha_creacion: "2026-09-01 10:00:00"
        },
        {
          id_insumo: 4,
          nombre: "Talco Mentolado Clubman 255g",
          categoria: "Cuidado Facial",
          stock_actual: 18,
          stock_minimo: 6,
          unidad_medida: "Frasco",
          proveedor_id: 2,
          estado: 1,
          fecha_creacion: "2026-09-01 10:00:00"
        },
        {
          id_insumo: 5,
          nombre: "Papel Cuello Protector Barbero",
          categoria: "Protección y Bioseguridad",
          stock_actual: 3, // ALERTA: <= stock_minimo (5)
          stock_minimo: 5,
          unidad_medida: "Paquete x 5 rollos",
          proveedor_id: 1,
          estado: 1,
          fecha_creacion: "2026-09-01 10:00:00"
        }
      ];
      changed = true;
    }

    // Seed de Estación Barbero (Carlos Rodríguez: id_barbero: 1)
    if (!this.estaciones_barberos || this.estaciones_barberos.length === 0) {
      this.estaciones_barberos = [
        {
          id_estacion_insumo: 1,
          id_estacion_item: 1,
          id_barbero: 1,
          barbero_id: 1,
          id_insumo: 1, // Cuchillas Derby
          insumo_id: 1,
          cantidad_asignada: 1,
          estado_semaforo: "ROJO", // Agotado / requiere reposición urgente
          fecha_ultima_reposicion: "2026-10-06 10:00:00", // Hace 15 días
          fecha_cambio_estado: "2026-10-21 08:30:00",
          notas: "Cuchillas Derby agotadas, solicitando reposición"
        },
        {
          id_estacion_insumo: 2,
          id_estacion_item: 2,
          id_barbero: 1,
          barbero_id: 1,
          id_insumo: 2, // Gel Elegance
          insumo_id: 2,
          cantidad_asignada: 1,
          estado_semaforo: "AMARILLO", // Por agotarse
          fecha_ultima_reposicion: "2026-10-12 11:00:00", // Hace 9 días
          fecha_cambio_estado: "2026-10-20 16:15:00",
          notas: "Queda poco gel de afeitar"
        },
        {
          id_estacion_insumo: 3,
          id_estacion_item: 3,
          id_barbero: 1,
          barbero_id: 1,
          id_insumo: 3, // Alcohol 70%
          insumo_id: 3,
          cantidad_asignada: 1,
          estado_semaforo: "VERDE", // Lleno
          fecha_ultima_reposicion: "2026-10-18 09:00:00", // Hace 3 días
          fecha_cambio_estado: "2026-10-18 09:00:00",
          notas: "En uso activo"
        },
        {
          id_estacion_insumo: 4,
          id_estacion_item: 4,
          id_barbero: 1,
          barbero_id: 1,
          id_insumo: 4, // Talco Mentolado
          insumo_id: 4,
          cantidad_asignada: 1,
          estado_semaforo: "VERDE", // Lleno
          fecha_ultima_reposicion: "2026-10-14 14:00:00", // Hace 7 días
          fecha_cambio_estado: "2026-10-14 14:00:00",
          notas: "En uso activo"
        }
      ];
      changed = true;
    }

    // Seed de Historial de Reposiciones
    if (!this.historial_reposiciones || this.historial_reposiciones.length === 0) {
      this.historial_reposiciones = [
        {
          id_historial: 1,
          id_barbero: 1,
          barbero_id: 1,
          id_insumo: 1,
          insumo_id: 1,
          cantidad_entregada: 1,
          fecha_reposicion: "2026-10-06 10:00:00",
          dias_duracion_anterior: 14
        },
        {
          id_historial: 2,
          id_barbero: 1,
          barbero_id: 1,
          id_insumo: 1,
          insumo_id: 1,
          cantidad_entregada: 1,
          fecha_reposicion: "2026-09-22 10:00:00",
          dias_duracion_anterior: 13
        },
        {
          id_historial: 3,
          id_barbero: 1,
          barbero_id: 1,
          id_insumo: 2,
          insumo_id: 2,
          cantidad_entregada: 1,
          fecha_reposicion: "2026-10-12 11:00:00",
          dias_duracion_anterior: 18
        }
      ];
      changed = true;
    }

    // Asegurar costo_unitario en insumos_bodega
    const defaultCosts = {
      1: 12000, // Cuchillas Derby Premium (Caja x 100)
      2: 18000, // Gel para Afeitar Elegance 500ml
      3: 9500,  // Alcohol Antiséptico 70% 1000ml
      4: 22000, // Talco Mentolado Clubman 255g
      5: 14000  // Papel Cuello Protector Barbero
    };
    (this.insumos_bodega || []).forEach((item) => {
      if (!item.costo_unitario || Number(item.costo_unitario) === 0) {
        item.costo_unitario = defaultCosts[item.id_insumo] || 15000;
        changed = true;
      }
    });

    // Seed de Abastecimientos (Vales de Despacho) si está vacío
    if (!this.abastecimientos || this.abastecimientos.length === 0) {
      this.abastecimientos = [
        {
          id_abastecimiento: 1,
          id_barbero: 1,
          id_usuario: 1,
          fecha: "2026-10-06 10:00:00",
          observaciones: "Reposición aprobada: 1 un. de Cuchillas Derby Premium",
          total_estimado: 12000,
          estado: "Registrado"
        },
        {
          id_abastecimiento: 2,
          id_barbero: 1,
          id_usuario: 1,
          fecha: "2026-10-12 11:00:00",
          observaciones: "Reposición aprobada: 1 un. de Gel para Afeitar Elegance 500ml",
          total_estimado: 18000,
          estado: "Registrado"
        },
        {
          id_abastecimiento: 3,
          id_barbero: 1,
          id_usuario: 1,
          fecha: "2026-10-14 14:00:00",
          observaciones: "Reposición aprobada: 1 un. de Talco Mentolado Clubman 255g",
          total_estimado: 22000,
          estado: "Registrado"
        },
        {
          id_abastecimiento: 4,
          id_barbero: 1,
          id_usuario: 1,
          fecha: "2026-10-18 09:00:00",
          observaciones: "Reposición aprobada: 1 un. de Alcohol Antiséptico 70% 1000ml",
          total_estimado: 9500,
          estado: "Registrado"
        },
        {
          id_abastecimiento: 5,
          id_barbero: 1,
          id_usuario: 1,
          fecha: "2026-10-21 19:31:15",
          observaciones: "Reposición aprobada: 1 un. de Cuchillas Derby Premium",
          total_estimado: 12000,
          estado: "Registrado"
        }
      ];
      this.abastecimiento_detalles = [
        { id_abastecimiento_detalle: 1, id_abastecimiento: 1, id_producto: 1, cantidad: 1, precio_unitario: 12000, subtotal: 12000 },
        { id_abastecimiento_detalle: 2, id_abastecimiento: 2, id_producto: 2, cantidad: 1, precio_unitario: 18000, subtotal: 18000 },
        { id_abastecimiento_detalle: 3, id_abastecimiento: 3, id_producto: 4, cantidad: 1, precio_unitario: 22000, subtotal: 22000 },
        { id_abastecimiento_detalle: 4, id_abastecimiento: 4, id_producto: 3, cantidad: 1, precio_unitario: 9500, subtotal: 9500 },
        { id_abastecimiento_detalle: 5, id_abastecimiento: 5, id_producto: 1, cantidad: 1, precio_unitario: 12000, subtotal: 12000 }
      ];
      changed = true;
    }

    if (changed) {
      this.saveToFile();
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
        abastecimientos: this.abastecimientos,
        abastecimiento_detalles: this.abastecimiento_detalles,
        insumos_bodega: this.insumos_bodega,
        movimientos_bodega: this.movimientos_bodega || [],
        entradas_mercancia: this.entradas_mercancia,
        estaciones_barberos: this.estaciones_barberos,
        historial_reposiciones: this.historial_reposiciones
      };

      fs.writeFileSync(this.storageFile, JSON.stringify(snapshot, null, 2), "utf8");
    } catch (err) {
      logger.warn(`⚠️ Error al guardar persistencia local: ${err.message}`);
    }
  }
}

export const mockStore = new MockDataStore();

// SYNC_TIMESTAMP: 1790398079717
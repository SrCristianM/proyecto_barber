/**
 * @file constants.js
 * Constantes y Enums del sistema Tu Turno Barber.
 * Fuente de verdad: Data_Base/Database.sql y frontend/src/shared/types/database.js
 */

export const ROLES = {
  ADMIN: 1,
  RECEPCIONISTA: 2,
  BARBERO: 3,
  CLIENTE: 4
};

export const ROLES_MAP = {
  1: "Administrador",
  2: "Recepcionista",
  3: "Barbero",
  4: "Cliente"
};

export const ESTADOS_CITA = ["Programada", "Completada", "Cancelada", "Reprogramada"];

export const ESTADOS_VENTA = ["Activa", "Anulada"];

export const ESTADOS_COMPRA = ["Registrada", "Anulada"];

export const ESTADOS_NOVEDAD = ["Pendiente", "Aprobado", "Rechazado"];

export const DIAS_SEMANA = [
  "Lunes",
  "Martes",
  "Miercoles",
  "Jueves",
  "Viernes",
  "Sabado",
  "Domingo"
];

export const TIPOS_ITEM_VENTA = ["Producto", "Servicio"];

export const NIVELES_FIDELIDAD = ["Nuevo", "Bronce", "Plata", "Oro"];

export const MODULOS = [
  "usuarios",
  "roles",
  "citas",
  "servicios",
  "productos",
  "ventas",
  "horarios",
  "clientes",
  "proveedores",
  "compras"
];

export const PERMISOS_ACCIONES = [
  "ver",
  "crear",
  "editar",
  "eliminar",
  "activar",
  "anular",
  "asignar_roles"
];

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500
};

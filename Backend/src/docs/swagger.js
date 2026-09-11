export const swaggerDocument = {
  openapi: "3.0.0",
  info: {
    title: "Tu Turno Barber - Enterprise REST API",
    version: "1.0.0",
    description: "Documentación oficial de la API Backend para el sistema de gestión de barbería 'Tu Turno Barber'. Construida con Clean Architecture en Node.js, Express y MySQL."
  },
  servers: [
    {
      url: "http://localhost:3001/api",
      description: "Servidor local de desarrollo"
    }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT"
      }
    }
  },
  security: [
    {
      bearerAuth: []
    }
  ],
  paths: {
    "/auth/login": {
      post: {
        summary: "Inicio de sesión",
        tags: ["Autenticación"],
        security: [],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  correo: { type: "string", example: "cristianmazo957@gmail.com" },
                  contrasena: { type: "string", example: "Admin123*" }
                },
                required: ["correo", "contrasena"]
              }
            }
          }
        },
        responses: {
          200: { description: "Autenticación exitosa, retorna token JWT y datos de usuario" },
          400: { description: "Credenciales inválidas" }
        }
      }
    },
    "/auth/register": {
      post: {
        summary: "Registro de nuevo cliente",
        tags: ["Autenticación"],
        security: [],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  nombre: { type: "string", example: "Carlos" },
                  apellido: { type: "string", example: "Gómez" },
                  correo: { type: "string", example: "carlos.g@example.com" },
                  contrasena: { type: "string", example: "Cliente123*" },
                  telefono: { type: "string", example: "3001234567" }
                },
                required: ["nombre", "apellido", "correo", "contrasena"]
              }
            }
          }
        },
        responses: {
          201: { description: "Cliente registrado con éxito" }
        }
      }
    },
    "/users": {
      get: {
        summary: "Lista todos los usuarios con filtros",
        tags: ["Usuarios"],
        responses: { 200: { description: "Lista de usuarios" } }
      },
      post: {
        summary: "Crea un nuevo usuario",
        tags: ["Usuarios"],
        responses: { 201: { description: "Usuario creado" } }
      }
    },
    "/barbers": {
      get: {
        summary: "Lista todos los barberos",
        tags: ["Barberos"],
        responses: { 200: { description: "Lista de barberos" } }
      }
    },
    "/clients": {
      get: {
        summary: "Lista todos los clientes",
        tags: ["Clientes"],
        responses: { 200: { description: "Lista de clientes" } }
      }
    },
    "/services": {
      get: {
        summary: "Lista todos los servicios",
        tags: ["Servicios"],
        responses: { 200: { description: "Catálogo de servicios" } }
      }
    },
    "/packages": {
      get: {
        summary: "Lista paquetes promocionales",
        tags: ["Paquetes"],
        responses: { 200: { description: "Lista de paquetes" } }
      }
    },
    "/products": {
      get: {
        summary: "Lista catálogo de productos e inventario",
        tags: ["Productos"],
        responses: { 200: { description: "Inventario de productos" } }
      }
    },
    "/schedules/availability": {
      get: {
        summary: "Consulta disponibilidad de turnos para un barbero y fecha",
        tags: ["Horarios"],
        parameters: [
          { name: "id_barbero", in: "query", required: true, schema: { type: "integer" } },
          { name: "fecha", in: "query", required: true, schema: { type: "string", example: "2026-09-15" } }
        ],
        responses: { 200: { description: "Slots de tiempo con estado de disponibilidad" } }
      }
    },
    "/appointments": {
      get: {
        summary: "Lista citas con filtros",
        tags: ["Citas"],
        responses: { 200: { description: "Lista de citas" } }
      },
      post: {
        summary: "Agenda una nueva cita verificando conflictos",
        tags: ["Citas"],
        responses: { 201: { description: "Cita programada exitosamente" }, 409: { description: "Conflicto de horario" } }
      }
    },
    "/purchases": {
      get: {
        summary: "Lista compras a proveedores",
        tags: ["Compras"],
        responses: { 200: { description: "Historial de compras" } }
      },
      post: {
        summary: "Registra compra e incrementa stock",
        tags: ["Compras"],
        responses: { 201: { description: "Compra registrada" } }
      }
    },
    "/sales": {
      get: {
        summary: "Lista ventas registradas",
        tags: ["Ventas"],
        responses: { 200: { description: "Historial de ventas" } }
      },
      post: {
        summary: "Registra venta y descuenta stock atómicamente",
        tags: ["Ventas"],
        responses: { 201: { description: "Venta registrada" }, 409: { description: "Stock insuficiente" } }
      }
    },
    "/dashboard/admin": {
      get: {
        summary: "Obtiene métricas y KPIs del administrador",
        tags: ["Dashboard"],
        responses: { 200: { description: "Métricas del dashboard" } }
      }
    }
  }
};

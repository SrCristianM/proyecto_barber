# 💈 Tu Turno Barber - Enterprise Backend API

API RESTful profesional y escalable para el sistema de gestión de barbería **"Tu Turno Barber"**.
Desarrollado bajo principios de **Clean Architecture**, **SOLID**, separación de responsabilidades y transacciones ACID.

---

## 📋 Tabla de Contenidos
1. [Características Principales](#características-principales)
2. [Arquitectura de Software](#arquitectura-de-software)
3. [Estructura del Proyecto](#estructura-del-proyecto)
4. [Requisitos Previos](#requisitos-previos)
5. [Instalación y Configuración](#instalación-y-configuración)
6. [Base de Datos](#base-de-datos)
7. [Ejecución](#ejecución)
8. [Pruebas Automatizadas](#pruebas-automatizadas)
9. [Seguridad y Autenticación](#seguridad-y-autenticación)
10. [Catálogo de Endpoints](#catálogo-de-endpoints)
11. [Documentación Swagger UI](#documentación-swagger-ui)

---

## 🚀 Características Principales
- **Arquitectura en Capas**: `Controller` $\rightarrow$ `Service` $\rightarrow$ `Repository` $\rightarrow$ `Database Pool`.
- **Integridad Referencial y Base de Datos**: Mapeo exacto de las 23 tablas de `Data_Base/Database.sql`.
- **Transacciones ACID**:
  - Compras: inserción atómica de detalles e **incremento automático de stock**.
  - Ventas: validación de existencias, inserción atómica y **débito automático de stock** (soporte polimórfico `Producto`/`Servicio`).
  - Citas: prevención estricta de solapamientos (`uq_cita_barbero_fechahora`) y verificación de disponibilidad.
- **Autenticación y RBAC**:
  - JWT firmado con algoritmo HS256.
  - Hashing seguro de contraseñas con `bcryptjs` (10 rounds).
  - Control de acceso por roles (`Administrador: 1`, `Recepcionista: 2`, `Barbero: 3`, `Cliente: 4`) y matriz de permisos por módulo.
  - Bitácora de accesos y auditoría en tabla `bitacora_acceso`.
- **Resiliencia y Alta Disponibilidad**:
  - Conexión MySQL 8 con connection pooling (`mysql2/promise`).
  - Modo Fallback transparente con `MockDataStore` en memoria para pruebas y desarrollo continuo.
- **Carga Segura de Archivos**:
  - Subida de imágenes (avatares, productos, servicios) con filtrado MIME y nombres UUID.
  - Subida de documentos PDF para facturas y compras.
- **Documentación Swagger / OpenAPI 3.0**: Integrada en tiempo real en `/api/docs`.

---

## 🏗️ Arquitectura de Software

Cada módulo de dominio (`auth`, `users`, `roles`, `barbers`, `clients`, `services`, `packages`, `products`, `schedules`, `appointments`, `suppliers`, `purchases`, `sales`, `dashboard`, `uploads`) implementa responsabilidades aisladas:

- **Routes (`*.routes.js`)**: Enrutamiento, validadores de entrada y middlewares de autenticación/autorización.
- **Controller (`*.controller.js`)**: Manejo HTTP, extracción de parámetros/body y formateo de respuesta uniforme con `ApiResponse`.
- **Service (`*.service.js`)**: Reglas de negocio, orquestación, validaciones de dominio y transacciones.
- **Repository (`*.repository.js`)**: Acceso a datos, consultas SQL preparadas seguras contra inyección SQL y persistencia.
- **Validator (`*.validator.js`)**: Esquemas de validación estrictos con `express-validator`.

---

## 📁 Estructura del Proyecto

```text
Backend/
├── src/
│   ├── config/               # Configuraciones globales (BD, variables de entorno, constantes)
│   │   ├── env.js
│   │   ├── constants.js
│   │   ├── db.js
│   │   ├── mockStore.js
│   │   └── initDb.js
│   ├── controllers/          # Lógica de manejo de solicitudes (request/response)
│   │   ├── appointments.controller.js
│   │   ├── auth.controller.js
│   │   ├── barbers.controller.js
│   │   ├── clients.controller.js
│   │   ├── dashboard.controller.js
│   │   ├── packages.controller.js
│   │   ├── products.controller.js
│   │   ├── purchases.controller.js
│   │   ├── roles.controller.js
│   │   ├── sales.controller.js
│   │   ├── schedules.controller.js
│   │   ├── services.controller.js
│   │   ├── suppliers.controller.js
│   │   ├── uploads.controller.js
│   │   └── users.controller.js
│   ├── services/             # Lógica de negocio (reglas de negocio, validaciones)
│   │   ├── appointments.service.js
│   │   ├── auth.service.js
│   │   ├── barbers.service.js
│   │   ├── clients.service.js
│   │   ├── dashboard.service.js
│   │   ├── packages.service.js
│   │   ├── products.service.js
│   │   ├── purchases.service.js
│   │   ├── roles.service.js
│   │   ├── sales.service.js
│   │   ├── schedules.service.js
│   │   ├── services.service.js
│   │   ├── suppliers.service.js
│   │   └── users.service.js
│   ├── models/               # Definiciones de modelos de datos (esquemas de BD / repositorios)
│   │   ├── appointments.model.js
│   │   ├── auth.model.js
│   │   ├── barbers.model.js
│   │   ├── clients.model.js
│   │   ├── dashboard.model.js
│   │   ├── packages.model.js
│   │   ├── products.model.js
│   │   ├── purchases.model.js
│   │   ├── roles.model.js
│   │   ├── sales.model.js
│   │   ├── schedules.model.js
│   │   ├── services.model.js
│   │   ├── suppliers.model.js
│   │   └── users.model.js
│   ├── routes/               # Definición de rutas (endpoints y router centralizado)
│   │   ├── appointments.routes.js
│   │   ├── auth.routes.js
│   │   ├── barbers.routes.js
│   │   ├── clients.routes.js
│   │   ├── dashboard.routes.js
│   │   ├── index.routes.js
│   │   ├── packages.routes.js
│   │   ├── products.routes.js
│   │   ├── purchases.routes.js
│   │   ├── roles.routes.js
│   │   ├── sales.routes.js
│   │   ├── schedules.routes.js
│   │   ├── services.routes.js
│   │   ├── suppliers.routes.js
│   │   ├── uploads.routes.js
│   │   └── users.routes.js
│   ├── middlewares/          # Middlewares personalizados (autenticación, validación, RBAC, uploads)
│   │   ├── auth.middleware.js
│   │   ├── errorHandler.middleware.js
│   │   ├── rateLimiter.middleware.js
│   │   ├── rbac.middleware.js
│   │   ├── upload.middleware.js
│   │   └── validate.middleware.js
│   ├── utils/                # Utilidades y helpers (funciones reutilizables)
│   │   ├── apiResponse.js
│   │   ├── jwt.js
│   │   ├── logger.js
│   │   └── password.js
│   ├── errors/               # Manejo de errores personalizados (ApiError)
│   │   └── apiError.js
│   ├── validators/           # Validaciones de datos (express-validator)
│   │   ├── appointments.validator.js
│   │   ├── auth.validator.js
│   │   ├── barbers.validator.js
│   │   ├── clients.validator.js
│   │   ├── packages.validator.js
│   │   ├── products.validator.js
│   │   ├── purchases.validator.js
│   │   ├── roles.validator.js
│   │   ├── sales.validator.js
│   │   ├── schedules.validator.js
│   │   ├── services.validator.js
│   │   ├── suppliers.validator.js
│   │   └── users.validator.js
│   ├── docs/                 # Documentación OpenAPI / Swagger
│   │   └── swagger.js
│   ├── app.js                # Configuración de Express
│   └── server.js             # Punto de entrada del servidor
├── tests/                    # Pruebas unitarias y de integración (Jest + Supertest)
│   ├── auth.test.js
│   ├── appointments.test.js
│   ├── inventory_sales.test.js
│   └── endpoints.test.js
├── uploads/                  # Directorio de almacenamiento de archivos
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

---

## ⚙️ Requisitos Previos
- **Node.js**: Versión 18.x o superior (recomendado Node 20 o 24 LTS).
- **npm**: Versión 9.x o superior.
- **MySQL Server** (Opcional en desarrollo local gracias al MockStore de resiliencia).

---

## 🔧 Instalación y Configuración

1. Accede a la carpeta del backend:
   ```bash
   cd Backend
   ```

2. Instala las dependencias:
   ```bash
   npm install
   ```

3. Crea el archivo de variables de entorno a partir de la plantilla:
   ```bash
   cp .env.example .env
   ```

4. Ajusta las credenciales de tu base de datos en `.env`:
   ```env
   PORT=3001
   DB_HOST=localhost
   DB_PORT=3306
   DB_NAME=barberia_db
   DB_USER=root
   DB_PASSWORD=tu_password
   JWT_SECRET=tu_clave_secreta_jwt
   CORS_ORIGIN=http://localhost:5173,http://localhost:3000
   ```

---

## 🗄️ Base de Datos

Para inicializar la base de datos MySQL con el esquema oficial de `Data_Base/Database.sql`:
```bash
npm run db:init
```

---

## ▶️ Ejecución

### Modo Desarrollo (con recarga automática mediante Nodemon):
```bash
npm run dev
```

### Modo Producción:
```bash
npm start
```

El servidor iniciará en `http://localhost:3001`.

---

## 🧪 Pruebas Automatizadas

Ejecuta la suite de pruebas unitarias y de integración:
```bash
npm test
```

Incluye verificación de:
- Autenticación correcta e incorrecta.
- Generación de slots y validación de conflicto de citas duplicadas (409 Conflict).
- Transacciones de compras e incremento atómico de stock.
- Transacciones de ventas, débito de stock y rechazo por stock insuficiente (409 Conflict).

---

## 🛡️ Seguridad y Autenticación

### Formato de Respuestas Estandarizado

**Respuesta Exitosa (HTTP 200 / 201):**
```json
{
  "success": true,
  "message": "Operación exitosa",
  "data": { ... }
}
```

**Respuesta de Error (HTTP 400 / 401 / 403 / 404 / 409 / 500):**
```json
{
  "success": false,
  "message": "Descripción amigable del error",
  "error": "CODIGO_ERROR",
  "details": [ ... ]
}
```

### Cabecera de Autorización
Para endpoints protegidos, envía el token JWT en las cabeceras HTTP:
```text
Authorization: Bearer <token_jwt>
```

---

## 📡 Catálogo de Endpoints

### 🔐 Autenticación (`/api/auth`)
| Método | Endpoint | Descripción | Roles Permitidos |
|---|---|---|---|
| `POST` | `/api/auth/login` | Inicia sesión con correo y contraseña | Público |
| `POST` | `/api/auth/register` | Registra un nuevo cliente | Público |
| `GET` | `/api/auth/me` | Obtiene el perfil del usuario autenticado | Todos |
| `PUT` | `/api/auth/profile` | Actualiza datos del perfil | Todos |
| `PUT` | `/api/auth/change-password` | Cambia la contraseña actual | Todos |
| `POST` | `/api/auth/logout` | Cierra sesión y registra en bitácora | Todos |

### 👥 Usuarios (`/api/users`)
| Método | Endpoint | Descripción | Roles Permitidos |
|---|---|---|---|
| `GET` | `/api/users` | Lista usuarios con filtros (`search`, `status`, `role`) | Admin, Recepcionista |
| `GET` | `/api/users/:id` | Obtiene detalle de usuario | Admin, Recepcionista |
| `POST` | `/api/users` | Crea un usuario en el sistema | Admin |
| `PUT` | `/api/users/:id` | Actualiza un usuario | Admin |
| `PATCH`| `/api/users/:id/status` | Activa o desactiva un usuario | Admin |
| `DELETE`| `/api/users/:id` | Desactivación lógica de usuario | Admin |

### 🛡️ Roles y Permisos (`/api/roles`)
| Método | Endpoint | Descripción | Roles Permitidos |
|---|---|---|---|
| `GET` | `/api/roles` | Lista roles con recuento de usuarios | Admin |
| `GET` | `/api/roles/:id` | Detalle de rol con matriz de permisos | Admin |
| `POST` | `/api/roles` | Crea rol y asigna permisos atómicamente | Admin |
| `PUT` | `/api/roles/:id` | Actualiza rol y sus permisos | Admin |
| `PATCH`| `/api/roles/:id/status` | Activa o desactiva rol | Admin |
| `GET` | `/api/roles/modules/matrix`| Módulos y acciones para matriz UI | Admin |

### ✂️ Barberos (`/api/barbers`)
| Método | Endpoint | Descripción | Roles Permitidos |
|---|---|---|---|
| `GET` | `/api/barbers` | Lista barberos con datos de usuario | Todos / Público |
| `GET` | `/api/barbers/:id` | Detalle de barbero | Todos / Público |
| `POST` | `/api/barbers` | Crea cuenta de usuario y barbero | Admin |
| `PUT` | `/api/barbers/:id` | Actualiza barbero | Admin, Barbero |
| `PATCH`| `/api/barbers/:id/status` | Activa o desactiva barbero | Admin |

### 🧑 Clientes (`/api/clients`)
| Método | Endpoint | Descripción | Roles Permitidos |
|---|---|---|---|
| `GET` | `/api/clients/me` | Obtiene perfil del cliente en sesión | Cliente |
| `GET` | `/api/clients` | Lista clientes con filtros | Admin, Recepcionista, Barbero |
| `GET` | `/api/clients/:id` | Detalle de cliente | Admin, Recepcionista, Barbero |
| `POST` | `/api/clients` | Crea cliente (usuario + cliente) | Admin, Recepcionista |
| `PUT` | `/api/clients/:id` | Actualiza datos del cliente | Admin, Recepcionista |
| `PATCH`| `/api/clients/:id/status` | Activa o desactiva cliente | Admin |

### 💈 Servicios (`/api/services`)
| Método | Endpoint | Descripción | Roles Permitidos |
|---|---|---|---|
| `GET` | `/api/services` | Lista catálogo de servicios | Todos / Público |
| `GET` | `/api/services/:id` | Detalle de servicio | Todos / Público |
| `POST` | `/api/services` | Crea nuevo servicio | Admin |
| `PUT` | `/api/services/:id` | Actualiza servicio | Admin |
| `PATCH`| `/api/services/:id/status` | Activa o desactiva servicio | Admin |
| `GET` | `/api/services/categories` | Lista categorías de servicios | Todos / Público |
| `POST` | `/api/services/categories` | Crea categoría de servicio | Admin |

### 🎁 Paquetes Promocionales (`/api/packages`)
| Método | Endpoint | Descripción | Roles Permitidos |
|---|---|---|---|
| `GET` | `/api/packages` | Lista paquetes con servicios incluidos | Todos / Público |
| `GET` | `/api/packages/:id` | Detalle de paquete | Todos / Público |
| `POST` | `/api/packages` | Crea paquete y asocia servicios | Admin |
| `PUT` | `/api/packages/:id` | Actualiza paquete y servicios | Admin |
| `PATCH`| `/api/packages/:id/status` | Activa o desactiva paquete | Admin |

### 🧴 Productos e Inventario (`/api/products`)
| Método | Endpoint | Descripción | Roles Permitidos |
|---|---|---|---|
| `GET` | `/api/products` | Catálogo de productos y stock | Todos / Público |
| `GET` | `/api/products/:id` | Detalle de producto | Todos / Público |
| `POST` | `/api/products` | Crea producto | Admin, Recepcionista |
| `PUT` | `/api/products/:id` | Actualiza producto | Admin, Recepcionista |
| `PATCH`| `/api/products/:id/status` | Activa o desactiva producto | Admin |
| `GET` | `/api/products/categories` | Lista categorías de productos | Todos / Público |
| `POST` | `/api/products/categories` | Crea categoría de producto | Admin |

### 🕒 Horarios y Disponibilidad (`/api/schedules`)
| Método | Endpoint | Descripción | Roles Permitidos |
|---|---|---|---|
| `GET` | `/api/schedules/availability` | Calcula slots libres para un barbero y fecha | Todos / Público |
| `GET` | `/api/schedules` | Lista horarios de atención | Todos / Público |
| `POST` | `/api/schedules` | Registra horarios semanales para un barbero | Admin |
| `PUT` | `/api/schedules/:id` | Actualiza horario específico | Admin |
| `DELETE`| `/api/schedules/:id` | Elimina horario | Admin |
| `GET` | `/api/schedules/novelties` | Lista novedades (ausencias, permisos) | Admin, Recepcionista, Barbero |
| `POST` | `/api/schedules/novelties` | Registra novedad de horario | Admin, Barbero |
| `PATCH`| `/api/schedules/novelties/:id/status` | Aprueba o rechaza novedad | Admin |

### 📅 Citas (`/api/appointments`)
| Método | Endpoint | Descripción | Roles Permitidos |
|---|---|---|---|
| `GET` | `/api/appointments` | Lista citas con filtros | Admin, Recepcionista, Barbero, Cliente |
| `GET` | `/api/appointments/:id` | Detalle de cita con cliente y servicios | Admin, Recepcionista, Barbero, Cliente |
| `POST` | `/api/appointments` | Agenda cita validando conflictos de horario | Admin, Recepcionista, Barbero, Cliente |
| `PUT` | `/api/appointments/:id` | Reprograma cita con validación | Admin, Recepcionista, Barbero |
| `PATCH`| `/api/appointments/:id/status` | Cambia estado de la cita | Admin, Recepcionista, Barbero, Cliente |
| `DELETE`| `/api/appointments/:id` | Cancela cita | Admin, Recepcionista, Cliente |

### 🚚 Proveedores (`/api/suppliers`)
| Método | Endpoint | Descripción | Roles Permitidos |
|---|---|---|---|
| `GET` | `/api/suppliers` | Lista proveedores comerciales | Admin, Recepcionista |
| `GET` | `/api/suppliers/:id` | Detalle de proveedor | Admin, Recepcionista |
| `POST` | `/api/suppliers` | Registra proveedor con NIT único | Admin |
| `PUT` | `/api/suppliers/:id` | Actualiza proveedor | Admin |
| `PATCH`| `/api/suppliers/:id/status` | Activa o desactiva proveedor | Admin |

### 🛒 Compras (`/api/purchases`)
| Método | Endpoint | Descripción | Roles Permitidos |
|---|---|---|---|
| `GET` | `/api/purchases` | Lista compras históricas | Admin, Recepcionista |
| `GET` | `/api/purchases/:id` | Detalle de compra con renglones | Admin, Recepcionista |
| `POST` | `/api/purchases` | Registra compra e incrementa stock | Admin, Recepcionista |
| `PATCH`| `/api/purchases/:id/anular` | Anula compra y reduce stock | Admin |

### 🧾 Ventas (`/api/sales`)
| Método | Endpoint | Descripción | Roles Permitidos |
|---|---|---|---|
| `GET` | `/api/sales` | Lista ventas históricas | Admin, Recepcionista, Cliente |
| `GET` | `/api/sales/:id` | Detalle de venta con productos y servicios | Admin, Recepcionista, Cliente |
| `POST` | `/api/sales` | Registra venta y descuenta stock atómicamente | Admin, Recepcionista |
| `PATCH`| `/api/sales/:id/anular` | Anula venta y restaura stock | Admin |

### 📊 Dashboard (`/api/dashboard`)
| Método | Endpoint | Descripción | Roles Permitidos |
|---|---|---|---|
| `GET` | `/api/dashboard/admin` | KPIs y métricas clave del negocio | Admin, Recepcionista |
| `GET` | `/api/dashboard/barber` | Métricas y ganancias del barbero en sesión | Admin, Barbero |

### 📁 Uploads (`/api/uploads`)
| Método | Endpoint | Descripción | Roles Permitidos |
|---|---|---|---|
| `POST` | `/api/uploads/barbers` | Sube avatar para barbero | Admin, Barbero |
| `POST` | `/api/uploads/products` | Sube foto de producto | Admin, Recepcionista |
| `POST` | `/api/uploads/services` | Sube imagen de servicio | Admin |
| `POST` | `/api/uploads/documents` | Sube soporte PDF de factura o compra | Admin, Recepcionista |

---

## 📚 Documentación Swagger UI
Con el servidor en ejecución, ingresa desde cualquier navegador a:
👉 `http://localhost:3001/api/docs`

Podrás probar interactivamente todas las rutas, autenticarte con el botón **Authorize** y ver ejemplos de solicitud y respuesta.

# 💈 Tu Turno Barber — Guía Completa de la Suite CRUD en Postman

Bienvenido a la suite oficial de pruebas **CRUD para Postman** del proyecto **Tu Turno Barber** ([https://proyecto-barber-three.vercel.app/](https://proyecto-barber-three.vercel.app/)).

Esta colección incluye **15 módulos formativos** y **96 peticiones HTTP** listas para importar y ejecutar, cubriendo el ciclo de vida completo de cada entidad (creación, consulta, modificación, cambio de estado y eliminación) con **tests automáticos** y **encadenamiento dinámico de tokens e IDs**.

---

## 📁 Archivos Disponibles en el Repositorio

Los archivos de la suite se encuentran organizados en la carpeta [`postman/`](file:///c:/Users/crist/OneDrive/Escritorio/proyecto_barber/postman/):

1. **[`postman/Tu_Turno_Barber_API.postman_collection.json`](file:///c:/Users/crist/OneDrive/Escritorio/proyecto_barber/postman/Tu_Turno_Barber_API.postman_collection.json)**
   - Colección oficial en formato estándar **Postman v2.1.0**.
   - 15 carpetas organizadas por módulos formativos.
   - Herencia de autenticación `Bearer {{token}}` a nivel de colección.
   - Scripts de prueba para verificar códigos de estado HTTP (`200 OK`, `201 Created`), tiempo de respuesta y guardado dinámico de identificadores.

2. **[`postman/Tu_Turno_Barber_Environment.postman_environment.json`](file:///c:/Users/crist/OneDrive/Escritorio/proyecto_barber/postman/Tu_Turno_Barber_Environment.postman_environment.json)**
   - Entorno con variables configuradas:
     - `baseUrl`: `http://localhost:3001/api` (Backend local de Tu Turno Barber).
     - `vercelUrl`: `https://proyecto-barber-three.vercel.app` (Frontend desplegado en producción).
     - `token`: Almacena el JWT devuelto por el login.
     - Variables de IDs (`usuario_id`, `rol_id`, `cliente_id`, `barbero_id`, `servicio_id`, etc.) para encadenamiento automático de operaciones.

---

## 🚀 Paso 1: Importar en Postman

1. Abre **Postman**.
2. En la esquina superior izquierda, haz clic en el botón **Import**.
3. Arrastra o selecciona los dos archivos:
   - `Tu_Turno_Barber_API.postman_collection.json`
   - `Tu_Turno_Barber_Environment.postman_environment.json`
4. Confirma la importación. Verás la colección **"Tu Turno Barber - Módulos Formativos CRUD API"** en la barra lateral izquierda.
5. En la esquina superior derecha de Postman, en el selector de entornos, selecciona:
   **`Tu Turno Barber - Local & Cloud Environment`**.

---

## ⚡ Paso 2: Iniciar el Servidor Backend

Antes de ejecutar las peticiones en Postman, asegúrate de que el backend esté en ejecución:

```powershell
# Opción A: Iniciar únicamente el backend (Puerto 3001)
npm run dev:backend

# Opción B: Iniciar backend (3001) + frontend (5173) simultáneamente
npm run dev
```

El backend responderá en: `http://localhost:3001/api`.  
Puedes abrir la documentación interactiva en el navegador en: `http://localhost:3001/api/docs`.

---

## 🔑 Credenciales de Acceso

La colección incluye las credenciales reales de prueba configuradas en la base de datos:

| Rol | Correo Electrónico | Contraseña | Permisos |
|-----|--------------------|------------|----------|
| **Administrador** | `cristianmazo957@gmail.com` | `Admin123*` | Control total del sistema, roles, auditoría, compras y finanzas. |
| **Recepcionista** | `maria@example.com` | `Recepcionista123*` | Agenda de citas, clientes, catálogo de servicios y ventas. |
| **Barbero** | `barbero@tuturnobarber.com` | `Barbero123*` | Consulta de citas asignadas, disponibilidad de horario y novedades. |

---

## 🔄 Flujo de Trabajo y Encadenamiento Dinámico

La colección fue diseñada para ser ejecutada de manera interactiva o totalmente automatizada con el **Collection Runner**:

### 1. Autenticación Automática
Al ejecutar la petición:  
`00. Autenticación & Perfil` -> `02. Login Administrador (Cristian Mazo)`  
El script de prueba de Postman extrae automáticamente el JWT y lo guarda en la variable `{{token}}`. Todas las peticiones posteriores dentro de la colección heredan este token automáticamente sin necesidad de copiar y pegar cabeceras.

### 2. Encadenamiento de IDs
Cuando ejecutas una petición de creación (POST):
- `Crear Usuario` guarda el nuevo ID en `{{usuario_id}}`.
- `Crear Rol` guarda el nuevo ID en `{{rol_id}}`.
- `Crear Cliente` guarda el nuevo ID en `{{cliente_id}}`.
- `Crear Barbero` guarda el nuevo ID en `{{barbero_id}}`.
- `Crear Servicio` guarda el nuevo ID en `{{servicio_id}}`.
- `Crear Paquete` guarda el nuevo ID en `{{paquete_id}}`.
- `Crear Producto` guarda el nuevo ID en `{{producto_id}}`.
- `Crear Horario` guarda el nuevo ID en `{{horario_id}}`.
- `Crear Cita` guarda el nuevo ID en `{{cita_id}}`.
- `Crear Proveedor` guarda el nuevo ID en `{{proveedor_id}}`.
- `Registrar Compra` guarda el nuevo ID en `{{compra_id}}`.
- `Registrar Venta` guarda el nuevo ID en `{{venta_id}}`.

Las peticiones subsiguientes de **Consultar por ID (GET)**, **Actualizar (PUT)**, **Cambiar Estado (PATCH)** y **Eliminar (DELETE)** consumen directamente estas variables.

---

## 📋 Resumen de Módulos Formativos y Endpoints

### 00. Autenticación & Perfil
- `GET  /api/health` — Diagnóstico y healthcheck del servidor.
- `POST /api/auth/login` — Inicio de sesión (Admin, Recepcionista, Barbero).
- `POST /api/auth/register` — Registro público de cliente.
- `GET  /api/auth/me` — Información de la sesión activa vía token JWT.
- `PUT  /api/auth/profile` — Actualización de datos del perfil.
- `PUT  /api/auth/change-password` — Actualización de contraseña.
- `POST /api/auth/logout` — Cierre ordenado de sesión.

### 01. Módulo Usuarios
- `GET    /api/users` — Listar todos con filtros por rol, estado y búsqueda.
- `POST   /api/users` — Crear usuario con rol asignado.
- `GET    /api/users/:id` — Detalle del usuario.
- `PUT    /api/users/:id` — Actualizar usuario.
- `PATCH  /api/users/:id/status` — Alternar estado activo / inactivo.
- `DELETE /api/users/:id` — Eliminar usuario.

### 02. Módulo Roles y Permisos
- `GET    /api/roles` — Listar roles del sistema.
- `GET    /api/roles/modules/matrix` — Matriz completa de módulos y permisos.
- `POST   /api/roles` — Crear rol personalizado con permisos.
- `GET    /api/roles/:id` — Detalle del rol.
- `PUT    /api/roles/:id` — Modificar nombre y descripción.
- `PUT    /api/roles/:id/permissions` — Asignar matriz de permisos al rol.
- `PATCH  /api/roles/:id/status` — Habilitar o deshabilitar rol.
- `DELETE /api/roles/:id` — Eliminar rol.

### 03. Módulo Clientes
- `GET    /api/clients` — Catálogo general de clientes con filtro de fidelidad.
- `POST   /api/clients` — Registrar cliente con nivel de fidelidad (Bronce, Plata, Oro).
- `GET    /api/clients/:id` — Perfil del cliente.
- `PUT    /api/clients/:id` — Actualizar datos de contacto y fidelización.
- `PATCH  /api/clients/:id/status` — Alternar estado activo / inactivo.
- `DELETE /api/clients/:id` — Eliminar cliente.

### 04. Módulo Barberos
- `GET    /api/barbers` — Listar barberos con especialidades y fotos.
- `POST   /api/barbers` — Crear barbero profesional y cuenta de usuario.
- `GET    /api/barbers/:id` — Detalle del barbero.
- `PUT    /api/barbers/:id` — Actualizar especialidades y contacto.
- `PATCH  /api/barbers/:id/status` — Habilitar o pausar disponibilidad.
- `DELETE /api/barbers/:id` — Eliminar barbero.

### 05. Módulo Servicios & Categorías
- `GET    /api/services` — Catálogo de cortes, barba y tratamientos.
- `GET    /api/services/categories` — Listar categorías de servicios.
- `POST   /api/services/categories` — Crear nueva categoría.
- `POST   /api/services` — Crear nuevo servicio con precio y duración.
- `GET    /api/services/:id` — Detalle de servicio.
- `PUT    /api/services/:id` — Modificar precio, duración o nombre.
- `PATCH  /api/services/:id/status` — Cambiar estado del servicio.
- `DELETE /api/services/:id` — Eliminar servicio.

### 06. Módulo Paquetes Promocionales
- `GET    /api/packages` — Listar paquetes y combos promocionales.
- `POST   /api/packages` — Crear combo con porcentaje de descuento y servicios.
- `GET    /api/packages/:id` — Detalle del paquete con servicios incluidos.
- `PUT    /api/packages/:id` — Modificar descuento o servicios del combo.
- `PATCH  /api/packages/:id/status` — Cambiar visibilidad del paquete.
- `DELETE /api/packages/:id` — Eliminar paquete.

### 07. Módulo Productos e Inventario
- `GET    /api/products` — Inventario general con stock y precios.
- `GET    /api/products/categories` — Listar categorías de productos.
- `POST   /api/products/categories` — Crear categoría en inventario.
- `POST   /api/products` — Crear producto con stock inicial.
- `GET    /api/products/:id` — Detalle del producto.
- `PUT    /api/products/:id` — Actualizar existencias o precio.
- `PATCH  /api/products/:id/status` — Alternar estado en catálogo.
- `DELETE /api/products/:id` — Eliminar producto.

### 08. Módulo Horarios & Novedades
- `GET    /api/schedules` — Jornadas y turnos semanales de los barberos.
- `GET    /api/schedules/availability` — Consulta de disponibilidad de slots en tiempo real.
- `POST   /api/schedules` — Configurar jornada laboral semanal.
- `GET    /api/schedules/:id` — Detalle de horario.
- `PUT    /api/schedules/:id` — Ajustar hora de inicio y fin.
- `GET    /api/schedules/novelties` — Listar novedades laborales (permisos, ausencias).
- `POST   /api/schedules/novelties` — Registrar novedad de horario.
- `PATCH  /api/schedules/novelties/:id/status` — Aprobar o rechazar novedad.
- `DELETE /api/schedules/:id` — Eliminar horario.

### 09. Módulo Citas & Reservas
- `GET    /api/appointments` — Listado de citas con filtros por barbero, estado y fecha.
- `POST   /api/appointments` — Agendar cita con validación anti-colisión de turnos.
- `GET    /api/appointments/:id` — Detalle de la cita y servicios agendados.
- `PUT    /api/appointments/:id` — Modificar hora o barbero.
- `PATCH  /api/appointments/:id/status` — Cambiar estado (Confirmada, Completada).
- `PATCH  /api/appointments/:id/cancel` — Cancelar cita y liberar turno.
- `DELETE /api/appointments/:id` — Eliminar cita.

### 10. Módulo Proveedores
- `GET    /api/suppliers` — Directorio de distribuidores mayoristas.
- `POST   /api/suppliers` — Registrar proveedor con NIT y contacto.
- `GET    /api/suppliers/:id` — Detalle del proveedor.
- `PUT    /api/suppliers/:id` — Modificar datos comerciales.
- `PATCH  /api/suppliers/:id/status` — Cambiar estado del proveedor.
- `DELETE /api/suppliers/:id` — Eliminar proveedor.

### 11. Módulo Compras & Insumos
- `GET    /api/purchases` — Historial de facturas de compras e insumos.
- `POST   /api/purchases` — Registrar compra incrementando el stock atómicamente.
- `GET    /api/purchases/:id` — Detalle de la compra con renglones.
- `PATCH  /api/purchases/:id/anular` — Anular compra con descuento de inventario.
- `DELETE /api/purchases/:id` — Eliminar registro de compra.

### 12. Módulo Ventas & Facturación
- `GET    /api/sales` — Histórico de facturación comercial.
- `POST   /api/sales` — Registrar venta (servicios y productos con deducción de stock).
- `GET    /api/sales/:id` — Detalle de factura de venta.
- `PATCH  /api/sales/:id/anular` — Anular venta con restitución inmediata de inventario.
- `DELETE /api/sales/:id` — Eliminar venta.

### 13. Módulo Dashboard & Métricas
- `GET    /api/dashboard` — Resumen general de KPIs y actividad reciente.
- `GET    /api/dashboard/admin` — Estadísticas de ingresos, citas y balance de caja.
- `GET    /api/dashboard/barber` — Métricas de rendimiento individuales para el barbero.

### 14. Módulo Subida de Archivos (Uploads)
- `POST   /api/uploads/barbers` — Subida de fotografía de barbero (`multipart/form-data`).
- `POST   /api/uploads/services` — Subida de imagen de servicio.
- `POST   /api/uploads/products` — Subida de imagen de producto.
- `POST   /api/uploads/documents` — Subida de factura o contrato en PDF.

---

## 🏃 Cómo Ejecutar las Pruebas con Collection Runner

1. En Postman, haz clic derecho sobre la colección **"Tu Turno Barber - Módulos Formativos CRUD API"** y selecciona **Run collection**.
2. Asegúrate de que el entorno **"Tu Turno Barber - Local & Cloud Environment"** esté seleccionado.
3. Puedes seleccionar todas las carpetas o probar un módulo específico.
4. Haz clic en **Run Tu Turno Barber - Módulos Formativos CRUD API**.
5. Observa en tiempo real cómo se ejecutan las 96 peticiones y pasan el 100% de las pruebas automatizadas.

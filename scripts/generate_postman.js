import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const postmanDir = path.resolve(rootDir, "postman");

if (!fs.existsSync(postmanDir)) {
  fs.mkdirSync(postmanDir, { recursive: true });
}

// Helper para crear peticiones en formato Postman v2.1.0
function makeRequest({
  name,
  method,
  pathSegments,
  queryParams = [],
  body = null,
  noAuth = false,
  testScript = "",
  description = ""
}) {
  const urlObj = {
    raw: `{{baseUrl}}/${pathSegments.join("/")}${
      queryParams.length > 0
        ? "?" + queryParams.map((q) => `${q.key}=${encodeURIComponent(q.value)}`).join("&")
        : ""
    }`,
    host: ["{{baseUrl}}"],
    path: pathSegments.map((s) => (s.startsWith(":") ? s : s))
  };

  if (queryParams.length > 0) {
    urlObj.query = queryParams.map((q) => ({
      key: q.key,
      value: q.value,
      description: q.description || ""
    }));
  }

  // Identificar variables de ruta (ej: :id)
  const pathVars = pathSegments.filter((s) => s.startsWith(":"));
  if (pathVars.length > 0) {
    urlObj.variable = pathVars.map((v) => {
      const varKey = v.replace(":", "");
      return {
        key: varKey,
        value: `{{${varKey}}}`,
        description: `Identificador dinámico de ${varKey}`
      };
    });
  }

  const req = {
    method,
    header: [
      {
        key: "Content-Type",
        value: "application/json",
        type: "text"
      }
    ],
    url: urlObj,
    description: description || `${method} a /${pathSegments.join("/")}`
  };

  if (body) {
    req.body = {
      mode: "raw",
      raw: JSON.stringify(body, null, 2),
      options: {
        raw: {
          language: "json"
        }
      }
    };
  }

  if (noAuth) {
    req.auth = {
      type: "noauth"
    };
  }

  const itemObj = {
    name,
    request: req,
    response: []
  };

  if (testScript) {
    itemObj.event = [
      {
        listen: "test",
        script: {
          type: "text/javascript",
          exec: testScript.split("\n")
        }
      }
    ];
  }

  return itemObj;
}

// =========================================================================
// SCRIPTS DE PRUEBA REUTILIZABLES PARA POSTMAN
// =========================================================================
const basicSuccessTest = `pm.test("Status code is 200 OK", function () {
    pm.response.to.have.status(200);
});
pm.test("Estructura de respuesta exitosa", function () {
    const json = pm.response.json();
    pm.expect(json.success).to.be.true;
});
pm.test("Tiempo de respuesta menor a 1500ms", function () {
    pm.expect(pm.response.responseTime).to.be.below(1500);
});`;

const createdSuccessTest = (idVariable, idField) => `pm.test("Status code is 201 Created o 200 OK", function () {
    pm.expect(pm.response.code).to.be.oneOf([200, 201]);
});
pm.test("Registro creado con éxito", function () {
    const json = pm.response.json();
    pm.expect(json.success).to.be.true;
    const id = json.data?.${idField} || json.data?.id;
    if (id) {
        pm.environment.set("${idVariable}", id);
        pm.collectionVariables.set("${idVariable}", id);
        console.log("ID guardado en variable [${idVariable}]: " + id);
    }
});`;

const updatedSuccessTest = `pm.test("Status code is 200 OK", function () {
    pm.response.to.have.status(200);
});
pm.test("Registro actualizado correctamente", function () {
    const json = pm.response.json();
    pm.expect(json.success).to.be.true;
});`;

const deleteSuccessTest = `pm.test("Status code is 200 OK o 204 No Content", function () {
    pm.expect(pm.response.code).to.be.oneOf([200, 204]);
});
pm.test("Operación de eliminación exitosa", function () {
    if (pm.response.code === 200) {
        const json = pm.response.json();
        pm.expect(json.success).to.be.true;
    }
});`;

const loginSuccessTest = `pm.test("Status code is 200 OK", function () {
    pm.response.to.have.status(200);
});
pm.test("Autenticación exitosa y JWT generado", function () {
    const json = pm.response.json();
    pm.expect(json.success).to.be.true;
    pm.expect(json.data).to.have.property("token");
    pm.environment.set("token", json.data.token);
    pm.collectionVariables.set("token", json.data.token);
    console.log("Token JWT actualizado en {{token}}");
});`;

// =========================================================================
// DEFINICIÓN DE TODOS LOS MÓDULOS FORMATIVOS
// =========================================================================

const folder00_Auth = {
  name: "00. Autenticación & Perfil",
  description: "Módulo de gestión de credenciales, tokens JWT y perfil de usuario activo.",
  item: [
    makeRequest({
      name: "01. Health Check del Backend",
      method: "GET",
      pathSegments: ["health"],
      noAuth: true,
      testScript: `pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});
pm.test("Servidor saludable", function () {
    const json = pm.response.json();
    pm.expect(json.status).to.eql("healthy");
});`,
      description: "Verifica el estado operativo del backend de Tu Turno Barber."
    }),
    makeRequest({
      name: "02. Login Administrador (Cristian Mazo)",
      method: "POST",
      pathSegments: ["auth", "login"],
      body: {
        correo: "cristianmazo957@gmail.com",
        contrasena: "Admin123*"
      },
      noAuth: true,
      testScript: loginSuccessTest,
      description: "Inicia sesión con credenciales de Administrador. Guarda automáticamente el token JWT en {{token}}."
    }),
    makeRequest({
      name: "03. Login Recepcionista (María García)",
      method: "POST",
      pathSegments: ["auth", "login"],
      body: {
        correo: "maria@example.com",
        contrasena: "Recepcionista123*"
      },
      noAuth: true,
      testScript: loginSuccessTest,
      description: "Inicia sesión como Recepcionista para verificar control de acceso basado en roles (RBAC)."
    }),
    makeRequest({
      name: "04. Login Barbero (Carlos Rodríguez)",
      method: "POST",
      pathSegments: ["auth", "login"],
      body: {
        correo: "barbero@tuturnobarber.com",
        contrasena: "Barbero123*"
      },
      noAuth: true,
      testScript: loginSuccessTest,
      description: "Inicia sesión como Barbero para acceder a citas y horarios propios."
    }),
    makeRequest({
      name: "05. Registro de Nuevo Cliente",
      method: "POST",
      pathSegments: ["auth", "register"],
      body: {
        nombre: "Alejandro",
        apellido: "Montoya",
        correo: "alejandro.cliente@example.com",
        contrasena: "Cliente123*",
        telefono: "3001234567"
      },
      noAuth: true,
      testScript: `pm.test("Status code is 201 Created", function () {
    pm.response.to.have.status(201);
});
pm.test("Registro de cliente exitoso", function () {
    const json = pm.response.json();
    pm.expect(json.success).to.be.true;
});`,
      description: "Permite a un nuevo cliente registrarse desde el portal web o móvil."
    }),
    makeRequest({
      name: "06. Obtener Perfil del Usuario Actual",
      method: "GET",
      pathSegments: ["auth", "me"],
      testScript: basicSuccessTest,
      description: "Retorna información detallada del usuario autenticado vía JWT."
    }),
    makeRequest({
      name: "07. Actualizar Perfil de Usuario",
      method: "PUT",
      pathSegments: ["auth", "profile"],
      body: {
        nombre: "Cristian",
        apellido: "Mazo",
        telefono: "+57 300 987 6543"
      },
      testScript: updatedSuccessTest,
      description: "Permite al usuario logueado actualizar sus nombres y teléfono de contacto."
    }),
    makeRequest({
      name: "08. Cambiar Contraseña",
      method: "PUT",
      pathSegments: ["auth", "change-password"],
      body: {
        actualContrasena: "Admin123*",
        nuevaContrasena: "Admin123*"
      },
      testScript: updatedSuccessTest,
      description: "Permite renovar la contraseña con validación de contraseña actual."
    }),
    makeRequest({
      name: "09. Cerrar Sesión (Logout)",
      method: "POST",
      pathSegments: ["auth", "logout"],
      testScript: `pm.test("Status code is 200 OK", function () {
    pm.response.to.have.status(200);
});
pm.test("Sesión cerrada exitosamente", function () {
    const json = pm.response.json();
    pm.expect(json.success).to.be.true;
});`,
      description: "Registra la salida del usuario en la bitácora de auditoría."
    })
  ]
};

const folder01_Users = {
  name: "01. Módulo Usuarios",
  description: "CRUD de Usuarios del sistema (Administradores, Recepcionistas, Barberos y Clientes).",
  item: [
    makeRequest({
      name: "01. Listar Usuarios",
      method: "GET",
      pathSegments: ["users"],
      queryParams: [
        { key: "search", value: "", description: "Buscar por nombre, apellido o correo" },
        { key: "role", value: "all", description: "Filtrar por rol: 1, 2, 3, 4 o all" },
        { key: "status", value: "all", description: "1 activo, 0 inactivo, all" }
      ],
      testScript: basicSuccessTest,
      description: "Lista todos los usuarios registrados con soporte de búsqueda y filtros."
    }),
    makeRequest({
      name: "02. Crear Usuario",
      method: "POST",
      pathSegments: ["users"],
      body: {
        nombre: "Julián",
        apellido: "Valencia",
        correo: "julian.valencia@example.com",
        contrasena: "Password123*",
        id_rol: 2,
        telefono: "3129876543",
        estado: 1
      },
      testScript: createdSuccessTest("usuario_id", "id_usuario"),
      description: "Crea un nuevo usuario en el sistema y almacena su ID en {{usuario_id}}."
    }),
    makeRequest({
      name: "03. Obtener Usuario por ID",
      method: "GET",
      pathSegments: ["users", ":id"],
      testScript: basicSuccessTest,
      description: "Consulta los detalles de un usuario usando {{usuario_id}}."
    }),
    makeRequest({
      name: "04. Actualizar Usuario",
      method: "PUT",
      pathSegments: ["users", ":id"],
      body: {
        nombre: "Julián Andrés",
        apellido: "Valencia Gómez",
        telefono: "3129876599",
        id_rol: 2
      },
      testScript: updatedSuccessTest,
      description: "Actualiza los datos del usuario especificado en {{usuario_id}}."
    }),
    makeRequest({
      name: "05. Cambiar Estado de Usuario (Activar/Inactivar)",
      method: "PATCH",
      pathSegments: ["users", ":id", "status"],
      body: {
        estado: 0
      },
      testScript: updatedSuccessTest,
      description: "Alterna o establece el estado activo/inactivo del usuario."
    }),
    makeRequest({
      name: "06. Eliminar Usuario",
      method: "DELETE",
      pathSegments: ["users", ":id"],
      testScript: deleteSuccessTest,
      description: "Elimina de forma lógica o física el usuario de prueba con ID {{usuario_id}}."
    })
  ]
};

const folder02_Roles = {
  name: "02. Módulo Roles y Permisos",
  description: "Gestión de roles institucionales y permisos de control de acceso (RBAC).",
  item: [
    makeRequest({
      name: "01. Listar Roles",
      method: "GET",
      pathSegments: ["roles"],
      testScript: basicSuccessTest,
      description: "Consulta el catálogo de roles configurados en la barbería."
    }),
    makeRequest({
      name: "02. Matriz de Módulos y Permisos del Sistema",
      method: "GET",
      pathSegments: ["roles", "modules", "matrix"],
      testScript: basicSuccessTest,
      description: "Devuelve todos los módulos del sistema con sus respectivas matrices de permisos para asignación."
    }),
    makeRequest({
      name: "03. Crear Rol Personalizado",
      method: "POST",
      pathSegments: ["roles"],
      body: {
        nombre_rol: "Auditor Interno",
        descripcion: "Supervisión de finanzas, compras y reportes",
        permisos: [1, 5, 9, 10]
      },
      testScript: createdSuccessTest("rol_id", "id_rol"),
      description: "Crea un nuevo rol con permisos y almacena su ID en {{rol_id}}."
    }),
    makeRequest({
      name: "04. Obtener Rol por ID",
      method: "GET",
      pathSegments: ["roles", ":id"],
      testScript: basicSuccessTest,
      description: "Obtiene el detalle de un rol y sus permisos asignados."
    }),
    makeRequest({
      name: "05. Actualizar Rol",
      method: "PUT",
      pathSegments: ["roles", ":id"],
      body: {
        nombre_rol: "Auditor Líder",
        descripcion: "Supervisión y control integral de la barbería",
        permisos: [1, 2, 5, 9, 10]
      },
      testScript: updatedSuccessTest,
      description: "Actualiza el nombre, descripción y matriz de permisos del rol."
    }),
    makeRequest({
      name: "06. Asignar Permisos a Rol",
      method: "PUT",
      pathSegments: ["roles", ":id", "permissions"],
      body: {
        permisos: [1, 2, 3, 5, 6, 9, 10]
      },
      testScript: updatedSuccessTest,
      description: "Actualiza los permisos asignados al rol con ID {{rol_id}}."
    }),
    makeRequest({
      name: "07. Cambiar Estado del Rol",
      method: "PATCH",
      pathSegments: ["roles", ":id", "status"],
      testScript: updatedSuccessTest,
      description: "Alterna el estado del rol (habilitado / deshabilitado)."
    }),
    makeRequest({
      name: "08. Eliminar Rol",
      method: "DELETE",
      pathSegments: ["roles", ":id"],
      testScript: deleteSuccessTest,
      description: "Elimina el rol creado en las pruebas {{rol_id}}."
    })
  ]
};

const folder03_Clients = {
  name: "03. Módulo Clientes",
  description: "CRUD integral de clientes de la barbería con fidelización.",
  item: [
    makeRequest({
      name: "01. Listar Clientes",
      method: "GET",
      pathSegments: ["clients"],
      queryParams: [
        { key: "search", value: "", description: "Filtro por nombre, teléfono o correo" },
        { key: "status", value: "all", description: "1 activo, 0 inactivo, all" },
        { key: "loyalty", value: "all", description: "Nuevo, Bronce, Plata, Oro o all" }
      ],
      testScript: basicSuccessTest,
      description: "Obtiene el listado general de clientes registrados."
    }),
    makeRequest({
      name: "02. Crear Cliente",
      method: "POST",
      pathSegments: ["clients"],
      body: {
        nombre: "Mateo",
        apellido: "Henao",
        correo: "mateo.henao.test@example.com",
        telefono: "3017778899",
        direccion: "Circular 4ta # 70-15",
        nivel_fidelidad: "Bronce",
        contrasena: "Cliente123*"
      },
      testScript: createdSuccessTest("cliente_id", "id_cliente"),
      description: "Registra un nuevo cliente con nivel de fidelidad y almacena {{cliente_id}}."
    }),
    makeRequest({
      name: "03. Obtener Cliente por ID",
      method: "GET",
      pathSegments: ["clients", ":id"],
      testScript: basicSuccessTest,
      description: "Consulta el perfil del cliente por {{cliente_id}}."
    }),
    makeRequest({
      name: "04. Actualizar Cliente",
      method: "PUT",
      pathSegments: ["clients", ":id"],
      body: {
        nombre: "Mateo",
        apellido: "Henao Gómez",
        telefono: "3017778800",
        direccion: "Circular 4ta # 70-20, Medellín",
        nivel_fidelidad: "Plata"
      },
      testScript: updatedSuccessTest,
      description: "Actualiza los datos del cliente y su nivel de fidelidad."
    }),
    makeRequest({
      name: "05. Cambiar Estado del Cliente",
      method: "PATCH",
      pathSegments: ["clients", ":id", "status"],
      testScript: updatedSuccessTest,
      description: "Alterna el estado activo/inactivo del cliente."
    }),
    makeRequest({
      name: "06. Eliminar Cliente",
      method: "DELETE",
      pathSegments: ["clients", ":id"],
      testScript: deleteSuccessTest,
      description: "Elimina el cliente de prueba con ID {{cliente_id}}."
    })
  ]
};

const folder04_Barbers = {
  name: "04. Módulo Barberos",
  description: "Gestión del equipo de barberos profesionales, especialidades y perfiles.",
  item: [
    makeRequest({
      name: "01. Listar Barberos",
      method: "GET",
      pathSegments: ["barbers"],
      testScript: basicSuccessTest,
      description: "Consulta el catálogo de barberos activos del negocio."
    }),
    makeRequest({
      name: "02. Crear Barbero",
      method: "POST",
      pathSegments: ["barbers"],
      body: {
        nombre: "David",
        apellido: "Ospina",
        correo: "david.barber.test@example.com",
        telefono: "3148887766",
        especialidad: "Diseño & Barba Tradicional",
        imagen_url: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400",
        contrasena: "Barbero123*"
      },
      testScript: createdSuccessTest("barbero_id", "id_barbero"),
      description: "Crea un nuevo barbero con usuario asociado y almacena {{barbero_id}}."
    }),
    makeRequest({
      name: "03. Obtener Barbero por ID",
      method: "GET",
      pathSegments: ["barbers", ":id"],
      testScript: basicSuccessTest,
      description: "Detalle completo del barbero con ID {{barbero_id}}."
    }),
    makeRequest({
      name: "04. Actualizar Barbero",
      method: "PUT",
      pathSegments: ["barbers", ":id"],
      body: {
        nombre: "David",
        apellido: "Ospina R.",
        especialidad: "Master Barber, Fade & Colorimetría",
        telefono: "3148887700"
      },
      testScript: updatedSuccessTest,
      description: "Actualiza la especialidad o contacto del barbero."
    }),
    makeRequest({
      name: "05. Cambiar Estado del Barbero",
      method: "PATCH",
      pathSegments: ["barbers", ":id", "status"],
      testScript: updatedSuccessTest,
      description: "Activa o desactiva la disponibilidad del barbero en la agenda."
    }),
    makeRequest({
      name: "06. Eliminar Barbero",
      method: "DELETE",
      pathSegments: ["barbers", ":id"],
      testScript: deleteSuccessTest,
      description: "Elimina el barbero de prueba {{barbero_id}}."
    })
  ]
};

const folder05_Services = {
  name: "05. Módulo Servicios & Categorías",
  description: "Catálogo de cortes, tratamientos, perfilados y categorías de servicios.",
  item: [
    makeRequest({
      name: "01. Listar Servicios",
      method: "GET",
      pathSegments: ["services"],
      queryParams: [
        { key: "search", value: "", description: "Buscar por nombre de servicio" },
        { key: "category", value: "all", description: "ID categoría o all" },
        { key: "status", value: "all", description: "1 activo, 0 inactivo, all" }
      ],
      testScript: basicSuccessTest,
      description: "Lista todos los servicios con precios y duraciones."
    }),
    makeRequest({
      name: "02. Listar Categorías de Servicios",
      method: "GET",
      pathSegments: ["services", "categories"],
      testScript: basicSuccessTest,
      description: "Obtiene las categorías (Cortes, Barba, Tratamientos, etc.)."
    }),
    makeRequest({
      name: "03. Crear Categoría de Servicio",
      method: "POST",
      pathSegments: ["services", "categories"],
      body: {
        nombre: "Tratamientos Faciales & Spa"
      },
      testScript: createdSuccessTest("categoria_servicio_id", "id_categoria_servicio"),
      description: "Crea una nueva categoría para organizar los servicios."
    }),
    makeRequest({
      name: "04. Crear Servicio",
      method: "POST",
      pathSegments: ["services"],
      body: {
        nombre: "Exfoliación & Mascarilla Negra",
        id_categoria_servicio: 3,
        precio: 25000,
        duracion_minutos: 30,
        imagen_url: "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=400"
      },
      testScript: createdSuccessTest("servicio_id", "id_servicio"),
      description: "Crea un nuevo servicio y guarda {{servicio_id}}."
    }),
    makeRequest({
      name: "05. Obtener Servicio por ID",
      method: "GET",
      pathSegments: ["services", ":id"],
      testScript: basicSuccessTest,
      description: "Consulta el detalle del servicio por {{servicio_id}}."
    }),
    makeRequest({
      name: "06. Actualizar Servicio",
      method: "PUT",
      pathSegments: ["services", ":id"],
      body: {
        nombre: "Exfoliación Facial Profunda & Mascarilla",
        precio: 28000,
        duracion_minutos: 35
      },
      testScript: updatedSuccessTest,
      description: "Actualiza precio y duración del servicio."
    }),
    makeRequest({
      name: "07. Cambiar Estado del Servicio",
      method: "PATCH",
      pathSegments: ["services", ":id", "status"],
      testScript: updatedSuccessTest,
      description: "Habilita o deshabilita la oferta del servicio."
    }),
    makeRequest({
      name: "08. Eliminar Servicio",
      method: "DELETE",
      pathSegments: ["services", ":id"],
      testScript: deleteSuccessTest,
      description: "Elimina el servicio {{servicio_id}}."
    })
  ]
};

const folder06_Packages = {
  name: "06. Módulo Paquetes Promocionales",
  description: "Combos y paquetes de múltiples servicios con descuentos especiales.",
  item: [
    makeRequest({
      name: "01. Listar Paquetes Promocionales",
      method: "GET",
      pathSegments: ["packages"],
      testScript: basicSuccessTest,
      description: "Consulta la lista de paquetes y combos promocionales."
    }),
    makeRequest({
      name: "02. Crear Paquete Promocional",
      method: "POST",
      pathSegments: ["packages"],
      body: {
        nombre: "Combo Caballero Total",
        descuento_porcentaje: 15,
        servicios_ids: [1, 2]
      },
      testScript: createdSuccessTest("paquete_id", "id_paquete"),
      description: "Crea un paquete asociando servicios y guarda {{paquete_id}}."
    }),
    makeRequest({
      name: "03. Obtener Paquete por ID",
      method: "GET",
      pathSegments: ["packages", ":id"],
      testScript: basicSuccessTest,
      description: "Consulta los detalles del paquete {{paquete_id}}."
    }),
    makeRequest({
      name: "04. Actualizar Paquete Promocional",
      method: "PUT",
      pathSegments: ["packages", ":id"],
      body: {
        nombre: "Combo Caballero Total VIP",
        descuento_porcentaje: 20,
        servicios_ids: [1, 2, 3]
      },
      testScript: updatedSuccessTest,
      description: "Actualiza el descuento y la lista de servicios del combo."
    }),
    makeRequest({
      name: "05. Cambiar Estado del Paquete",
      method: "PATCH",
      pathSegments: ["packages", ":id", "status"],
      testScript: updatedSuccessTest,
      description: "Alterna la visibilidad del paquete en la web."
    }),
    makeRequest({
      name: "06. Eliminar Paquete Promocional",
      method: "DELETE",
      pathSegments: ["packages", ":id"],
      testScript: deleteSuccessTest,
      description: "Elimina el paquete de prueba {{paquete_id}}."
    })
  ]
};

const folder07_Products = {
  name: "07. Módulo Productos e Inventario",
  description: "Catálogo de productos físicos, stock, precios y categorías.",
  item: [
    makeRequest({
      name: "01. Listar Productos e Inventario",
      method: "GET",
      pathSegments: ["products"],
      queryParams: [
        { key: "search", value: "", description: "Buscar por nombre" },
        { key: "category", value: "all", description: "ID categoría o all" },
        { key: "status", value: "all", description: "1 activo, 0 inactivo, all" }
      ],
      testScript: basicSuccessTest,
      description: "Consulta el inventario completo con stock actual."
    }),
    makeRequest({
      name: "02. Listar Categorías de Productos",
      method: "GET",
      pathSegments: ["products", "categories"],
      testScript: basicSuccessTest,
      description: "Obtiene las categorías de productos para cuidado y barbería."
    }),
    makeRequest({
      name: "03. Crear Categoría de Producto",
      method: "POST",
      pathSegments: ["products", "categories"],
      body: {
        nombre: "Aceites & Bálsamos de Barba"
      },
      testScript: createdSuccessTest("categoria_producto_id", "id_categoria_producto"),
      description: "Crea una nueva categoría en el inventario."
    }),
    makeRequest({
      name: "04. Crear Producto",
      method: "POST",
      pathSegments: ["products"],
      body: {
        nombre: "Aceite Hidratante para Barba 30ml",
        id_categoria_producto: 2,
        precio: 32000,
        stock: 15,
        imagen_url: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400"
      },
      testScript: createdSuccessTest("producto_id", "id_producto"),
      description: "Registra un producto físico y almacena {{producto_id}}."
    }),
    makeRequest({
      name: "05. Obtener Producto por ID",
      method: "GET",
      pathSegments: ["products", ":id"],
      testScript: basicSuccessTest,
      description: "Detalle del producto por {{producto_id}}."
    }),
    makeRequest({
      name: "06. Actualizar Producto",
      method: "PUT",
      pathSegments: ["products", ":id"],
      body: {
        nombre: "Aceite Hidratante Premium Barba 30ml",
        precio: 34000,
        stock: 20
      },
      testScript: updatedSuccessTest,
      description: "Modifica precio o información de stock del producto."
    }),
    makeRequest({
      name: "07. Cambiar Estado del Producto",
      method: "PATCH",
      pathSegments: ["products", ":id", "status"],
      testScript: updatedSuccessTest,
      description: "Habilita o deshabilita el producto para ventas."
    }),
    makeRequest({
      name: "08. Eliminar Producto",
      method: "DELETE",
      pathSegments: ["products", ":id"],
      testScript: deleteSuccessTest,
      description: "Elimina el producto de prueba {{producto_id}}."
    })
  ]
};

const folder08_Schedules = {
  name: "08. Módulo Horarios & Novedades",
  description: "Disponibilidad de turnos, jornadas laborales de barberos y gestión de novedades.",
  item: [
    makeRequest({
      name: "01. Listar Horarios Generales",
      method: "GET",
      pathSegments: ["schedules"],
      testScript: basicSuccessTest,
      description: "Lista los turnos y jornadas semanales configuradas."
    }),
    makeRequest({
      name: "02. Consultar Disponibilidad de Turnos en Tiempo Real",
      method: "GET",
      pathSegments: ["schedules", "availability"],
      queryParams: [
        { key: "id_barbero", value: "1", description: "ID del barbero a consultar" },
        { key: "fecha", value: "2026-10-15", description: "Fecha de la cita (YYYY-MM-DD)" }
      ],
      testScript: `pm.test("Status code is 200 OK", function () {
    pm.response.to.have.status(200);
});
pm.test("Slots calculados correctamente", function () {
    const json = pm.response.json();
    pm.expect(json.success).to.be.true;
    pm.expect(json.data).to.have.property("slots");
});`,
      description: "Calcula los slots horarios libres teniendo en cuenta novedades y citas existentes."
    }),
    makeRequest({
      name: "03. Crear Horario de Atención de Barbero",
      method: "POST",
      pathSegments: ["schedules"],
      body: {
        id_barbero: 1,
        dias_semana: ["Lunes", "Martes", "Miércoles"],
        hora_inicio: "08:00",
        hora_fin: "18:00"
      },
      testScript: createdSuccessTest("horario_id", "id_horario"),
      description: "Configura la jornada de trabajo y almacena {{horario_id}}."
    }),
    makeRequest({
      name: "04. Obtener Horario por ID",
      method: "GET",
      pathSegments: ["schedules", ":id"],
      testScript: basicSuccessTest,
      description: "Consulta el horario configurado en {{horario_id}}."
    }),
    makeRequest({
      name: "05. Actualizar Horario",
      method: "PUT",
      pathSegments: ["schedules", ":id"],
      body: {
        hora_inicio: "09:00",
        hora_fin: "19:00",
        estado: 1
      },
      testScript: updatedSuccessTest,
      description: "Modifica las horas de entrada y salida del horario."
    }),
    makeRequest({
      name: "06. Listar Novedades de Barberos",
      method: "GET",
      pathSegments: ["schedules", "novelties"],
      testScript: basicSuccessTest,
      description: "Consulta ausencias, permisos o cambios de turno."
    }),
    makeRequest({
      name: "07. Registrar Novedad de Horario",
      method: "POST",
      pathSegments: ["schedules", "novelties"],
      body: {
        id_barbero: 1,
        tipo: "Permiso",
        fecha: "2026-10-20",
        descripcion: "Cita médica y trámite personal"
      },
      testScript: createdSuccessTest("novedad_id", "id_novedad"),
      description: "Registra una novedad de ausencia temporal."
    }),
    makeRequest({
      name: "08. Cambiar Estado de Novedad (Aprobar/Rechazar)",
      method: "PATCH",
      pathSegments: ["schedules", "novelties", ":id", "status"],
      body: {
        estado: "Aprobado"
      },
      testScript: updatedSuccessTest,
      description: "Permite al Administrador aprobar o rechazar la novedad laboral."
    }),
    makeRequest({
      name: "09. Eliminar Horario",
      method: "DELETE",
      pathSegments: ["schedules", ":id"],
      testScript: deleteSuccessTest,
      description: "Elimina el horario {{horario_id}}."
    })
  ]
};

const folder09_Appointments = {
  name: "09. Módulo Citas & Reservas",
  description: "Flujo de agendamiento, confirmación, reprogramación y cancelación de citas.",
  item: [
    makeRequest({
      name: "01. Listar Citas",
      method: "GET",
      pathSegments: ["appointments"],
      queryParams: [
        { key: "status", value: "all", description: "Programada, Confirmada, En Proceso, Completada, Cancelada o all" },
        { key: "barber", value: "all", description: "ID barbero o all" },
        { key: "date", value: "", description: "Fecha filtro YYYY-MM-DD" }
      ],
      testScript: basicSuccessTest,
      description: "Lista todas las citas programadas en el sistema."
    }),
    makeRequest({
      name: "02. Agendar Nueva Cita",
      method: "POST",
      pathSegments: ["appointments"],
      body: {
        id_cliente: 1,
        id_barbero: 1,
        fecha: "2026-11-10",
        hora: "10:00",
        servicios: [1],
        estado: "Programada"
      },
      testScript: createdSuccessTest("cita_id", "id_cita"),
      description: "Agenda un nuevo turno validando colisiones y disponibilidad. Guarda {{cita_id}}."
    }),
    makeRequest({
      name: "03. Obtener Cita por ID",
      method: "GET",
      pathSegments: ["appointments", ":id"],
      testScript: basicSuccessTest,
      description: "Obtiene los detalles y servicios asociados a la cita {{cita_id}}."
    }),
    makeRequest({
      name: "04. Actualizar Cita",
      method: "PUT",
      pathSegments: ["appointments", ":id"],
      body: {
        hora: "11:00",
        estado: "Confirmada"
      },
      testScript: updatedSuccessTest,
      description: "Modifica hora o detalles de la cita."
    }),
    makeRequest({
      name: "05. Cambiar Estado de Cita (Completada)",
      method: "PATCH",
      pathSegments: ["appointments", ":id", "status"],
      body: {
        estado: "Completada"
      },
      testScript: updatedSuccessTest,
      description: "Marca la cita como completada tras la atención."
    }),
    makeRequest({
      name: "06. Cancelar Cita",
      method: "PATCH",
      pathSegments: ["appointments", ":id", "cancel"],
      testScript: updatedSuccessTest,
      description: "Cancela la cita liberando el slot para otros usuarios."
    }),
    makeRequest({
      name: "07. Eliminar Cita",
      method: "DELETE",
      pathSegments: ["appointments", ":id"],
      testScript: deleteSuccessTest,
      description: "Elimina la cita {{cita_id}}."
    })
  ]
};

const folder10_Suppliers = {
  name: "10. Módulo Proveedores",
  description: "Gestión de distribuidores mayoristas e insumos comerciales.",
  item: [
    makeRequest({
      name: "01. Listar Proveedores",
      method: "GET",
      pathSegments: ["suppliers"],
      queryParams: [
        { key: "search", value: "", description: "Buscar por nombre, nit o correo" },
        { key: "status", value: "all", description: "1 activo, 0 inactivo, all" }
      ],
      testScript: basicSuccessTest,
      description: "Lista los proveedores comerciales registrados."
    }),
    makeRequest({
      name: "02. Crear Proveedor",
      method: "POST",
      pathSegments: ["suppliers"],
      body: {
        nombre: "Distribuidora Internacional Barber SAS",
        nit: "901555666-1",
        telefono: "3004445566",
        correo: "ventas@barbersas.com",
        direccion: "Zona Industrial Guayabal, Medellín"
      },
      testScript: createdSuccessTest("proveedor_id", "id_proveedor"),
      description: "Registra un nuevo proveedor y almacena {{proveedor_id}}."
    }),
    makeRequest({
      name: "03. Obtener Proveedor por ID",
      method: "GET",
      pathSegments: ["suppliers", ":id"],
      testScript: basicSuccessTest,
      description: "Consulta los datos de contacto y NIT de {{proveedor_id}}."
    }),
    makeRequest({
      name: "04. Actualizar Proveedor",
      method: "PUT",
      pathSegments: ["suppliers", ":id"],
      body: {
        nombre: "Distribuidora Barber Pro Colombia SAS",
        telefono: "3004445500",
        direccion: "Cra 50 # 12-34, Medellín"
      },
      testScript: updatedSuccessTest,
      description: "Actualiza datos corporativos del proveedor."
    }),
    makeRequest({
      name: "05. Cambiar Estado de Proveedor",
      method: "PATCH",
      pathSegments: ["suppliers", ":id", "status"],
      testScript: updatedSuccessTest,
      description: "Activa o desactiva las relaciones con el proveedor."
    }),
    makeRequest({
      name: "06. Eliminar Proveedor",
      method: "DELETE",
      pathSegments: ["suppliers", ":id"],
      testScript: deleteSuccessTest,
      description: "Elimina el proveedor {{proveedor_id}}."
    })
  ]
};

const folder11_Purchases = {
  name: "11. Módulo Compras & Insumos",
  description: "Registro de facturas de compras a proveedores con incremento automático de inventario.",
  item: [
    makeRequest({
      name: "01. Listar Compras",
      method: "GET",
      pathSegments: ["purchases"],
      queryParams: [
        { key: "supplier", value: "all", description: "ID proveedor o all" },
        { key: "status", value: "all", description: "Registrada, Anulada o all" }
      ],
      testScript: basicSuccessTest,
      description: "Lista el historial de compras e ingresos de mercancía."
    }),
    makeRequest({
      name: "02. Registrar Nueva Compra",
      method: "POST",
      pathSegments: ["purchases"],
      body: {
        id_proveedor: 1,
        detalles: [
          {
            id_producto: 1,
            cantidad: 10,
            precio_unitario: 22000
          }
        ]
      },
      testScript: createdSuccessTest("compra_id", "id_compra"),
      description: "Registra la compra, aumenta el stock del producto e incrementa el total. Guarda {{compra_id}}."
    }),
    makeRequest({
      name: "03. Obtener Compra por ID",
      method: "GET",
      pathSegments: ["purchases", ":id"],
      testScript: basicSuccessTest,
      description: "Consulta el detalle y renglones de la compra {{compra_id}}."
    }),
    makeRequest({
      name: "04. Anular Compra (Revertir Stock)",
      method: "PATCH",
      pathSegments: ["purchases", ":id", "anular"],
      testScript: updatedSuccessTest,
      description: "Anula la compra y deduce atómicamente el stock ingresado previamente."
    }),
    makeRequest({
      name: "05. Eliminar Registro de Compra",
      method: "DELETE",
      pathSegments: ["purchases", ":id"],
      testScript: deleteSuccessTest,
      description: "Elimina la compra {{compra_id}}."
    })
  ]
};

const folder12_Sales = {
  name: "12. Módulo Ventas & Facturación",
  description: "Facturación de servicios y productos con control de caja y deducción de stock.",
  item: [
    makeRequest({
      name: "01. Listar Ventas",
      method: "GET",
      pathSegments: ["sales"],
      queryParams: [
        { key: "client", value: "all", description: "ID cliente o all" },
        { key: "status", value: "all", description: "Registrada, Anulada o all" }
      ],
      testScript: basicSuccessTest,
      description: "Lista el histórico de facturación de ventas y servicios."
    }),
    makeRequest({
      name: "02. Registrar Venta (Servicio + Producto)",
      method: "POST",
      pathSegments: ["sales"],
      body: {
        id_cliente: 1,
        detalles: [
          {
            tipo_item: "Producto",
            id_producto: 1,
            cantidad: 1,
            precio_unitario: 30000
          },
          {
            tipo_item: "Servicio",
            id_servicio: 1,
            cantidad: 1,
            precio_unitario: 22000
          }
        ]
      },
      testScript: createdSuccessTest("venta_id", "id_venta"),
      description: "Registra la venta mixta, reduce el stock físico y guarda {{venta_id}}."
    }),
    makeRequest({
      name: "03. Obtener Venta por ID",
      method: "GET",
      pathSegments: ["sales", ":id"],
      testScript: basicSuccessTest,
      description: "Consulta los renglones y totales de la venta {{venta_id}}."
    }),
    makeRequest({
      name: "04. Anular Venta (Restituir Stock)",
      method: "PATCH",
      pathSegments: ["sales", ":id", "anular"],
      testScript: updatedSuccessTest,
      description: "Anula la venta y reintegra los productos al stock del inventario."
    }),
    makeRequest({
      name: "05. Eliminar Venta",
      method: "DELETE",
      pathSegments: ["sales", ":id"],
      testScript: deleteSuccessTest,
      description: "Elimina la venta {{venta_id}}."
    })
  ]
};

const folder13_Dashboard = {
  name: "13. Módulo Dashboard & Métricas",
  description: "Indicadores clave de rendimiento (KPIs), ingresos y resúmenes para la toma de decisiones.",
  item: [
    makeRequest({
      name: "01. Métricas Globales del Negocio",
      method: "GET",
      pathSegments: ["dashboard"],
      testScript: basicSuccessTest,
      description: "Retorna el total de clientes, barberos activos, servicios realizados y ventas del mes."
    }),
    makeRequest({
      name: "02. Métricas de Administración",
      method: "GET",
      pathSegments: ["dashboard", "admin"],
      testScript: basicSuccessTest,
      description: "Métricas completas para Administrador y Recepcionista con balance de caja."
    }),
    makeRequest({
      name: "03. Métricas del Portal de Barbero",
      method: "GET",
      pathSegments: ["dashboard", "barber"],
      testScript: basicSuccessTest,
      description: "Métricas exclusivas para el perfil del barbero (citas del día, ingresos por comisión)."
    })
  ]
};

const folder14_Uploads = {
  name: "14. Módulo Subida de Archivos (Uploads)",
  description: "Carga de imágenes multimedia (barberos, servicios, productos) y documentos PDF de proveedores.",
  item: [
    makeRequest({
      name: "01. Subir Imagen de Barbero",
      method: "POST",
      pathSegments: ["uploads", "barbers"],
      testScript: basicSuccessTest,
      description: "Sube imagen fotográfica para perfil de barbero (multipart/form-data con campo 'image')."
    }),
    makeRequest({
      name: "02. Subir Imagen de Servicio",
      method: "POST",
      pathSegments: ["uploads", "services"],
      testScript: basicSuccessTest,
      description: "Sube imagen demostrativa para catálogo de servicios."
    }),
    makeRequest({
      name: "03. Subir Imagen de Producto",
      method: "POST",
      pathSegments: ["uploads", "products"],
      testScript: basicSuccessTest,
      description: "Sube fotografía del producto físico para inventario."
    }),
    makeRequest({
      name: "04. Subir Documento PDF de Proveedor",
      method: "POST",
      pathSegments: ["uploads", "documents"],
      testScript: basicSuccessTest,
      description: "Sube factura electrónica o contrato en PDF (multipart/form-data con campo 'document')."
    })
  ]
};

// =========================================================================
// ENSAMBLAJE DE LA COLECCIÓN POSTMAN
// =========================================================================

const collection = {
  info: {
    _postman_id: "a7c2b3d4-barber-api-collection-2026",
    name: "Tu Turno Barber - Módulos Formativos CRUD API",
    description: `# Tu Turno Barber - Suite Oficial de Pruebas CRUD (Postman)\n\nColección integral que cubre los módulos formativos del sistema **Tu Turno Barber** ([https://proyecto-barber-three.vercel.app/](https://proyecto-barber-three.vercel.app/)).\n\n### Características:\n- **Autenticación Bearer Token automática**: Al ejecutar el login de Administrador, el token JWT se almacena de forma transparente en la variable {{token}}.\n- **Encadenamiento Dinámico**: Las peticiones de creación (POST) extraen los IDs devueltos y los guardan en variables de entorno (ej: {{usuario_id}}, {{cliente_id}}, etc.) para ser consumidos de inmediato por las peticiones GET/PUT/DELETE.\n- **Tests Automatizados**: Validación de códigos HTTP, esquemas de respuesta, confirmación de operaciones y control de latencia.`,
    schema: "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  auth: {
    type: "bearer",
    bearer: [
      {
        key: "token",
        value: "{{token}}",
        type: "string"
      }
    ]
  },
  variable: [
    {
      key: "baseUrl",
      value: "http://localhost:3001/api",
      type: "string"
    },
    {
      key: "token",
      value: "",
      type: "string"
    },
    { key: "usuario_id", value: "1", type: "string" },
    { key: "rol_id", value: "1", type: "string" },
    { key: "cliente_id", value: "1", type: "string" },
    { key: "barbero_id", value: "1", type: "string" },
    { key: "servicio_id", value: "1", type: "string" },
    { key: "categoria_servicio_id", value: "1", type: "string" },
    { key: "paquete_id", value: "1", type: "string" },
    { key: "producto_id", value: "1", type: "string" },
    { key: "categoria_producto_id", value: "1", type: "string" },
    { key: "horario_id", value: "6", type: "string" },
    { key: "novedad_id", value: "1", type: "string" },
    { key: "cita_id", value: "1", type: "string" },
    { key: "proveedor_id", value: "1", type: "string" },
    { key: "compra_id", value: "1", type: "string" },
    { key: "venta_id", value: "1", type: "string" }
  ],
  item: [
    folder00_Auth,
    folder01_Users,
    folder02_Roles,
    folder03_Clients,
    folder04_Barbers,
    folder05_Services,
    folder06_Packages,
    folder07_Products,
    folder08_Schedules,
    folder09_Appointments,
    folder10_Suppliers,
    folder11_Purchases,
    folder12_Sales,
    folder13_Dashboard,
    folder14_Uploads
  ]
};

// =========================================================================
// ENSAMBLAJE DEL ENTORNO POSTMAN
// =========================================================================

const environment = {
  id: "b8c3d4e5-barber-api-env-2026",
  name: "Tu Turno Barber - Local & Cloud Environment",
  values: [
    {
      key: "baseUrl",
      value: "http://localhost:3001/api",
      type: "default",
      enabled: true
    },
    {
      key: "vercelUrl",
      value: "https://proyecto-barber-three.vercel.app",
      type: "default",
      enabled: true
    },
    {
      key: "token",
      value: "",
      type: "secret",
      enabled: true
    },
    {
      key: "admin_email",
      value: "cristianmazo957@gmail.com",
      type: "default",
      enabled: true
    },
    {
      key: "admin_password",
      value: "Admin123*",
      type: "secret",
      enabled: true
    },
    {
      key: "recepcionista_email",
      value: "maria@example.com",
      type: "default",
      enabled: true
    },
    {
      key: "recepcionista_password",
      value: "Recepcionista123*",
      type: "secret",
      enabled: true
    },
    {
      key: "barbero_email",
      value: "barbero@tuturnobarber.com",
      type: "default",
      enabled: true
    },
    {
      key: "barbero_password",
      value: "Barbero123*",
      type: "secret",
      enabled: true
    },
    { key: "usuario_id", value: "1", type: "default", enabled: true },
    { key: "rol_id", value: "1", type: "default", enabled: true },
    { key: "cliente_id", value: "1", type: "default", enabled: true },
    { key: "barbero_id", value: "1", type: "default", enabled: true },
    { key: "servicio_id", value: "1", type: "default", enabled: true },
    { key: "categoria_servicio_id", value: "1", type: "default", enabled: true },
    { key: "paquete_id", value: "1", type: "default", enabled: true },
    { key: "producto_id", value: "1", type: "default", enabled: true },
    { key: "categoria_producto_id", value: "1", type: "default", enabled: true },
    { key: "horario_id", value: "6", type: "default", enabled: true },
    { key: "novedad_id", value: "1", type: "default", enabled: true },
    { key: "cita_id", value: "1", type: "default", enabled: true },
    { key: "proveedor_id", value: "1", type: "default", enabled: true },
    { key: "compra_id", value: "1", type: "default", enabled: true },
    { key: "venta_id", value: "1", type: "default", enabled: true }
  ],
  _postman_variable_scope: "environment"
};

// =========================================================================
// ESCRITURA DE ARCHIVOS JSON
// =========================================================================

const collectionJson = JSON.stringify(collection, null, 2);
const environmentJson = JSON.stringify(environment, null, 2);

// 1. Guardar en la raíz
fs.writeFileSync(path.resolve(rootDir, "Tu_Turno_Barber_API.postman_collection.json"), collectionJson, "utf8");
fs.writeFileSync(path.resolve(rootDir, "Tu_Turno_Barber_Environment.postman_environment.json"), environmentJson, "utf8");

// 2. Guardar en carpeta /postman
fs.writeFileSync(path.resolve(postmanDir, "Tu_Turno_Barber_API.postman_collection.json"), collectionJson, "utf8");
fs.writeFileSync(path.resolve(postmanDir, "Tu_Turno_Barber_Environment.postman_environment.json"), environmentJson, "utf8");

console.log("✅ Colección y Entorno de Postman generados exitosamente:");
console.log("   📁 Raíz: Tu_Turno_Barber_API.postman_collection.json");
console.log("   📁 Raíz: Tu_Turno_Barber_Environment.postman_environment.json");
console.log("   📁 postman/Tu_Turno_Barber_API.postman_collection.json");
console.log("   📁 postman/Tu_Turno_Barber_Environment.postman_environment.json");
console.log(`   📊 Total de Carpetas: ${collection.item.length}`);
let totalReqs = 0;
collection.item.forEach((folder) => {
  totalReqs += folder.item.length;
  console.log(`      - [${folder.name}]: ${folder.item.length} peticiones`);
});
console.log(`   🚀 Total Peticiones HTTP: ${totalReqs}`);

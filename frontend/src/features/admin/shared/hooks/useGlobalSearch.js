import { useState, useMemo } from "react";

// Base de datos de búsqueda indexada para todos los módulos
const GLOBAL_DATABASE = [
  // Clientes
  {
    id: "cli-1",
    category: "Clientes",
    title: "Pedro López",
    subtitle: "+57 300 123 4567 • pedro@example.com • Nivel Oro",
    route: "/dashboard/clients?highlight=cli-1",
    icon: "client",
    keywords: ["pedro", "lopez", "oro", "cliente", "3001234567", "pedro@example.com"]
  },
  {
    id: "cli-2",
    category: "Clientes",
    title: "Ana Martínez",
    subtitle: "+57 301 234 5678 • ana.m@example.com • Nivel Plata",
    route: "/dashboard/clients?highlight=cli-2",
    icon: "client",
    keywords: ["ana", "martinez", "plata", "cliente", "3012345678", "ana.m@example.com"]
  },
  {
    id: "cli-3",
    category: "Clientes",
    title: "Roberto Sánchez",
    subtitle: "+57 302 345 6789 • roberto@example.com • Nivel Bronce",
    route: "/dashboard/clients?highlight=cli-3",
    icon: "client",
    keywords: ["roberto", "sanchez", "bronce", "cliente", "3023456789"]
  },
  {
    id: "cli-4",
    category: "Clientes",
    title: "Laura Gómez",
    subtitle: "+57 303 456 7890 • laura@example.com • Nivel Oro",
    route: "/dashboard/clients?highlight=cli-4",
    icon: "client",
    keywords: ["laura", "gomez", "oro", "cliente", "3034567890"]
  },
  {
    id: "cli-5",
    category: "Clientes",
    title: "Diego Torres",
    subtitle: "+57 304 567 8901 • diego.t@example.com • Nivel Nuevo",
    route: "/dashboard/clients?highlight=cli-5",
    icon: "client",
    keywords: ["diego", "torres", "nuevo", "cliente", "3045678901"]
  },

  // Usuarios
  {
    id: "usr-1",
    category: "Usuarios",
    title: "Juan Pérez (Administrador)",
    subtitle: "juan@example.com • Rol: Administrador • Activo",
    route: "/dashboard/users?highlight=usr-1",
    icon: "user",
    keywords: ["juan", "perez", "administrador", "admin", "usuario", "juan@example.com"]
  },
  {
    id: "usr-2",
    category: "Usuarios",
    title: "María García (Recepcionista)",
    subtitle: "maria@example.com • Rol: Recepcionista • Activo",
    route: "/dashboard/users?highlight=usr-2",
    icon: "user",
    keywords: ["maria", "garcia", "recepcionista", "usuario", "maria@example.com"]
  },
  {
    id: "usr-3",
    category: "Usuarios",
    title: "Carlos Rodríguez (Barbero)",
    subtitle: "carlos@example.com • Rol: Barbero • Activo",
    route: "/dashboard/users?highlight=usr-3",
    icon: "user",
    keywords: ["carlos", "rodriguez", "barbero", "usuario", "carlos@example.com"]
  },
  {
    id: "usr-4",
    category: "Usuarios",
    title: "Ana Torres (Barbero)",
    subtitle: "ana@example.com • Rol: Barbero • Activo",
    route: "/dashboard/users?highlight=usr-4",
    icon: "user",
    keywords: ["ana", "torres", "barbero", "usuario", "ana@example.com"]
  },
  {
    id: "usr-5",
    category: "Usuarios",
    title: "Luis Martínez (Barbero)",
    subtitle: "luis@example.com • Rol: Barbero • Inactivo",
    route: "/dashboard/users?highlight=usr-5",
    icon: "user",
    keywords: ["luis", "martinez", "barbero", "usuario", "inactivo"]
  },

  // Proveedores
  {
    id: "sup-1",
    category: "Proveedores",
    title: "Distribuidora Barber Pro Colombia",
    subtitle: "NIT: 901234567-1 • ventas@barberpro.com.co • Tel: +57 310 987 6543",
    route: "/dashboard/suppliers?highlight=sup-1",
    icon: "supplier",
    keywords: ["distribuidora", "barber", "pro", "colombia", "901234567-1", "proveedor", "insumos"]
  },
  {
    id: "sup-2",
    category: "Proveedores",
    title: "Cosméticos & Cuidado Capilar S.A.S.",
    subtitle: "NIT: 900876543-2 • contacto@cosmeticoscapilar.com • Tel: +57 320 456 7890",
    route: "/dashboard/suppliers?highlight=sup-2",
    icon: "supplier",
    keywords: ["cosmeticos", "cuidado", "capilar", "pomadas", "shampoo", "proveedor"]
  },
  {
    id: "sup-3",
    category: "Proveedores",
    title: "Herramientas & Barber Supplies",
    subtitle: "NIT: 800345678-9 • pedidos@barbersupplies.co • Tel: +57 315 678 1234",
    route: "/dashboard/suppliers?highlight=sup-3",
    icon: "supplier",
    keywords: ["herramientas", "maquinas", "tijeras", "supplies", "proveedor"]
  },
  {
    id: "sup-4",
    category: "Proveedores",
    title: "Insumos y Lociones del Valle",
    subtitle: "NIT: 901567890-4 • insumosvalle@gmail.com • Tel: +57 318 234 5678",
    route: "/dashboard/suppliers?highlight=sup-4",
    icon: "supplier",
    keywords: ["insumos", "lociones", "valle", "aftershave", "proveedor"]
  },

  // Barberos
  {
    id: "bar-1",
    category: "Barberos",
    title: "Carlos Rodríguez",
    subtitle: "Especialidad: Corte Clásico • carlos@example.com",
    route: "/dashboard/barbers?highlight=bar-1",
    icon: "barber",
    keywords: ["carlos", "rodriguez", "barbero", "degradados", "fade", "clasico"]
  },
  {
    id: "bar-2",
    category: "Barberos",
    title: "Miguel Ángel",
    subtitle: "Especialidad: Diseño y Color • miguel@example.com",
    route: "/dashboard/barbers?highlight=bar-2",
    icon: "barber",
    keywords: ["miguel", "angel", "barbero", "barbas", "navaja", "color"]
  },
  {
    id: "bar-3",
    category: "Barberos",
    title: "Javier Torres",
    subtitle: "Especialidad: Barba Premium • javier@example.com",
    route: "/dashboard/barbers?highlight=bar-3",
    icon: "barber",
    keywords: ["javier", "torres", "barbero", "diseños", "urbanos", "barba"]
  },
  {
    id: "bar-4",
    category: "Barberos",
    title: "Luis Martínez",
    subtitle: "Especialidad: Corte Moderno • luis@example.com",
    route: "/dashboard/barbers?highlight=bar-4",
    icon: "barber",
    keywords: ["luis", "martinez", "barbero", "tratamientos", "moderno"]
  },

  // Servicios
  {
    id: "srv-1",
    category: "Servicios",
    title: "Corte Clásico",
    subtitle: "Duración: 30 min • Precio: $15.000",
    route: "/dashboard/services?highlight=srv-1",
    icon: "service",
    keywords: ["corte", "clasico", "masculino", "pelo", "cabello", "servicio", "15000"]
  },
  {
    id: "srv-2",
    category: "Servicios",
    title: "Corte + Barba",
    subtitle: "Duración: 45 min • Precio: $25.000",
    route: "/dashboard/services?highlight=srv-2",
    icon: "service",
    keywords: ["corte", "barba", "combo", "servicio", "25000"]
  },
  {
    id: "srv-3",
    category: "Servicios",
    title: "Afeitado Premium",
    subtitle: "Duración: 35 min • Precio: $20.000",
    route: "/dashboard/services?highlight=srv-3",
    icon: "service",
    keywords: ["afeitado", "premium", "toalla", "caliente", "navaja", "servicio", "20000"]
  },
  {
    id: "srv-4",
    category: "Servicios",
    title: "Diseño y Color",
    subtitle: "Duración: 60 min • Precio: $30.000",
    route: "/dashboard/services?highlight=srv-4",
    icon: "service",
    keywords: ["diseño", "color", "tintura", "servicio", "30000"]
  },
  {
    id: "srv-5",
    category: "Servicios",
    title: "Corte Niño",
    subtitle: "Duración: 20 min • Precio: $12.000",
    route: "/dashboard/services?highlight=srv-5",
    icon: "service",
    keywords: ["niño", "corte", "infantil", "servicio", "12000"]
  },

  // Productos / Inventario
  {
    id: "prd-1",
    category: "Productos",
    title: "Gel para Cabello",
    subtitle: "Stock: 25 uds • Precio Venta: $15.000",
    route: "/dashboard/products?highlight=prd-1",
    icon: "product",
    keywords: ["gel", "cabello", "fijador", "producto", "stock", "15000"]
  },
  {
    id: "prd-2",
    category: "Productos",
    title: "Cera Modeladora / Gel Fijador",
    subtitle: "Stock: 8 uds • Precio Venta: $18.000",
    route: "/dashboard/products?highlight=prd-2",
    icon: "product",
    keywords: ["gel", "fijador", "cera", "modeladora", "ultra hold", "producto", "stock", "18000"]
  },
  {
    id: "prd-3",
    category: "Productos",
    title: "Shampoo Premium",
    subtitle: "Stock: 15 uds • Precio Venta: $22.000",
    route: "/dashboard/products?highlight=prd-3",
    icon: "product",
    keywords: ["shampoo", "premium", "lavado", "producto", "22000"]
  },
  {
    id: "prd-4",
    category: "Productos",
    title: "Aceite para Barba",
    subtitle: "Stock Bajo: 2 uds • Precio Venta: $25.000",
    route: "/dashboard/products?highlight=prd-4",
    icon: "product",
    keywords: ["aceite", "barba", "hidratante", "crecimiento", "producto", "25000"]
  },
  {
    id: "prd-5",
    category: "Productos",
    title: "Navaja Profesional",
    subtitle: "Agotado: 0 uds • Precio: $45.000",
    route: "/dashboard/products?highlight=prd-5",
    icon: "product",
    keywords: ["navaja", "profesional", "afeitado", "herramienta", "45000"]
  },
  {
    id: "prd-6",
    category: "Productos",
    title: "Tijeras Profesionales",
    subtitle: "Stock: 12 uds • Precio Venta: $65.000",
    route: "/dashboard/products?highlight=prd-6",
    icon: "product",
    keywords: ["tijeras", "profesionales", "corte", "herramienta", "65000"]
  },

  // Citas
  {
    id: "app-1",
    category: "Citas",
    title: "Cita: Juan Pérez — Corte Clásico",
    subtitle: "Hoy a las 10:00 • Barbero: Carlos Rodríguez",
    route: "/dashboard/appointments?highlight=app-1",
    icon: "appointment",
    keywords: ["cita", "juan", "perez", "carlos", "agenda", "10:00"]
  },
  {
    id: "app-2",
    category: "Citas",
    title: "Cita: María García — Corte + Barba",
    subtitle: "Hoy a las 11:30 • Barbero: Miguel Ángel",
    route: "/dashboard/appointments?highlight=app-2",
    icon: "appointment",
    keywords: ["cita", "maria", "garcia", "miguel", "agenda", "11:30"]
  },

  // Ventas & Facturación
  {
    id: "sal-1",
    category: "Ventas",
    title: "Venta #006 — Mostrador",
    subtitle: "Monto: $45.000 • Cliente: Juan Pérez",
    route: "/dashboard/sales?highlight=sal-1",
    icon: "sale",
    keywords: ["venta", "006", "factura", "juan", "perez", "45000", "caja"]
  },
  {
    id: "sal-2",
    category: "Ventas",
    title: "Venta #005 — Factura Directa",
    subtitle: "Monto: $75.000 • Cliente: María García",
    route: "/dashboard/sales?highlight=sal-2",
    icon: "sale",
    keywords: ["venta", "005", "factura", "maria", "garcia", "75000", "caja"]
  },

  // Compras
  {
    id: "pur-1",
    category: "Compras",
    title: "Orden de Compra #001 — Barber Pro",
    subtitle: "Total: $350.000 • Proveedor: Distribuidora Barber Pro Colombia",
    route: "/dashboard/purchases?highlight=pur-1",
    icon: "purchase",
    keywords: ["compra", "orden", "barber pro", "proveedor", "factura compra", "350000"]
  },

  // Roles
  {
    id: "rol-1",
    category: "Roles",
    title: "Rol: Administrador",
    subtitle: "Acceso total a todos los módulos y configuraciones",
    route: "/dashboard/roles?highlight=rol-1",
    icon: "role",
    keywords: ["rol", "administrador", "admin", "permisos", "superadmin"]
  },
  {
    id: "rol-2",
    category: "Roles",
    title: "Rol: Recepcionista",
    subtitle: "Gestión de citas, clientes y ventas",
    route: "/dashboard/roles?highlight=rol-2",
    icon: "role",
    keywords: ["rol", "recepcionista", "citas", "ventas", "permisos"]
  },
  {
    id: "rol-3",
    category: "Roles",
    title: "Rol: Barbero",
    subtitle: "Acceso a agenda propia y comisiones",
    route: "/dashboard/roles?highlight=rol-3",
    icon: "role",
    keywords: ["rol", "barbero", "agenda", "turnos", "permisos"]
  },

  // Módulos / Páginas
  {
    id: "page-dash",
    category: "Páginas",
    title: "Panel Principal (Dashboard)",
    subtitle: "Resumen de ventas, citas del día, clientes y estadísticas",
    route: "/dashboard",
    icon: "page",
    keywords: ["dashboard", "inicio", "resumen", "graficas", "kpis", "estadisticas"]
  },
  {
    id: "page-sched",
    category: "Páginas",
    title: "Horarios y Turnos Semanales",
    subtitle: "Gestión de turnos de barberos y novedades de disponibilidad",
    route: "/dashboard/schedules",
    icon: "page",
    keywords: ["horarios", "turnos", "semana", "dias", "novedades", "permisos"]
  },
  {
    id: "page-sett",
    category: "Páginas",
    title: "Configuración del Sistema",
    subtitle: "Ajustes de la barbería, tema, notificaciones y parámetros",
    route: "/dashboard/settings",
    icon: "page",
    keywords: ["configuracion", "ajustes", "sistema", "parametros", "empresa"]
  }
];

export function useGlobalSearch() {
  const [searchTerm, setSearchTerm] = useState("");

  const searchResults = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return [];

    return GLOBAL_DATABASE.filter((item) => {
      const titleMatch = item.title.toLowerCase().includes(term);
      const subtitleMatch = item.subtitle.toLowerCase().includes(term);
      const categoryMatch = item.category.toLowerCase().includes(term);
      const keywordMatch = item.keywords.some((k) => k.toLowerCase().includes(term));

      return titleMatch || subtitleMatch || categoryMatch || keywordMatch;
    }).slice(0, 10); // Máximo 10 resultados para rendimiento y visual limpia
  }, [searchTerm]);

  return {
    searchTerm,
    setSearchTerm,
    searchResults
  };
}

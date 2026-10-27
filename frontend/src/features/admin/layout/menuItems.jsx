import {
  LayoutDashboard, Users, Scissors, Calendar, Package,
  DollarSign, Clock, UserCog, Shield, ClipboardList,
  Building2, ShoppingBag, Boxes, Layers
} from "lucide-react";

export const menuSections = [
  {
    id: "general",
    title: null,
    items: [
      { path: "/dashboard", icon: <LayoutDashboard className="h-5 w-5 shrink-0" />, label: "Dashboard" }
    ]
  },
  {
    id: "operacion",
    title: "Atención y Operación",
    items: [
      { path: "/dashboard/appointments", icon: <Calendar className="h-5 w-5 shrink-0" />, label: "Citas" },
      { path: "/dashboard/clients", icon: <Users className="h-5 w-5 shrink-0" />, label: "Clientes" },
      { path: "/dashboard/services", icon: <ClipboardList className="h-5 w-5 shrink-0" />, label: "Servicios" }
    ]
  },
  {
    id: "equipo",
    title: "Equipo de Trabajo",
    items: [
      { path: "/dashboard/barbers", icon: <Scissors className="h-5 w-5 shrink-0" />, label: "Barberos" },
      { path: "/dashboard/schedules", icon: <Clock className="h-5 w-5 shrink-0" />, label: "Horarios" }
    ]
  },
  {
    id: "comercial",
    title: "Caja e Inventario",
    items: [
      { path: "/dashboard/sales", icon: <DollarSign className="h-5 w-5 shrink-0" />, label: "Ventas" },
      { path: "/dashboard/products", icon: <Package className="h-5 w-5 shrink-0" />, label: "Productos" },
      { path: "/dashboard/abastecimiento", icon: <Boxes className="h-5 w-5 shrink-0" />, label: "Abastecimiento" },
      { path: "/dashboard/purchases", icon: <ShoppingBag className="h-5 w-5 shrink-0" />, label: "Compras" },
      { path: "/dashboard/suppliers", icon: <Building2 className="h-5 w-5 shrink-0" />, label: "Proveedores" }
    ]
  },
  {
    id: "sistema",
    title: "Seguridad y Sistema",
    items: [
      { path: "/dashboard/users", icon: <UserCog className="h-5 w-5 shrink-0" />, label: "Usuarios" },
      { path: "/dashboard/roles", icon: <Shield className="h-5 w-5 shrink-0" />, label: "Roles" }
    ]
  }
];

export const menuItems = menuSections.flatMap((section) => section.items);

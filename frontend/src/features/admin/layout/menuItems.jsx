import {
  LayoutDashboard, Users, Scissors, Calendar, Package,
  DollarSign, Clock, UserCog, Shield, ClipboardList,
  Building2, ShoppingBag
} from "lucide-react";

export const menuItems = [
  { path: "/dashboard", icon: <LayoutDashboard className="h-5 w-5 shrink-0" />, label: "Dashboard" },
  { path: "/dashboard/appointments", icon: <Calendar className="h-5 w-5 shrink-0" />, label: "Citas" },
  { path: "/dashboard/clients", icon: <Users className="h-5 w-5 shrink-0" />, label: "Clientes" },
  { path: "/dashboard/suppliers", icon: <Building2 className="h-5 w-5 shrink-0" />, label: "Proveedores" },
  { path: "/dashboard/barbers", icon: <Scissors className="h-5 w-5 shrink-0" />, label: "Barberos" },
  { path: "/dashboard/schedules", icon: <Clock className="h-5 w-5 shrink-0" />, label: "Horarios" },
  { path: "/dashboard/services", icon: <ClipboardList className="h-5 w-5 shrink-0" />, label: "Servicios" },
  { path: "/dashboard/products", icon: <Package className="h-5 w-5 shrink-0" />, label: "Productos" },
  { path: "/dashboard/purchases", icon: <ShoppingBag className="h-5 w-5 shrink-0" />, label: "Compras" },
  { path: "/dashboard/sales", icon: <DollarSign className="h-5 w-5 shrink-0" />, label: "Ventas" },
  { path: "/dashboard/users", icon: <UserCog className="h-5 w-5 shrink-0" />, label: "Usuarios" },
  { path: "/dashboard/roles", icon: <Shield className="h-5 w-5 shrink-0" />, label: "Roles" },
];

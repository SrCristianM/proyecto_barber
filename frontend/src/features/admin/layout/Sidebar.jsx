import { Link, useLocation } from "react-router";
import {
  LayoutDashboard, Users, Scissors, Calendar, Package,
  ShoppingCart, DollarSign, Clock, User, Settings,
  Shield, UserCog, ClipboardList, Menu
} from "lucide-react";

const Sidebar = ({ sidebarOpen, setSidebarOpen }) => {
  const location = useLocation();

  const menuItems = [
    { path: "/dashboard", icon: <LayoutDashboard className="h-5 w-5" />, label: "Dashboard" },
    { path: "/dashboard/appointments", icon: <Calendar className="h-5 w-5" />, label: "Citas" },
    { path: "/dashboard/clients", icon: <Users className="h-5 w-5" />, label: "Clientes" },
    { path: "/dashboard/barbers", icon: <Scissors className="h-5 w-5" />, label: "Barberos" },
    { path: "/dashboard/schedules", icon: <Clock className="h-5 w-5" />, label: "Horarios" },
    { path: "/dashboard/services", icon: <ClipboardList className="h-5 w-5" />, label: "Servicios" },
    { path: "/dashboard/products", icon: <Package className="h-5 w-5" />, label: "Productos" },
    { path: "/dashboard/sales", icon: <DollarSign className="h-5 w-5" />, label: "Ventas" },
    { path: "/dashboard/users", icon: <UserCog className="h-5 w-5" />, label: "Usuarios" },
    { path: "/dashboard/roles", icon: <Shield className="h-5 w-5" />, label: "Roles" },
  ];

  return (
    <aside className={`fixed top-0 left-0 h-screen bg-sidebar border-r border-sidebar-border transition-all duration-300 ${sidebarOpen ? "w-64" : "w-20"} z-40`}>
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-sidebar-border">
          {sidebarOpen && (
            <div className="flex items-center gap-2">
              <Scissors className="h-6 w-6 text-primary" />
              <span className="font-bold text-sidebar-foreground">Tu Turno</span>
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-sidebar-accent rounded-lg text-sidebar-foreground"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 overflow-y-auto">
          <ul className="space-y-1 px-2">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                      isActive
                        ? "bg-sidebar-primary text-sidebar-primary-foreground"
                        : "text-sidebar-foreground hover:bg-sidebar-accent"
                    }`}
                    title={!sidebarOpen ? item.label : undefined}
                  >
                    {item.icon}
                    {sidebarOpen && <span>{item.label}</span>}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Settings */}
        <div className="p-4 border-t border-sidebar-border">
          <Link
            to="/dashboard/settings"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
            title={!sidebarOpen ? "Configuración" : undefined}
          >
            <Settings className="h-5 w-5" />
            {sidebarOpen && <span>Configuración</span>}
          </Link>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
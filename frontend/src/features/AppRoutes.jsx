import { Routes, Route, Navigate, Link } from "react-router";
import { AlertCircle } from "lucide-react";
import AdminDashboard from "../shared/dashboard/AdminDashboard";
import RolesPage from "./admin/roles/pages/RolesPage";
import UsersPage from "./admin/users/pages/UsersPage";
import BarbersPage from "./admin/barbers/pages/BarbersPage";
import SchedulesPage from "./admin/schedules/pages/SchedulesPage";
import ServicesPage from "./admin/services/pages/ServicesPage";
import ProductsPage from "./admin/products/pages/ProductsPage";
import ClientsPage from "./admin/clients/pages/ClientsPage";
import SuppliersPage from "./admin/suppliers/pages/SuppliersPage";
import PurchasesPage from "./admin/purchases/pages/PurchasesPage";
import AppointmentsPage from "./admin/appointments/pages/AppointmentsPage";
import SalesPage from "./admin/sales/pages/SalesPage";
import SettingsPage from "./admin/settings/pages/SettingsPage";

import LandingPage from "./landing/pages/LandingPage";
import Login from "./auth/pages/Login";
import Register from "./auth/pages/Register";
import ForgotPassword from "./auth/pages/ForgotPassword";
import DashboardLayout from "./admin/layout/DashboardLayout";
import AccessDenied from "./admin/shared/components/AccessDenied";
import ErrorBoundary from "../shared/components/ErrorBoundary";
import { usePermissions } from "./auth/hooks/usePermissions";

// Portal del Cliente
import ClientLayout from "./client/layout/ClientLayout";
import ClientDashboard from "./client/pages/ClientDashboard";
import ClientServicesPage from "./client/pages/ClientServicesPage";
import ClientPackagesPage from "./client/pages/ClientPackagesPage";
import ClientProductsPage from "./client/pages/ClientProductsPage";
import ClientBookingPage from "./client/pages/ClientBookingPage";
import ClientMyAppointmentsPage from "./client/pages/ClientMyAppointmentsPage";
import ClientMyPurchasesPage from "./client/pages/ClientMyPurchasesPage";
import ClientProfilePage from "./client/pages/ClientProfilePage";

// Portal del Barbero
import BarberLayout from "./barber/layout/BarberLayout";
import BarberDashboard from "./barber/pages/BarberDashboard";
import BarberAgendaPage from "./barber/pages/BarberAgendaPage";
import BarberSchedulesPage from "./barber/pages/BarberSchedulesPage";
import BarberNoveltiesPage from "./barber/pages/BarberNoveltiesPage";
import BarberPackagesPage from "./barber/pages/BarberPackagesPage";
import BarberAppointmentsPage from "./barber/pages/BarberAppointmentsPage";
import BarberReportsPage from "./barber/pages/BarberReportsPage";
import BarberProfilePage from "./barber/pages/BarberProfilePage";

import { getCurrentUser } from "./auth/services/authService";

function hasActiveSession(isAuthenticated) {
  if (isAuthenticated) return true;
  try {
    return !!localStorage.getItem("barber_current_user");
  } catch {
    return false;
  }
}

/**
 * Guardián de seguridad a nivel de módulo administrativo.
 * Bloquea el acceso a cualquier módulo para el cual el rol del usuario no tenga permisos asignados.
 */
function ModuleGuard({ moduleName, children }) {
  const { canAccess } = usePermissions();

  if (!canAccess(moduleName)) {
    const labels = {
      roles: "Roles y Permisos",
      users: "Usuarios del Sistema",
      usuarios: "Usuarios del Sistema",
      settings: "Configuración del Sistema",
      configuracion: "Configuración del Sistema",
      barbers: "Barberos",
      barberos: "Barberos",
      schedules: "Horarios",
      horarios: "Horarios",
      services: "Servicios",
      servicios: "Servicios",
      products: "Productos",
      productos: "Productos",
      clients: "Clientes",
      clientes: "Clientes",
      suppliers: "Proveedores",
      proveedores: "Proveedores",
      purchases: "Compras",
      compras: "Compras",
      appointments: "Citas",
      citas: "Citas",
      sales: "Ventas",
      ventas: "Ventas"
    };
    return <AccessDenied moduleName={labels[moduleName.toLowerCase()] || moduleName} />;
  }

  return children;
}

/**
 * Componente Guardián para el panel administrativo/operativo.
 * Permite acceso a Administrador (id_rol === 1) y Recepcionista (id_rol === 2).
 * Si el usuario no está autenticado, va a /login.
 * Si el usuario es rol CLIENTE (id_rol === 4), se redirige a /portal.
 * Si el usuario es rol BARBERO (id_rol === 3), se redirige a /barbero.
 */
function AdminRoute({ isAuthenticated, isDark, setIsDark }) {
  if (!hasActiveSession(isAuthenticated)) {
    return <Navigate to="/login" replace />;
  }

  const user = getCurrentUser();
  if (user && Number(user.id_rol) === 4) {
    return <Navigate to="/portal" replace />;
  }
  if (user && Number(user.id_rol) === 3) {
    return <Navigate to="/barbero" replace />;
  }

  return <DashboardLayout isDark={isDark} setIsDark={setIsDark} />;
}

/**
 * Componente Guardián para el rol CLIENTE.
 * Si el usuario no está autenticado, va a /login.
 * Si el usuario es rol ADMINISTRADOR (id_rol === 1), se redirige a /dashboard.
 * Si el usuario es rol BARBERO (id_rol === 3), se redirige a /barbero.
 */
function ClientRoute({ isAuthenticated, isDark, setIsDark, onLogout }) {
  if (!hasActiveSession(isAuthenticated)) {
    return <Navigate to="/login" replace />;
  }

  const user = getCurrentUser();
  if (user && (Number(user.id_rol) === 1 || Number(user.id_rol) === 2)) {
    return <Navigate to="/dashboard" replace />;
  }
  if (user && Number(user.id_rol) === 3) {
    return <Navigate to="/barbero" replace />;
  }

  return <ClientLayout isDark={isDark} setIsDark={setIsDark} onLogout={onLogout} />;
}

/**
 * Componente Guardián para el rol BARBERO.
 * Si el usuario no está autenticado, va a /login.
 * Si el usuario es rol ADMINISTRADOR (id_rol === 1), se redirige a /dashboard.
 * Si el usuario es rol CLIENTE (id_rol === 4), se redirige a /portal.
 */
function BarberRoute({ isAuthenticated, isDark, setIsDark, onLogout }) {
  if (!hasActiveSession(isAuthenticated)) {
    return <Navigate to="/login" replace />;
  }

  const user = getCurrentUser();
  if (user && (Number(user.id_rol) === 1 || Number(user.id_rol) === 2)) {
    return <Navigate to="/dashboard" replace />;
  }
  if (user && Number(user.id_rol) === 4) {
    return <Navigate to="/portal" replace />;
  }

  return <BarberLayout isDark={isDark} setIsDark={setIsDark} onLogout={onLogout} />;
}

/**
 * Componente Guardián de permisos para rutas del Barbero.
 * Si el Administrador retira el permiso de un módulo al Barbero,
 * bloquea la pantalla con mensaje explicativo y botón de regreso.
 */
function BarberPermissionGuard({ moduleName, moduleLabel, children }) {
  const { canAccess } = usePermissions();

  if (!canAccess(moduleName)) {
    return (
      <div className="min-h-[55vh] flex items-center justify-center p-6">
        <div className="max-w-md w-full p-6 sm:p-8 rounded-3xl bg-card border border-border text-center shadow-xl">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-7 h-7 sm:w-8 sm:h-8" />
          </div>
          <h2 className="text-lg sm:text-xl font-black text-foreground mb-2">Módulo no autorizado</h2>
          <p className="text-xs sm:text-sm text-muted-foreground mb-6 leading-relaxed">
            Tu rol de Barbero no tiene permiso para acceder al módulo de <span className="font-bold text-foreground">{moduleLabel}</span>. Si requieres acceso, solicita al Administrador que active este permiso en el módulo de Roles.
          </p>
          <Link
            to="/barbero"
            className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#E8C466] to-[#DDAE41] hover:from-[#F0CF78] hover:to-[#E8C466] text-black font-extrabold text-xs sm:text-sm shadow-md transition-all cursor-pointer"
          >
            Volver al Inicio del Barbero
          </Link>
        </div>
      </div>
    );
  }

  return children;
}

/**
 * Redirección de protección para rutas administrativas directas tipeadas manualmente en URL
 * (ej: /usuarios, /roles, /proveedores, etc.)
 */
function AdminManualRedirect({ targetAdminPath }) {
  const user = getCurrentUser();
  if (user && Number(user.id_rol) === 3) {
    return <Navigate to="/barbero" replace />;
  }
  if (user && Number(user.id_rol) === 4) {
    return <Navigate to="/portal" replace />;
  }
  return <Navigate to={targetAdminPath} replace />;
}

/**
 * Configuración centralizada de rutas de la aplicación.
 * Coexistencia estricta entre la Interfaz Administrativa, el Portal del Cliente y el Portal del Barbero.
 */
export default function AppRoutes({ isDark, setIsDark, isAuthenticated, onLogin, onLogout }) {
  return (
    <ErrorBoundary>
      <Routes>
        {/* Rutas Públicas */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login onLogin={onLogin} />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* RUTA ADMINISTRATIVA (ROL: ADMINISTRADOR Y RECEPCIONISTA SEGÚN PERMISOS) */}
        <Route
          path="/dashboard"
          element={<AdminRoute isAuthenticated={isAuthenticated} isDark={isDark} setIsDark={setIsDark} />}
        >
          <Route index element={<AdminDashboard />} />
          <Route path="roles" element={<ModuleGuard moduleName="roles"><RolesPage /></ModuleGuard>} />
          <Route path="users" element={<ModuleGuard moduleName="users"><UsersPage /></ModuleGuard>} />
          <Route path="barbers" element={<ModuleGuard moduleName="barbers"><BarbersPage /></ModuleGuard>} />
          <Route path="schedules" element={<ModuleGuard moduleName="schedules"><SchedulesPage /></ModuleGuard>} />
          <Route path="services" element={<ModuleGuard moduleName="services"><ServicesPage /></ModuleGuard>} />
          <Route path="products" element={<ModuleGuard moduleName="products"><ProductsPage /></ModuleGuard>} />
          <Route path="clients" element={<ModuleGuard moduleName="clients"><ClientsPage /></ModuleGuard>} />
          <Route path="suppliers" element={<ModuleGuard moduleName="suppliers"><SuppliersPage /></ModuleGuard>} />
          <Route path="proveedores" element={<ModuleGuard moduleName="proveedores"><SuppliersPage /></ModuleGuard>} />
          <Route path="purchases" element={<ModuleGuard moduleName="purchases"><PurchasesPage /></ModuleGuard>} />
          <Route path="compras" element={<ModuleGuard moduleName="compras"><PurchasesPage /></ModuleGuard>} />
          <Route path="appointments" element={<ModuleGuard moduleName="appointments"><AppointmentsPage /></ModuleGuard>} />
          <Route path="sales" element={<ModuleGuard moduleName="sales"><SalesPage /></ModuleGuard>} />
          <Route path="settings" element={<ModuleGuard moduleName="settings"><SettingsPage isDark={isDark} setIsDark={setIsDark} /></ModuleGuard>} />
        </Route>

        {/* RUTA PORTAL CLIENTE (ROL: CLIENTE) */}
        <Route
          path="/portal"
          element={
            <ClientRoute
              isAuthenticated={isAuthenticated}
              isDark={isDark}
              setIsDark={setIsDark}
              onLogout={onLogout}
            />
          }
        >
          <Route index element={<ClientDashboard />} />
          <Route path="agendar" element={<ClientBookingPage />} />
          <Route path="mis-citas" element={<ClientMyAppointmentsPage />} />
          <Route path="servicios" element={<ClientServicesPage />} />
          <Route path="paquetes" element={<ClientPackagesPage />} />
          <Route path="productos" element={<ClientProductsPage />} />
          <Route path="mis-compras" element={<ClientMyPurchasesPage />} />
          <Route path="perfil" element={<ClientProfilePage />} />
        </Route>

        {/* RUTA PORTAL BARBERO (ROL: BARBERO) */}
        <Route
          path="/barbero"
          element={
            <BarberRoute
              isAuthenticated={isAuthenticated}
              isDark={isDark}
              setIsDark={setIsDark}
              onLogout={onLogout}
            />
          }
        >
          <Route index element={<BarberDashboard />} />
          <Route
            path="agenda"
            element={
              <BarberPermissionGuard moduleName="citas" moduleLabel="Agenda de Citas">
                <BarberAgendaPage />
              </BarberPermissionGuard>
            }
          />
          <Route
            path="horarios"
            element={
              <BarberPermissionGuard moduleName="horarios" moduleLabel="Horarios de Trabajo">
                <BarberSchedulesPage />
              </BarberPermissionGuard>
            }
          />
          <Route
            path="novedades"
            element={
              <BarberPermissionGuard moduleName="horarios" moduleLabel="Novedades de Horario">
                <BarberNoveltiesPage />
              </BarberPermissionGuard>
            }
          />
          <Route
            path="paquetes"
            element={
              <BarberPermissionGuard moduleName="servicios" moduleLabel="Catálogo de Paquetes">
                <BarberPackagesPage />
              </BarberPermissionGuard>
            }
          />
          <Route
            path="citas"
            element={
              <BarberPermissionGuard moduleName="citas" moduleLabel="Gestión de Citas">
                <BarberAppointmentsPage />
              </BarberPermissionGuard>
            }
          />
          <Route
            path="reportes"
            element={
              <BarberPermissionGuard moduleName="ventas" moduleLabel="Reportes">
                <BarberReportsPage />
              </BarberPermissionGuard>
            }
          />
          <Route path="perfil" element={<BarberProfilePage />} />
        </Route>

        {/* Redirecciones de conveniencia y compatibilidad */}
        <Route path="/cliente/*" element={<Navigate to="/portal" replace />} />

        {/* Bloqueo y redirección de rutas administrativas manuales */}
        <Route path="/usuarios" element={<AdminManualRedirect targetAdminPath="/dashboard/users" />} />
        <Route path="/roles" element={<AdminManualRedirect targetAdminPath="/dashboard/roles" />} />
        <Route path="/proveedores" element={<AdminManualRedirect targetAdminPath="/dashboard/suppliers" />} />
        <Route path="/compras" element={<AdminManualRedirect targetAdminPath="/dashboard/purchases" />} />
        <Route path="/productos" element={<AdminManualRedirect targetAdminPath="/dashboard/products" />} />
        <Route path="/clientes" element={<AdminManualRedirect targetAdminPath="/dashboard/clients" />} />
        <Route path="/ventas" element={<AdminManualRedirect targetAdminPath="/dashboard/sales" />} />
        <Route path="/configuracion" element={<AdminManualRedirect targetAdminPath="/dashboard/settings" />} />
      </Routes>
    </ErrorBoundary>
  );
}

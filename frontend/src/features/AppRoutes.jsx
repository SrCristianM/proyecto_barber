import { Routes, Route, Navigate } from "react-router";
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
 * Componente Guardián para el rol ADMINISTRADOR.
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
  if (user && Number(user.id_rol) === 1) {
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
  if (user && Number(user.id_rol) === 1) {
    return <Navigate to="/dashboard" replace />;
  }
  if (user && Number(user.id_rol) === 4) {
    return <Navigate to="/portal" replace />;
  }

  return <BarberLayout isDark={isDark} setIsDark={setIsDark} onLogout={onLogout} />;
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
    <Routes>
      {/* Rutas Públicas */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<Login onLogin={onLogin} />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />

      {/* RUTA ADMINISTRATIVA (ROL: ADMINISTRADOR) */}
      <Route
        path="/dashboard"
        element={<AdminRoute isAuthenticated={isAuthenticated} isDark={isDark} setIsDark={setIsDark} />}
      >
        <Route index element={<AdminDashboard />} />
        <Route path="roles" element={<RolesPage />} />
        <Route path="users" element={<UsersPage />} />
        <Route path="barbers" element={<BarbersPage />} />
        <Route path="schedules" element={<SchedulesPage />} />
        <Route path="services" element={<ServicesPage />} />
        <Route path="products" element={<ProductsPage />} />
        <Route path="clients" element={<ClientsPage />} />
        <Route path="suppliers" element={<SuppliersPage />} />
        <Route path="proveedores" element={<SuppliersPage />} />
        <Route path="purchases" element={<PurchasesPage />} />
        <Route path="compras" element={<PurchasesPage />} />
        <Route path="appointments" element={<AppointmentsPage />} />
        <Route path="sales" element={<SalesPage />} />
        <Route path="settings" element={<SettingsPage isDark={isDark} setIsDark={setIsDark} />} />
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
        <Route path="agenda" element={<BarberAgendaPage />} />
        <Route path="horarios" element={<BarberSchedulesPage />} />
        <Route path="novedades" element={<BarberNoveltiesPage />} />
        <Route path="paquetes" element={<BarberPackagesPage />} />
        <Route path="citas" element={<BarberAppointmentsPage />} />
        <Route path="reportes" element={<BarberReportsPage />} />
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
  );
}

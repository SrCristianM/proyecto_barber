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

import { getCurrentUser } from "./auth/services/authService";

/**
 * Componente Guardián para el rol ADMINISTRADOR.
 * Si el usuario no está autenticado, va a /login.
 * Si el usuario es rol CLIENTE (id_rol === 4), se bloquea el acceso administrativo y se redirige a /portal.
 */
function AdminRoute({ isAuthenticated, isDark, setIsDark }) {
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const user = getCurrentUser();
  if (user && Number(user.id_rol) === 4) {
    // Cliente intentando ingresar a módulo administrativo
    return <Navigate to="/portal" replace />;
  }

  return <DashboardLayout isDark={isDark} setIsDark={setIsDark} />;
}

/**
 * Componente Guardián para el rol CLIENTE.
 * Si el usuario no está autenticado, va a /login.
 * Si el usuario es rol ADMINISTRADOR (id_rol === 1), se redirige a /dashboard.
 */
function ClientRoute({ isAuthenticated, isDark, setIsDark, onLogout }) {
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const user = getCurrentUser();
  if (user && Number(user.id_rol) === 1) {
    // Administrador intentando ingresar a portal de cliente
    return <Navigate to="/dashboard" replace />;
  }

  return <ClientLayout isDark={isDark} setIsDark={setIsDark} onLogout={onLogout} />;
}

/**
 * Configuración centralizada de rutas de la aplicación.
 * Coexistencia completa entre la Interfaz Administrativa y el Portal del Cliente.
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

      {/* Redirecciones de conveniencia y compatibilidad */}
      <Route path="/cliente/*" element={<Navigate to="/portal" replace />} />
    </Routes>
  );
}

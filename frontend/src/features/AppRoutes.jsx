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

/**
 * Configuración centralizada de rutas de la aplicación.
 * Separado de App para mantener la arquitectura por features.
 */
export default function AppRoutes({ isDark, setIsDark, isAuthenticated, onLogin }) {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<Login onLogin={onLogin} />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />

      <Route
        path="/dashboard"
        element={isAuthenticated ? <DashboardLayout isDark={isDark} setIsDark={setIsDark} /> : <Navigate to="/login" />}
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
    </Routes>
  );
}

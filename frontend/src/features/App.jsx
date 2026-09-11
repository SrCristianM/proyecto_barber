import { BrowserRouter } from "react-router";
import { useState, useEffect } from "react";
import { Toaster } from "sonner";
import AppRoutes from "./AppRoutes.jsx";

// Purga integral de datos registrados para entrega limpia al cliente (v2)
try {
  const DELIVERY_CLEAN_FLAG = "barber_clean_delivery_v2";
  if (typeof window !== "undefined" && window.localStorage && localStorage.getItem(DELIVERY_CLEAN_FLAG) !== "true") {
    // 1. Módulos Transaccionales
    localStorage.setItem("barber_appointments_db", JSON.stringify([]));
    localStorage.setItem("barber_sales_db", JSON.stringify([]));
    localStorage.setItem("barber_clients_db", JSON.stringify([]));
    localStorage.setItem("barber_purchases_db", JSON.stringify([]));
    localStorage.setItem("barber_novelties_db", JSON.stringify([]));
    localStorage.setItem("tu_turno_client_cart", JSON.stringify([]));

    // 2. Módulo de Proveedores: completamente vacío
    localStorage.setItem("barber_suppliers_db", JSON.stringify([]));

    // 3. Módulo de Horarios: completamente vacío
    localStorage.setItem("barber_schedules_db", JSON.stringify([]));

    // 4. Módulo de Servicios, Categorías y Paquetes: completamente vacíos
    localStorage.setItem("barber_services_db", JSON.stringify([]));
    localStorage.setItem("barber_service_categories_db", JSON.stringify([]));
    localStorage.setItem("barber_packages_db", JSON.stringify([]));

    // 5. Módulo de Productos y Categorías de Producto: completamente vacíos
    localStorage.setItem("barber_products_db", JSON.stringify([]));
    localStorage.setItem("barber_product_categories_db", JSON.stringify([]));

    // 6. Módulo de Barberos: mantener ÚNICAMENTE a Carlos Rodríguez (default)
    const onlyCarlosBarber = [
      {
        id_barbero: 1,
        id_usuario: 4,
        nombre: "Carlos",
        apellido: "Rodríguez",
        correo: "barbero@tuturnobarber.com",
        telefono: "+57 302 345 6789",
        especialidad: "Corte Clásico & Fade",
        imagen_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80",
        estado: 1
      }
    ];
    localStorage.setItem("barber_barbers_db", JSON.stringify(onlyCarlosBarber));

    // 7. Módulo de Usuarios: mantener ÚNICAMENTE Administrador, Recepcionista y Barbero Carlos
    const cleanStaffUsers = [
      {
        id_usuario: 1,
        nombre: "Cristian",
        apellido: "Mazo",
        correo: "cristianmazo957@gmail.com",
        telefono: "+57 300 987 6543",
        id_rol: 1, // Administrador
        estado: 1,
        contrasena: "Admin123*",
        fecha_registro: "2026-01-10 08:00:00"
      },
      {
        id_usuario: 3,
        nombre: "María",
        apellido: "García",
        correo: "maria@example.com",
        telefono: "+57 301 234 5678",
        id_rol: 2, // Recepcionista
        estado: 1,
        contrasena: "Recepcionista123*",
        fecha_registro: "2026-02-20 14:15:00"
      },
      {
        id_usuario: 4,
        nombre: "Carlos",
        apellido: "Rodríguez",
        correo: "barbero@tuturnobarber.com",
        telefono: "+57 302 345 6789",
        id_rol: 3, // Barbero
        estado: 1,
        contrasena: "Barbero123*",
        fecha_registro: "2026-03-10 09:00:00"
      }
    ];
    localStorage.setItem("barber_users_db", JSON.stringify(cleanStaffUsers));

    localStorage.setItem(DELIVERY_CLEAN_FLAG, "true");
  }
} catch {
  // Ignorar errores si localStorage está restringido
}

export default function App() {
  const [isDark, setIsDark] = useState(() => {
    try {
      const raw = localStorage.getItem("barber_settings");
      if (raw) {
        const parsed = JSON.parse(raw);
        if (typeof parsed?.system?.modo_oscuro === "boolean") {
          return parsed.system.modo_oscuro;
        }
      }
      const stored = localStorage.getItem("barber_theme_mode");
      if (stored !== null) {
        return stored === "dark";
      }
    } catch {
      // Ignorar error de parsing
    }
    return false;
  });

  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    try {
      return !!localStorage.getItem("barber_current_user");
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("barber_theme_mode", isDark ? "dark" : "light");
      const raw = localStorage.getItem("barber_settings");
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed?.system) {
          parsed.system.modo_oscuro = isDark;
          localStorage.setItem("barber_settings", JSON.stringify(parsed));
        }
      }
    } catch {
      // Ignorar error de storage
    }
  }, [isDark]);

  return (
    <div className={isDark ? "dark" : ""}>
      <BrowserRouter>
        <AppRoutes
          isDark={isDark}
          setIsDark={setIsDark}
          isAuthenticated={isAuthenticated}
          onLogin={() => setIsAuthenticated(true)}
          onLogout={() => setIsAuthenticated(false)}
        />
      </BrowserRouter>
      <Toaster
        position="top-right"
        richColors
        toastOptions={{
          style: {
            background: "var(--popover)",
            color: "var(--popover-foreground)",
            border: "1px solid var(--border)"
          }
        }}
      />
    </div>
  );
}

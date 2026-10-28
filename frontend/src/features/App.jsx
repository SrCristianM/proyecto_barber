import { BrowserRouter } from "react-router";
import { useState, useEffect, useCallback, useLayoutEffect } from "react";
import { Toaster } from "sonner";
import AppRoutes from "./AppRoutes.jsx";
import { SalonAudioProvider } from "./client/context/SalonAudioContext.jsx";
import { syncCatalogsFromApi } from "./client/services/clientStorageService.js";

// Purga integral de datos registrados para entrega limpia y alineación con app móvil (v3)
try {
  const DELIVERY_CLEAN_FLAG = "barber_clean_delivery_v3";
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

    // 3. Módulo de Horarios: inicializado exclusivamente con los 2 días reales del backend/móvil (Lunes y Martes)
    const initialRealSchedules = [
      {
        id_horario: 1,
        id_barbero: 1,
        dia_semana: "Lunes",
        hora_inicio: "09:00:00",
        hora_fin: "18:00:00",
        fecha_inicio_vigencia: "2026-01-01",
        fecha_fin_vigencia: "2026-12-31",
        estado: 1,
        barbero_nombre: "Carlos Rodríguez"
      },
      {
        id_horario: 2,
        id_barbero: 1,
        dia_semana: "Martes",
        hora_inicio: "09:00:00",
        hora_fin: "18:00:00",
        fecha_inicio_vigencia: "2026-01-01",
        fecha_fin_vigencia: "2026-12-31",
        estado: 1,
        barbero_nombre: "Carlos Rodríguez"
      }
    ];
    localStorage.setItem("barber_schedules_db", JSON.stringify(initialRealSchedules));

    // 4. Módulo de Servicios, Categorías y Paquetes: catálogo inicial de paquetes
    localStorage.setItem("barber_services_db", JSON.stringify([]));
    localStorage.setItem("barber_service_categories_db", JSON.stringify([]));
    const initialDefaultPackages = [
      { id_paquete: 1, nombre: "Paquete Básico", descuento_porcentaje: 10, estado: 1, servicios_ids: [1, 3] },
      { id_paquete: 2, nombre: "Paquete Premium", descuento_porcentaje: 20, estado: 1, servicios_ids: [2, 4] },
      { id_paquete: 3, nombre: "Paquete Especial", descuento_porcentaje: 15, estado: 1, servicios_ids: [1, 2] }
    ];
    localStorage.setItem("barber_packages_db", JSON.stringify(initialDefaultPackages));

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
        imagen_url: null,
        estado: 1,
        calificacion: 0,
        rating: 0,
        total_calificaciones: 0,
        reviewsCount: 0,
        calificaciones_sum: 0
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

  // Sincronizar clases DOM inmediatamente antes del primer pintado (evita saltos/flashes)
  useLayoutEffect(() => {
    if (typeof document !== "undefined") {
      const root = document.documentElement;
      if (isDark) {
        root.classList.add("dark");
        document.body.classList.add("dark");
        root.style.colorScheme = "dark";
      } else {
        root.classList.remove("dark");
        document.body.classList.remove("dark");
        root.style.colorScheme = "light";
      }
    }
  }, [isDark]);

  // Manejo de cambio de tema instantáneo y limpio (cero bloqueos ni pausas en el navegador)
  const handleSetIsDark = useCallback((valueOrUpdater) => {
    setIsDark((prev) => {
      const nextDark = typeof valueOrUpdater === "function" ? valueOrUpdater(prev) : valueOrUpdater;
      if (nextDark === prev) return prev;

      // Sincronizar clases en el DOM de forma inmediata (1 único frame, cero parpadeo)
      if (typeof document !== "undefined") {
        const root = document.documentElement;
        if (nextDark) {
          root.classList.add("dark");
          document.body.classList.add("dark");
          root.style.colorScheme = "dark";
        } else {
          root.classList.remove("dark");
          document.body.classList.remove("dark");
          root.style.colorScheme = "light";
        }
      }

      // Guardar en Storage en microtarea en segundo plano para no demorar la respuesta de la UI
      setTimeout(() => {
        try {
          localStorage.setItem("barber_theme_mode", nextDark ? "dark" : "light");
          const raw = localStorage.getItem("barber_settings");
          if (raw) {
            const parsed = JSON.parse(raw);
            if (parsed?.system) {
              parsed.system.modo_oscuro = nextDark;
              localStorage.setItem("barber_settings", JSON.stringify(parsed));
            }
          }
        } catch {}
      }, 0);

      return nextDark;
    });
  }, []);

  useEffect(() => {
    syncCatalogsFromApi().catch(() => {});
  }, []);

  return (
    <div className={isDark ? "dark" : ""}>
      <BrowserRouter>
        <SalonAudioProvider>
          <AppRoutes
            isDark={isDark}
            setIsDark={handleSetIsDark}
            isAuthenticated={isAuthenticated}
            onLogin={() => setIsAuthenticated(true)}
            onLogout={() => setIsAuthenticated(false)}
          />
        </SalonAudioProvider>
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

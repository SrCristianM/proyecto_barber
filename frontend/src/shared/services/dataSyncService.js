/**
 * @file dataSyncService.js
 * Bus de eventos reactivo para la sincronización de datos entre módulos en Tu Turno Barber.
 * Permite que cuando cualquier módulo cree, edite o elimine una entidad (cliente, producto, servicio,
 * barbero, categoría, paquete, etc.), todos los módulos dependientes se actualicen en tiempo real.
 */

import { useEffect, useCallback } from "react";

export const SYNC_ENTITIES = {
  CLIENTS: "clients",
  BARBERS: "barbers",
  SERVICES: "services",
  PACKAGES: "packages",
  PRODUCTS: "products",
  PRODUCT_CATEGORIES: "product_categories",
  SERVICE_CATEGORIES: "service_categories",
  SUPPLIERS: "suppliers",
  SCHEDULES: "schedules",
  APPOINTMENTS: "appointments",
  SALES: "sales",
  PURCHASES: "purchases",
  USERS: "users",
  ROLES: "roles",
  SUPPLIES: "supplies",
  STATION_SUPPLIES: "station_supplies",
  WAREHOUSE_ITEMS: "warehouse_items"
};

const SYNC_EVENT_NAME = "barber_data_sync";

const syncChannel =
  typeof window !== "undefined" && typeof BroadcastChannel !== "undefined"
    ? new BroadcastChannel("barber_sync_bus")
    : null;

if (syncChannel && typeof window !== "undefined") {
  syncChannel.onmessage = (event) => {
    if (event?.data?.entity) {
      window.dispatchEvent(new CustomEvent(SYNC_EVENT_NAME, { detail: event.data }));
      window.dispatchEvent(new CustomEvent("barber_notification_update", { detail: event.data }));
    }
  };
}

/**
 * Emite una notificación global de cambio en una entidad para que todos los hooks suscritos
 * sincronicen sus catálogos y selectores.
 *
 * @param {string} entity - Nombre de la entidad (e.g. 'clients', 'products')
 * @param {any} [payload] - Datos opcionales creados o modificados
 */
export function notifyDataChange(entity, payload = null) {
  if (typeof window !== "undefined") {
    try {
      const detail = {
        entity,
        payload,
        timestamp: Date.now()
      };
      window.dispatchEvent(new CustomEvent(SYNC_EVENT_NAME, { detail }));
      window.dispatchEvent(new CustomEvent("barber_notification_update", { detail }));
      if (syncChannel) {
        syncChannel.postMessage(detail);
      }
    } catch (err) {
      console.warn("[dataSyncService] Error al notificar cambio:", err);
    }
  }
}

/**
 * Hook de React para suscribirse a cambios de una o más entidades.
 *
 * @param {string|string[]} targetEntities - Entidad o arreglo de entidades a escuchar ('*' para todas)
 * @param {Function} onSync - Callback invocado cuando ocurre un cambio en alguna de las entidades
 */
export function useDataSync(targetEntities, onSync) {
  const handler = useCallback(
    (event) => {
      const detail = event?.detail;
      if (!detail || !detail.entity) return;

      const targets = Array.isArray(targetEntities)
        ? targetEntities
        : [targetEntities];

      if (targets.includes("*") || targets.includes(detail.entity)) {
        if (typeof onSync === "function") {
          onSync(detail);
        }
      }
    },
    [targetEntities, onSync]
  );

  useEffect(() => {
    if (typeof window === "undefined") return;

    window.addEventListener(SYNC_EVENT_NAME, handler);
    return () => {
      window.removeEventListener(SYNC_EVENT_NAME, handler);
    };
  }, [handler]);
}

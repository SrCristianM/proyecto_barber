import { Router } from "express";
import { InventoryStationController } from "../controllers/inventoryStation.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/rbac.middleware.js";
import { ROLES } from "../config/constants.js";

const router = Router();

// ==========================================
// 1. MÉTRICAS Y ALERTAS (Admin & Barbero)
// ==========================================
router.get(
  "/metrics",
  authenticate,
  authorizeRoles(ROLES.ADMIN, ROLES.RECEPCIONISTA, ROLES.BARBERO),
  InventoryStationController.getPerformanceMetrics
);

router.get(
  "/history",
  authenticate,
  authorizeRoles(ROLES.ADMIN, ROLES.RECEPCIONISTA, ROLES.BARBERO),
  InventoryStationController.getRestockHistory
);

// ==========================================
// 2. ESTACIONES DE TRABAJO (MODELO SEMÁFORO)
// ==========================================
// Vista personal del Barbero ("Mi Puesto / Mis Insumos")
router.get(
  "/my-station",
  authenticate,
  authorizeRoles(ROLES.ADMIN, ROLES.BARBERO),
  InventoryStationController.getMyStation
);

// Lista global de insumos por estación (Admin / Recepción)
router.get(
  "/stations",
  authenticate,
  authorizeRoles(ROLES.ADMIN, ROLES.RECEPCIONISTA, ROLES.BARBERO),
  InventoryStationController.getAllStationItems
);

// Asignar un insumo nuevo a la estación de un barbero (Admin)
router.post(
  "/stations",
  authenticate,
  authorizeRoles(ROLES.ADMIN, ROLES.RECEPCIONISTA),
  InventoryStationController.assignItem
);

// Barbero solicita reposición de insumos (selección por checkbox en lote)
router.post(
  "/stations/request-restock",
  authenticate,
  authorizeRoles(ROLES.ADMIN, ROLES.BARBERO),
  InventoryStationController.requestRestockBatch
);

// Barbero o Admin actualiza el estado del semáforo (VERDE, AMARILLO, ROJO)
router.patch(
  "/stations/:id/status",
  authenticate,
  authorizeRoles(ROLES.ADMIN, ROLES.BARBERO),
  InventoryStationController.updateStatus
);

// Aprobar reposición y descontar stock de bodega (Admin)
router.post(
  "/stations/:id/reponer",
  authenticate,
  authorizeRoles(ROLES.ADMIN, ROLES.RECEPCIONISTA),
  InventoryStationController.approveRestock
);

// Retirar insumo de una estación (Admin)
router.delete(
  "/stations/:id",
  authenticate,
  authorizeRoles(ROLES.ADMIN),
  InventoryStationController.removeStationItem
);

// ==========================================
// 3. BODEGA GENERAL (STOCK Y CATÁLOGO DE INSUMOS)
// ==========================================
// Entradas de mercancía desde proveedor (debe ir antes de /warehouse/:id)
router.post(
  "/warehouse/entries",
  authenticate,
  authorizeRoles(ROLES.ADMIN, ROLES.RECEPCIONISTA),
  InventoryStationController.registerStockEntry
);

router.get(
  "/warehouse/entries",
  authenticate,
  authorizeRoles(ROLES.ADMIN, ROLES.RECEPCIONISTA),
  InventoryStationController.getStockEntries
);

router.post(
  "/warehouse/entries/:id/cancel",
  authenticate,
  authorizeRoles(ROLES.ADMIN, ROLES.RECEPCIONISTA),
  InventoryStationController.cancelStockEntry
);


router.get(
  "/warehouse/movements",
  authenticate,
  authorizeRoles(ROLES.ADMIN, ROLES.RECEPCIONISTA, ROLES.BARBERO),
  InventoryStationController.getWarehouseMovements
);

router.get(
  "/warehouse",
  authenticate,
  authorizeRoles(ROLES.ADMIN, ROLES.RECEPCIONISTA, ROLES.BARBERO),
  InventoryStationController.getWarehouseItems
);

router.get(
  "/warehouse/:id",
  authenticate,
  authorizeRoles(ROLES.ADMIN, ROLES.RECEPCIONISTA),
  InventoryStationController.getWarehouseItemById
);

router.post(
  "/warehouse",
  authenticate,
  authorizeRoles(ROLES.ADMIN, ROLES.RECEPCIONISTA),
  InventoryStationController.createWarehouseItem
);

router.put(
  "/warehouse/:id",
  authenticate,
  authorizeRoles(ROLES.ADMIN, ROLES.RECEPCIONISTA),
  InventoryStationController.updateWarehouseItem
);

router.delete(
  "/warehouse/:id",
  authenticate,
  authorizeRoles(ROLES.ADMIN),
  InventoryStationController.deleteWarehouseItem
);

// ==========================================
// 4. PROVEEDORES
// ==========================================
router.get(
  "/suppliers",
  authenticate,
  authorizeRoles(ROLES.ADMIN, ROLES.RECEPCIONISTA),
  InventoryStationController.getSuppliers
);

router.get(
  "/suppliers/:id",
  authenticate,
  authorizeRoles(ROLES.ADMIN, ROLES.RECEPCIONISTA),
  InventoryStationController.getSupplierById
);

router.post(
  "/suppliers",
  authenticate,
  authorizeRoles(ROLES.ADMIN),
  InventoryStationController.createSupplier
);

router.put(
  "/suppliers/:id",
  authenticate,
  authorizeRoles(ROLES.ADMIN),
  InventoryStationController.updateSupplier
);

router.delete(
  "/suppliers/:id",
  authenticate,
  authorizeRoles(ROLES.ADMIN),
  InventoryStationController.deleteSupplier
);

export default router;

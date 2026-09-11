import { executeQuery, isDatabaseConnected } from "../config/db.js";
import { mockStore } from "../config/mockStore.js";

export class DashboardRepository {
  static async getAdminMetrics() {
    const today = new Date().toISOString().split("T")[0];

    if (isDatabaseConnected()) {
      // 1. Total ventas hoy
      const [salesToday] = await executeQuery(
        `SELECT COALESCE(SUM(total), 0) as total_ventas, COUNT(*) as conteo_ventas FROM venta WHERE DATE(fecha) = ? AND estado = 'Activa'`,
        [today]
      );

      // 2. Total citas hoy
      const [citasToday] = await executeQuery(
        `SELECT COUNT(*) as total_citas,
                SUM(CASE WHEN estado = 'Completada' THEN 1 ELSE 0 END) as completadas,
                SUM(CASE WHEN estado = 'Programada' THEN 1 ELSE 0 END) as programadas,
                SUM(CASE WHEN estado = 'Cancelada' THEN 1 ELSE 0 END) as canceladas
         FROM cita WHERE fecha = ?`,
        [today]
      );

      // 3. Clientes activos
      const [clientsCount] = await executeQuery(`SELECT COUNT(*) as total_clientes FROM cliente WHERE estado = 1`);

      // 4. Productos con stock bajo (<= 5)
      const [lowStockCount] = await executeQuery(`SELECT COUNT(*) as total_bajo_stock FROM producto WHERE stock <= 5 AND estado = 1`);

      // 5. Barberos activos
      const [barbersCount] = await executeQuery(`SELECT COUNT(*) as total_barberos FROM barbero WHERE estado = 1`);

      return {
        ventas_hoy: Number(salesToday.total_ventas),
        conteo_ventas_hoy: Number(salesToday.conteo_ventas),
        citas_hoy: Number(citasToday.total_citas),
        citas_programadas_hoy: Number(citasToday.programadas || 0),
        citas_completadas_hoy: Number(citasToday.completadas || 0),
        citas_canceladas_hoy: Number(citasToday.canceladas || 0),
        clientes_activos: Number(clientsCount.total_clientes),
        productos_bajo_stock: Number(lowStockCount.total_bajo_stock),
        barberos_activos: Number(barbersCount.total_barberos)
      };
    }

    // Fallback store
    const todaySales = mockStore.ventas.filter((v) => v.fecha.startsWith(today) && v.estado === "Activa");
    const totalVentasHoy = todaySales.reduce((acc, curr) => acc + Number(curr.total), 0);

    const todayCitas = mockStore.citas.filter((c) => c.fecha === today);
    const completadas = todayCitas.filter((c) => c.estado === "Completada").length;
    const programadas = todayCitas.filter((c) => c.estado === "Programada").length;
    const canceladas = todayCitas.filter((c) => c.estado === "Cancelada").length;

    const clientesActivos = mockStore.clientes.filter((c) => c.estado === 1).length;
    const productosBajoStock = mockStore.productos.filter((p) => p.stock <= 5 && p.estado === 1).length;
    const barberosActivos = mockStore.barberos.filter((b) => b.estado === 1).length;

    return {
      ventas_hoy: totalVentasHoy,
      conteo_ventas_hoy: todaySales.length,
      citas_hoy: todayCitas.length,
      citas_programadas_hoy: programadas,
      citas_completadas_hoy: completadas,
      citas_canceladas_hoy: canceladas,
      clientes_activos: clientesActivos,
      productos_bajo_stock: productosBajoStock,
      barberos_activos: barberosActivos
    };
  }

  static async getBarberMetrics(barberId) {
    const today = new Date().toISOString().split("T")[0];
    const bId = Number(barberId);

    if (isDatabaseConnected()) {
      const [citas] = await executeQuery(
        `SELECT COUNT(*) as total_citas_hoy,
                SUM(CASE WHEN estado = 'Completada' THEN 1 ELSE 0 END) as completadas,
                SUM(CASE WHEN estado = 'Programada' THEN 1 ELSE 0 END) as pendientes
         FROM cita WHERE id_barbero = ? AND fecha = ?`,
        [bId, today]
      );

      const [ganancias] = await executeQuery(
        `SELECT COALESCE(SUM(cd.precio), 0) as ganancias_hoy
         FROM cita c
         JOIN cita_detalle cd ON c.id_cita = cd.id_cita
         WHERE c.id_barbero = ? AND c.fecha = ? AND c.estado = 'Completada'`,
        [bId, today]
      );

      return {
        citas_hoy: Number(citas.total_citas_hoy),
        citas_completadas: Number(citas.completadas || 0),
        citas_pendientes: Number(citas.pendientes || 0),
        ganancias_hoy: Number(ganancias.ganancias_hoy)
      };
    }

    const barberCitasHoy = mockStore.citas.filter((c) => c.id_barbero === bId && c.fecha === today);
    const completadas = barberCitasHoy.filter((c) => c.estado === "Completada");
    const pendientes = barberCitasHoy.filter((c) => c.estado === "Programada").length;

    const gananciasHoy = completadas.reduce((acc, curr) => {
      const details = mockStore.cita_detalles.filter((d) => d.id_cita === curr.id_cita);
      return acc + details.reduce((sum, d) => sum + Number(d.precio), 0);
    }, 0);

    return {
      citas_hoy: barberCitasHoy.length,
      citas_completadas: completadas.length,
      citas_pendientes: pendientes,
      ganancias_hoy: gananciasHoy
    };
  }
}

export { DashboardRepository as DashboardModel };
export default DashboardRepository;

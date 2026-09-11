import { executeQuery, isDatabaseConnected } from "../config/db.js";
import { mockStore } from "../config/mockStore.js";

export class ProductsRepository {
  static async findAll({ search = "", status = "all", category = "all", lowStock = false } = {}) {
    if (isDatabaseConnected()) {
      let sql = `
        SELECT p.id_producto, p.nombre, p.id_categoria_producto, p.precio, p.stock, p.imagen_url, p.estado,
               cp.nombre as categoria
        FROM producto p
        JOIN categoria_producto cp ON p.id_categoria_producto = cp.id_categoria_producto
        WHERE 1=1
      `;
      const params = [];

      if (search) {
        sql += ` AND (LOWER(p.nombre) LIKE ? OR LOWER(cp.nombre) LIKE ?)`;
        const s = `%${search.toLowerCase()}%`;
        params.push(s, s);
      }

      if (status !== "all") {
        sql += ` AND p.estado = ?`;
        params.push(Number(status));
      }

      if (category !== "all") {
        sql += ` AND p.id_categoria_producto = ?`;
        params.push(Number(category));
      }

      if (lowStock) {
        sql += ` AND p.stock <= 5`;
      }

      sql += ` ORDER BY p.nombre ASC`;
      return await executeQuery(sql, params);
    }

    return mockStore.productos
      .map((p) => {
        const cat = mockStore.categoria_productos.find((c) => c.id_categoria_producto === p.id_categoria_producto);
        return {
          ...p,
          categoria: cat ? cat.nombre : "Sin Categoría"
        };
      })
      .filter((p) => {
        const str = (search || "").toLowerCase().trim();
        const matchesSearch =
          str === "" || p.nombre.toLowerCase().includes(str) || p.categoria.toLowerCase().includes(str);

        const matchesStatus =
          status === "all" ||
          (status === "1" && p.estado === 1) ||
          (status === "0" && p.estado === 0);

        const matchesCategory = category === "all" || String(p.id_categoria_producto) === String(category);
        const matchesLowStock = !lowStock || p.stock <= 5;

        return matchesSearch && matchesStatus && matchesCategory && matchesLowStock;
      });
  }

  static async findById(id) {
    const productId = Number(id);

    if (isDatabaseConnected()) {
      const sql = `
        SELECT p.id_producto, p.nombre, p.id_categoria_producto, p.precio, p.stock, p.imagen_url, p.estado,
               cp.nombre as categoria
        FROM producto p
        JOIN categoria_producto cp ON p.id_categoria_producto = cp.id_categoria_producto
        WHERE p.id_producto = ?
        LIMIT 1
      `;
      const rows = await executeQuery(sql, [productId]);
      return rows && rows.length > 0 ? rows[0] : null;
    }

    const p = mockStore.productos.find((prod) => prod.id_producto === productId);
    if (!p) return null;
    const cat = mockStore.categoria_productos.find((c) => c.id_categoria_producto === p.id_categoria_producto);
    return {
      ...p,
      categoria: cat ? cat.nombre : "Sin Categoría"
    };
  }

  static async create(productData) {
    if (isDatabaseConnected()) {
      const sql = `
        INSERT INTO producto (nombre, id_categoria_producto, precio, stock, imagen_url, estado)
        VALUES (?, ?, ?, ?, ?, ?)
      `;
      const result = await executeQuery(sql, [
        productData.nombre,
        Number(productData.id_categoria_producto),
        Number(productData.precio),
        Number(productData.stock || 0),
        productData.imagen_url || null,
        productData.estado !== undefined ? productData.estado : 1
      ]);
      return result.insertId;
    }

    const nextId = Math.max(...mockStore.productos.map((p) => p.id_producto || 0), 0) + 1;
    const newProduct = {
      id_producto: nextId,
      nombre: productData.nombre,
      id_categoria_producto: Number(productData.id_categoria_producto),
      precio: Number(productData.precio),
      stock: Number(productData.stock || 0),
      imagen_url: productData.imagen_url || "",
      estado: productData.estado !== undefined ? productData.estado : 1
    };
    mockStore.productos.push(newProduct);
    mockStore.saveToFile();
    return nextId;
  }

  static async update(id, productData) {
    const productId = Number(id);

    if (isDatabaseConnected()) {
      const fields = [];
      const values = [];

      if (productData.nombre !== undefined) { fields.push("nombre = ?"); values.push(productData.nombre); }
      if (productData.id_categoria_producto !== undefined) { fields.push("id_categoria_producto = ?"); values.push(Number(productData.id_categoria_producto)); }
      if (productData.precio !== undefined) { fields.push("precio = ?"); values.push(Number(productData.precio)); }
      if (productData.stock !== undefined) { fields.push("stock = ?"); values.push(Number(productData.stock)); }
      if (productData.imagen_url !== undefined) { fields.push("imagen_url = ?"); values.push(productData.imagen_url); }
      if (productData.estado !== undefined) { fields.push("estado = ?"); values.push(productData.estado); }

      if (fields.length === 0) return true;
      values.push(productId);

      const sql = `UPDATE producto SET ${fields.join(", ")} WHERE id_producto = ?`;
      await executeQuery(sql, values);
      return true;
    }

    const p = mockStore.productos.find((prod) => prod.id_producto === productId);
    if (!p) return false;
    if (productData.nombre !== undefined) p.nombre = productData.nombre;
    if (productData.id_categoria_producto !== undefined) p.id_categoria_producto = Number(productData.id_categoria_producto);
    if (productData.precio !== undefined) p.precio = Number(productData.precio);
    if (productData.stock !== undefined) p.stock = Number(productData.stock);
    if (productData.imagen_url !== undefined) p.imagen_url = productData.imagen_url;
    if (productData.estado !== undefined) p.estado = productData.estado;
    mockStore.saveToFile();

    return true;
  }

  static async updateStock(id, deltaQuantity, connection = null) {
    const productId = Number(id);

    if (isDatabaseConnected()) {
      const runner = connection || (await (await import("../config/db.js")).getDatabaseConnection());
      const sql = `UPDATE producto SET stock = stock + ? WHERE id_producto = ?`;
      await runner.execute(sql, [Number(deltaQuantity), productId]);
      return true;
    }

    const p = mockStore.productos.find((prod) => prod.id_producto === productId);
    if (p) {
      p.stock += Number(deltaQuantity);
      mockStore.saveToFile();
      return true;
    }
    return false;
  }

  static async toggleStatus(id) {
    const productId = Number(id);
    const p = await this.findById(productId);
    if (!p) return null;

    const newStatus = p.estado === 1 ? 0 : 1;

    if (isDatabaseConnected()) {
      await executeQuery(`UPDATE producto SET estado = ? WHERE id_producto = ?`, [newStatus, productId]);
      return newStatus;
    }

    const target = mockStore.productos.find((prod) => prod.id_producto === productId);
    if (target) target.estado = newStatus;
    mockStore.saveToFile();
    return newStatus;
  }

  static async delete(id) {
    const productId = Number(id);
    if (isDatabaseConnected()) {
      await executeQuery(`DELETE FROM producto WHERE id_producto = ?`, [productId]);
      return true;
    }
    mockStore.productos = mockStore.productos.filter((p) => p.id_producto !== productId);
    mockStore.saveToFile();
    return true;
  }

  static async findAllCategories() {
    if (isDatabaseConnected()) {
      const sql = `SELECT * FROM categoria_producto WHERE estado = 1 ORDER BY nombre ASC`;
      return await executeQuery(sql);
    }
    return mockStore.categoria_productos.filter((c) => c.estado === 1);
  }

  static async createCategory(nombre) {
    if (isDatabaseConnected()) {
      const sql = `INSERT INTO categoria_producto (nombre, estado) VALUES (?, 1)`;
      const res = await executeQuery(sql, [nombre]);
      return res.insertId;
    }
    const nextId = Math.max(...mockStore.categoria_productos.map((c) => c.id_categoria_producto || 0), 0) + 1;
    mockStore.categoria_productos.push({ id_categoria_producto: nextId, nombre, estado: 1 });
    return nextId;
  }
}

export { ProductsRepository as ProductsModel };
export default ProductsRepository;

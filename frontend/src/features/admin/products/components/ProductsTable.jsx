import { Package, Eye, Power, Edit, Trash2 } from "lucide-react";
import SortHeader from "../../shared/components/SortHeader";
import { CATEGORIAS_PRODUCTO } from "../../../../shared/types/database";

export default function ProductsTable({
  products,
  totalCount,
  sortField,
  sortDir,
  onSort,
  onDetail,
  onToggleStatus,
  onEdit,
  onDelete
}) {
  const getCategoryName = (id_cat) => {
    const c = CATEGORIAS_PRODUCTO.find((cat) => cat.id_categoria_producto === Number(id_cat));
    return c ? c.nombre : "Sin Categoría";
  };

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-3 px-4">
                <SortHeader label="Producto" field="nombre" current={sortField} dir={sortDir} onSort={onSort} />
              </th>
              <th className="text-left py-3 px-4">
                <SortHeader label="Categoría" field="id_categoria_producto" current={sortField} dir={sortDir} onSort={onSort} />
              </th>
              <th className="text-left py-3 px-4">
                <SortHeader label="Stock" field="stock" current={sortField} dir={sortDir} onSort={onSort} />
              </th>
              <th className="text-left py-3 px-4">
                <SortHeader label="Precio" field="precio" current={sortField} dir={sortDir} onSort={onSort} />
              </th>
              <th className="text-left py-3 px-4">
                <SortHeader label="Estado" field="estado" current={sortField} dir={sortDir} onSort={onSort} />
              </th>
              <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id_producto} className="border-b border-border hover:bg-accent/50 transition-colors">
                <td className="py-4 px-4">
                  <div className="flex items-center gap-3">
                    {product.imagen_url ? (
                      <img
                        src={product.imagen_url}
                        alt={product.nombre}
                        className="w-10 h-10 rounded-lg object-cover border border-primary/30"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                        <Package className="h-5 w-5 text-primary" />
                      </div>
                    )}
                    <div>
                      <p className="font-medium text-foreground">{product.nombre}</p>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-4 text-foreground">{getCategoryName(product.id_categoria_producto)}</td>
                <td className="py-4 px-4">
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      product.stock === 0
                        ? "bg-destructive/10 text-destructive font-semibold"
                        : product.stock <= 5
                        ? "bg-warning/10 text-warning font-semibold"
                        : "text-foreground"
                    }`}
                  >
                    {product.stock} unidades
                  </span>
                </td>
                <td className="py-4 px-4 font-semibold text-foreground">${Number(product.precio).toLocaleString()}</td>
                <td className="py-4 px-4">
                  <span
                    className={`px-3 py-1 text-sm rounded-full ${
                      product.estado === 1 ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {product.estado === 1 ? "Activo" : "Inactivo"}
                  </span>
                </td>
                <td className="py-4 px-4">
                  <div className="flex items-center justify-end gap-2">
                    <button onClick={() => onDetail(product)} className="p-2 hover:bg-background rounded-lg text-foreground" title="Ver detalle">
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => onToggleStatus(product.id_producto)}
                      className={`p-2 hover:bg-background rounded-lg ${product.estado === 1 ? "text-success" : "text-muted-foreground"}`}
                      title={product.estado === 1 ? "Desactivar" : "Activar"}
                    >
                      <Power className="h-4 w-4" />
                    </button>
                    <button onClick={() => onEdit(product)} className="p-2 hover:bg-background rounded-lg text-primary" title="Editar">
                      <Edit className="h-4 w-4" />
                    </button>
                    <button onClick={() => onDelete(product)} className="p-2 hover:bg-background rounded-lg text-destructive" title="Eliminar">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
        <p className="text-sm text-muted-foreground">
          Mostrando {products.length} de {totalCount} productos
        </p>
        <div className="flex items-center gap-2">
          <button className="px-3 py-1 border border-border rounded hover:bg-accent text-foreground">Anterior</button>
          <button className="px-3 py-1 bg-primary text-primary-foreground rounded">1</button>
          <button className="px-3 py-1 border border-border rounded hover:bg-accent text-foreground">Siguiente</button>
        </div>
      </div>
    </>
  );
}

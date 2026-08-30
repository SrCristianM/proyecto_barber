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
              <tr
                key={product.id_producto}
                id={`row-prd-${product.id_producto}`}
                data-highlight-id={`prd-${product.id_producto}`}
                className="border-b border-border hover:bg-accent/50 transition-colors"
              >
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
                <td className="py-3.5 px-4">
                  <div className="space-y-1.5 min-w-[125px]">
                    <div className="flex items-center justify-between text-xs">
                      <span
                        className={`font-bold ${
                          product.stock === 0
                            ? "text-destructive"
                            : product.stock <= 4
                            ? "text-amber-500"
                            : "text-foreground"
                        }`}
                      >
                        {product.stock} uds
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        {product.stock === 0 ? "Agotado" : product.stock <= 4 ? "Crítico" : "Óptimo"}
                      </span>
                    </div>
                    {/* Barra de nivel de stock animada */}
                    <div className="w-24 h-1.5 bg-secondary/80 rounded-full overflow-hidden border border-border/50">
                      <div
                        className={`h-full rounded-full transition-all ${
                          product.stock === 0
                            ? "w-0"
                            : product.stock <= 4
                            ? "w-1/4 loyalty-progress-bronze"
                            : product.stock <= 10
                            ? "w-3/5 loyalty-progress-silver"
                            : "w-full loyalty-progress-gold"
                        }`}
                      />
                    </div>
                  </div>
                </td>
                <td className="py-3.5 px-4 font-bold text-foreground text-sm font-mono">${Number(product.precio).toLocaleString("es-CO")}</td>
                <td className="py-3.5 px-4">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 text-xs font-bold rounded-full border ${
                      product.estado === 1 ? "badge-glow-success" : "badge-glow-destructive"
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
                      onClick={() => onToggleStatus(product)}
                      className={`p-2 hover:bg-background rounded-lg transition-colors ${product.estado === 1 ? "text-success" : "text-muted-foreground"}`}
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

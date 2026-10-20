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
      <div className="overflow-x-auto -mx-1 sm:mx-0">
        <table className="w-full min-w-[500px] md:min-w-0 md:w-full lg:min-w-[680px]">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-2 px-2 md:px-3 lg:px-4 sm:py-3">
                <SortHeader label="Producto" field="nombre" current={sortField} dir={sortDir} onSort={onSort} />
              </th>
              <th className="text-left py-2 px-2 md:px-3 lg:px-4 sm:py-3">
                <SortHeader label="Categoría" field="id_categoria_producto" current={sortField} dir={sortDir} onSort={onSort} />
              </th>
              <th className="text-left py-2 px-2 md:px-3 lg:px-4 sm:py-3">
                <SortHeader label="Stock" field="stock" current={sortField} dir={sortDir} onSort={onSort} />
              </th>
              <th className="text-left py-2 px-2 md:px-3 lg:px-4 sm:py-3">
                <SortHeader label="Precio" field="precio" current={sortField} dir={sortDir} onSort={onSort} />
              </th>
              <th className="text-left py-2 px-2 md:px-3 lg:px-4 sm:py-3">
                <SortHeader label="Estado" field="estado" current={sortField} dir={sortDir} onSort={onSort} />
              </th>
              <th className="text-right py-2 px-2 md:px-3 lg:px-4 sm:py-3 text-xs sm:text-sm font-medium text-muted-foreground whitespace-nowrap">Acciones</th>
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
                <td className="py-2.5 px-2 sm:py-4 sm:px-4">
                  <div className="flex items-center gap-2 sm:gap-3">
                    {product.imagen_url ? (
                      <img
                        src={product.imagen_url}
                        alt={product.nombre}
                        className="w-7 h-7 sm:w-10 sm:h-10 rounded-md sm:rounded-lg object-cover border border-primary/30 shrink-0"
                      />
                    ) : (
                      <div className="w-7 h-7 sm:w-10 sm:h-10 bg-primary/10 rounded-md sm:rounded-lg flex items-center justify-center shrink-0">
                        <Package className="h-3.5 w-3.5 sm:h-5 sm:w-5 text-primary" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="font-medium text-foreground text-xs sm:text-sm line-clamp-2 leading-tight max-w-[110px] sm:max-w-none">
                        {product.nombre}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="py-2.5 px-2 sm:py-4 sm:px-4 text-foreground text-xs sm:text-sm whitespace-nowrap">
                  {getCategoryName(product.id_categoria_producto)}
                </td>
                <td className="py-2 px-2 sm:py-3.5 sm:px-4">
                  <div className="space-y-1 min-w-[75px] sm:min-w-[125px]">
                    <div className="flex items-center justify-between text-[11px] sm:text-xs">
                      <span
                        className={`font-bold ${
                          product.stock === 0
                            ? "text-destructive"
                            : product.stock <= 4
                            ? "text-amber-500"
                            : "text-foreground"
                        }`}
                      >
                        {product.stock} <span className="font-normal text-[10px] sm:text-xs text-muted-foreground">uds</span>
                      </span>
                      <span className="text-[9px] sm:text-[10px] text-muted-foreground">
                        {product.stock === 0 ? "Agotado" : product.stock <= 4 ? "Crítico" : "Óptimo"}
                      </span>
                    </div>
                    {/* Barra de nivel de stock animada */}
                    <div className="w-14 sm:w-24 h-1 sm:h-1.5 bg-secondary/80 rounded-full overflow-hidden border border-border/50">
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
                <td className="py-2.5 px-2 sm:py-3.5 sm:px-4 font-bold text-foreground text-xs sm:text-sm font-mono whitespace-nowrap">
                  ${Number(product.precio).toLocaleString("es-CO")}
                </td>
                <td className="py-2.5 px-2 sm:py-3.5 sm:px-4">
                  <span
                    className={`inline-flex items-center px-1.5 py-0.5 sm:px-2.5 sm:py-0.5 text-[10px] sm:text-xs font-bold rounded-full border whitespace-nowrap ${
                      product.estado === 1 ? "badge-glow-success" : "badge-glow-destructive"
                    }`}
                  >
                    {product.estado === 1 ? "Activo" : "Inactivo"}
                  </span>
                </td>
                <td className="py-2.5 px-2 sm:py-4 sm:px-4">
                  <div className="flex items-center justify-end gap-1 sm:gap-2">
                    <button onClick={() => onDetail(product)} className="p-1 sm:p-2 hover:bg-background rounded-md sm:rounded-lg text-foreground cursor-pointer" title="Ver detalle">
                      <Eye className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    </button>
                    {onToggleStatus && (
                      <button
                        onClick={() => onToggleStatus(product)}
                        className={`p-1 sm:p-2 hover:bg-background rounded-md sm:rounded-lg transition-colors cursor-pointer ${product.estado === 1 ? "text-success" : "text-muted-foreground"}`}
                        title={product.estado === 1 ? "Desactivar" : "Activar"}
                      >
                        <Power className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      </button>
                    )}
                    {onEdit && (
                      <button onClick={() => onEdit(product)} className="p-1 sm:p-2 hover:bg-background rounded-md sm:rounded-lg text-primary cursor-pointer" title="Editar">
                        <Edit className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      </button>
                    )}
                    {onDelete && (
                      <button onClick={() => onDelete(product)} className="p-1 sm:p-2 hover:bg-background rounded-md sm:rounded-lg text-destructive cursor-pointer" title="Eliminar">
                        <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-border">
        <p className="text-xs sm:text-sm text-muted-foreground">
          Mostrando {products.length} de {totalCount} productos
        </p>
        <div className="flex items-center gap-1.5 sm:gap-2">
          <button className="px-2.5 py-1 text-xs sm:text-sm border border-border rounded-md hover:bg-accent text-foreground cursor-pointer">Anterior</button>
          <button className="px-2.5 py-1 text-xs sm:text-sm bg-primary text-primary-foreground rounded-md font-semibold cursor-pointer">1</button>
          <button className="px-2.5 py-1 text-xs sm:text-sm border border-border rounded-md hover:bg-accent text-foreground cursor-pointer">Siguiente</button>
        </div>
      </div>
    </>
  );
}

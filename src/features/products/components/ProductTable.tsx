import { Link, useLocation } from 'react-router-dom'
import { formatCurrency } from '../../../shared/utils/currency'
import {
  isProductCategory,
  PRODUCT_CATEGORY_LABELS,
} from '../constants/productCategories'
import type { Product } from '../types/product'
import { ProductStatusBadge } from './ProductStatusBadge'

type ProductTableProps = {
  products: Product[]
  onDelete: (product: Product) => void
}

export function ProductTable({ products, onDelete }: ProductTableProps) {
  const location = useLocation()
  const returnPath = `${location.pathname}${location.search}`

  return (
    <div className="product-table-wrapper">
      <table className="product-table">
        <caption className="sr-only">Lista de produtos encontrados</caption>
        <thead>
          <tr>
            <th scope="col">Nome</th>
            <th scope="col">Categoria</th>
            <th scope="col">Preço</th>
            <th scope="col">Estoque</th>
            <th scope="col">Status</th>
            <th scope="col" className="product-table__actions-heading">
              Ações
            </th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product.id}>
              <th scope="row" className="product-table__name">
                {product.name}
              </th>
              <td>
                {isProductCategory(product.category)
                  ? PRODUCT_CATEGORY_LABELS[product.category]
                  : product.category}
              </td>
              <td className="product-table__price">
                {formatCurrency(product.price)}
              </td>
              <td>
                <span
                  className={
                    product.stock === 0
                      ? 'stock stock--empty'
                      : 'stock stock--available'
                  }
                >
                  {product.stock === 0
                    ? 'Sem estoque'
                    : `${product.stock} disponíveis`}
                </span>
              </td>
              <td>
                <ProductStatusBadge active={product.active} />
              </td>
              <td>
                <div className="table-actions">
                  <Link
                    className="table-action"
                    to={`/products/${product.id}`}
                    state={{ from: returnPath }}
                    aria-label={`Visualizar ${product.name}`}
                  >
                    Visualizar
                  </Link>
                  <Link
                    className="table-action"
                    to={`/products/${product.id}/edit`}
                    state={{ from: returnPath }}
                    aria-label={`Editar ${product.name}`}
                  >
                    Editar
                  </Link>
                  <button
                    className="table-action table-action--danger"
                    type="button"
                    aria-label={`Excluir ${product.name}`}
                    onClick={() => onDelete(product)}
                  >
                    Excluir
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

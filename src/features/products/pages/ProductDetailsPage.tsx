import { useRef, useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'

import { ConfirmDialog } from '../../../shared/components/ConfirmDialog'
import { LoadingState } from '../../../shared/components/LoadingState'
import { formatCurrency } from '../../../shared/utils/currency'
import { useNavigationSuccessMessage } from '../../../shared/hooks/useNavigationSuccessMessage'
import { getProductReturnPath } from '../../../shared/utils/navigationState'
import {
  useDeleteProductMutation,
  useProductQuery,
} from '../api/productQueries'
import { ProductStatusBadge } from '../components/ProductStatusBadge'
import { ProductErrorState } from '../components/ProductErrorState'
import {
  getProductCategoryLabel,
} from '../constants/productCategories'
import '../styles/products.css'
import { parseProductId } from '../utils/productId'

export function ProductDetailsPage() {
  const { productId: productIdParam } = useParams()
  const productId = parseProductId(productIdParam)
  const location = useLocation()
  const navigate = useNavigate()
  const [returnPath] = useState(() => getProductReturnPath(location.state))
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const deleteInFlightRef = useRef(false)
  const successMessage = useNavigationSuccessMessage()
  const productQuery = useProductQuery(productId)
  const deleteMutation = useDeleteProductMutation()

  if (productId === null) {
    return (
      <ProductErrorState
        title="Produto inválido"
        message="O endereço informado não possui um identificador de produto válido."
        returnPath={returnPath}
      />
    )
  }

  if (productQuery.isPending) {
    return <LoadingState message="Carregando detalhes do produto..." />
  }

  if (productQuery.isError) {
    const notFound = productQuery.error.status === 404

    return (
      <ProductErrorState
        title={notFound ? 'Produto não encontrado' : 'Não foi possível carregar o produto'}
        message={notFound ? 'O produto pode ter sido excluído.' : productQuery.error.message}
        returnPath={returnPath}
        onRetry={notFound ? undefined : () => void productQuery.refetch()}
      />
    )
  }

  const product = productQuery.data
  const category = getProductCategoryLabel(product.category)

  const handleDelete = async () => {
    if (deleteInFlightRef.current) {
      return
    }

    deleteInFlightRef.current = true

    try {
      await deleteMutation.mutateAsync(product.id)
      void navigate(returnPath, {
        state: { successMessage: 'Produto excluído com sucesso.' },
      })
    } catch {
      // O erro da mutation é exibido no diálogo.
    } finally {
      deleteInFlightRef.current = false
    }
  }

  return (
    <section className="product-page" aria-labelledby="product-details-title">
      <header className="product-page__header">
        <div>
          <p className="page__eyebrow">Detalhes</p>
          <h1 id="product-details-title">{product.name}</h1>
          <p className="page__description">
            Consulte todas as informações cadastradas para este produto.
          </p>
        </div>
        <div className="inline-actions">
          <Link className="button button--secondary" to={returnPath}>
            Voltar
          </Link>
          <Link
            className="button button--primary"
            to={`/products/${product.id}/edit`}
            state={{ from: returnPath }}
          >
            Editar
          </Link>
        </div>
      </header>

      {successMessage ? (
        <div className="alert alert--success" role="status">
          {successMessage}
        </div>
      ) : null}

      <div className="product-details-card">
        <dl className="product-details">
          <div>
            <dt>Nome</dt>
            <dd>{product.name}</dd>
          </div>
          <div>
            <dt>Categoria</dt>
            <dd>{category}</dd>
          </div>
          <div>
            <dt>Preço</dt>
            <dd>{formatCurrency(product.price)}</dd>
          </div>
          <div>
            <dt>Estoque</dt>
            <dd>{product.stock} unidade(s)</dd>
          </div>
          <div>
            <dt>Status</dt>
            <dd>
              <ProductStatusBadge active={product.active} />
            </dd>
          </div>
        </dl>

        <div className="product-details-card__footer">
          <button
            className="button button--danger"
            type="button"
            onClick={() => {
              deleteMutation.reset()
              setIsDeleteOpen(true)
            }}
          >
            Excluir produto
          </button>
        </div>
      </div>

      <ConfirmDialog
        isOpen={isDeleteOpen}
        title="Excluir produto?"
        description={`O produto “${product.name}” será excluído permanentemente.`}
        isConfirming={deleteMutation.isPending}
        errorMessage={deleteMutation.error?.message}
        onCancel={() => {
          if (!deleteMutation.isPending) {
            setIsDeleteOpen(false)
          }
        }}
        onConfirm={() => void handleDelete()}
      />
    </section>
  )
}

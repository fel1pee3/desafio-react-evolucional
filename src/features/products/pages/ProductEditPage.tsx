import { useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'

import { LoadingState } from '../../../shared/components/LoadingState'
import { getProductReturnPath } from '../../../shared/utils/navigationState'
import {
  useProductQuery,
  useUpdateProductMutation,
} from '../api/productQueries'
import { ProductForm } from '../components/ProductForm'
import { ProductErrorState } from '../components/ProductErrorState'
import { isProductCategory } from '../constants/productCategories'
import type { ProductFormData } from '../schemas/productSchema'
import '../styles/products.css'
import { parseProductId } from '../utils/productId'

export function ProductEditPage() {
  const { productId: productIdParam } = useParams()
  const productId = parseProductId(productIdParam)
  const location = useLocation()
  const navigate = useNavigate()
  const [returnPath] = useState(() => getProductReturnPath(location.state))
  const productQuery = useProductQuery(productId)
  const updateMutation = useUpdateProductMutation()

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
    return <LoadingState message="Carregando produto..." />
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

  if (!isProductCategory(product.category)) {
    return (
      <ProductErrorState
        title="Categoria não reconhecida"
        message="Este produto possui uma categoria que não pode ser editada pela aplicação."
        returnPath={returnPath}
      />
    )
  }

  const initialValues: ProductFormData = {
    name: product.name,
    category: product.category,
    price: product.price,
    stock: product.stock,
    active: product.active,
  }

  const handleSubmit = async (data: ProductFormData) => {
    try {
      await updateMutation.mutateAsync({ productId, data })

      void navigate(`/products/${productId}`, {
        state: {
          from: returnPath,
          successMessage: 'Produto atualizado com sucesso.',
        },
      })
    } catch {
      // O erro da mutation é exibido pelo formulário.
    }
  }

  return (
    <section className="product-page product-editor" aria-labelledby="edit-product-title">
      <header className="product-page__header">
        <div>
          <p className="page__eyebrow">Edição</p>
          <h1 id="edit-product-title">Editar produto</h1>
          <p className="page__description">
            Atualize as informações de {product.name}.
          </p>
        </div>
      </header>

      <ProductForm
        initialValues={initialValues}
        submitLabel="Salvar alterações"
        submittingLabel="Salvando…"
        isSaving={updateMutation.isPending}
        apiError={updateMutation.error?.message ?? null}
        cancelTo={`/products/${productId}`}
        cancelState={{ from: returnPath }}
        onSubmit={handleSubmit}
      />
    </section>
  )
}

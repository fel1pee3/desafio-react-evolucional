import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import { getProductReturnPath } from '../../../shared/utils/navigationState'
import { useCreateProductMutation } from '../api/productQueries'
import { ProductForm } from '../components/ProductForm'
import type { ProductFormData } from '../schemas/productSchema'
import '../styles/products.css'

export function ProductCreatePage() {
  const location = useLocation()
  const navigate = useNavigate()
  const [returnPath] = useState(() => getProductReturnPath(location.state))
  const createMutation = useCreateProductMutation()

  const handleSubmit = async (data: ProductFormData) => {
    try {
      const product = await createMutation.mutateAsync(data)

      void navigate(`/products/${product.id}`, {
        state: {
          from: returnPath,
          successMessage: 'Produto criado com sucesso.',
        },
      })
    } catch {
      // O erro da mutation é exibido pelo formulário.
    }
  }

  return (
    <section className="product-page product-editor" aria-labelledby="new-product-title">
      <header className="product-page__header">
        <div>
          <p className="page__eyebrow">Cadastro</p>
          <h1 id="new-product-title">Novo produto</h1>
          <p className="page__description">
            Preencha os dados abaixo para incluir um produto no catálogo.
          </p>
        </div>
      </header>

      <ProductForm
        submitLabel="Cadastrar produto"
        submittingLabel="Cadastrando…"
        isSaving={createMutation.isPending}
        apiError={createMutation.error?.message ?? null}
        cancelTo={returnPath}
        onSubmit={handleSubmit}
      />
    </section>
  )
}

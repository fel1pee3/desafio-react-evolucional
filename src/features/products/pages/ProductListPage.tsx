import { useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { ConfirmDialog } from '../../../shared/components/ConfirmDialog'
import { useNavigationSuccessMessage } from '../../../shared/hooks/useNavigationSuccessMessage'
import {
  useDeleteProductMutation,
  useProductsQuery,
} from '../api/productQueries'
import { ProductFilters } from '../components/ProductFilters'
import { ProductListContent } from '../components/ProductListContent'
import { useDebouncedValue } from '../hooks/useDebouncedValue'
import { useProductFilters } from '../hooks/useProductFilters'
import type { Product } from '../types/product'
import '../styles/products.css'

const SEARCH_DEBOUNCE_DELAY = 350

export function ProductListPage() {
  const location = useLocation()
  const returnPath = `${location.pathname}${location.search}`
  const navigationSuccessMessage = useNavigationSuccessMessage()
  const [localSuccessMessage, setLocalSuccessMessage] = useState<string | null>(
    null,
  )
  const [productToDelete, setProductToDelete] = useState<Product | null>(null)
  const deleteInFlightRef = useRef(false)
  const deleteMutation = useDeleteProductMutation()
  const {
    page,
    pageSize,
    search,
    category,
    hasActiveFilters,
    setSearch,
    clearSearch,
    setCategory,
    setPage,
  } = useProductFilters()
  const debouncedSearch = useDebouncedValue(search, SEARCH_DEBOUNCE_DELAY)
  const normalizedSearch = search.trim()
  const isWaitingForSearch = normalizedSearch !== debouncedSearch.trim()
  const productsQuery = useProductsQuery(
    {
      page,
      pageSize,
      search: debouncedSearch,
      category,
    },
    { enabled: !isWaitingForSearch },
  )
  const isUpdating =
    !productsQuery.isPending &&
    (productsQuery.isFetching || isWaitingForSearch)
  const successMessage = localSuccessMessage ?? navigationSuccessMessage

  const handleDelete = async () => {
    if (!productToDelete || deleteInFlightRef.current) {
      return
    }

    const shouldGoToPreviousPage =
      page > 1 && productsQuery.data?.items.length === 1

    deleteInFlightRef.current = true

    try {
      await deleteMutation.mutateAsync(productToDelete.id)
      setLocalSuccessMessage(
        `O produto “${productToDelete.name}” foi excluído com sucesso.`,
      )
      setProductToDelete(null)

      if (shouldGoToPreviousPage) {
        setPage(page - 1)
      }
    } catch {
      // O erro da mutation é exibido no diálogo.
    } finally {
      deleteInFlightRef.current = false
    }
  }

  useEffect(() => {
    if (
      !productsQuery.isSuccess ||
      productsQuery.isFetching ||
      productsQuery.isPlaceholderData
    ) {
      return
    }

    const totalPages = Math.max(
      1,
      Math.ceil(productsQuery.data.totalCount / pageSize),
    )

    if (page > totalPages) {
      setPage(totalPages)
    }
  }, [
    page,
    pageSize,
    productsQuery.data,
    productsQuery.isFetching,
    productsQuery.isPlaceholderData,
    productsQuery.isSuccess,
    setPage,
  ])

  return (
    <section className="product-page" aria-labelledby="products-page-title">
      <header className="product-page__header">
        <div>
          <p className="page__eyebrow">Catálogo</p>
          <h1 id="products-page-title">Gerenciamento de produtos</h1>
          <p className="page__description">
            Consulte o catálogo e encontre produtos por nome ou categoria.
          </p>
        </div>
        <Link
          className="button button--primary"
          to="/products/new"
          state={{ from: returnPath }}
        >
          Novo produto
        </Link>
      </header>

      {successMessage ? (
        <div className="alert alert--success" role="status">
          {successMessage}
        </div>
      ) : null}

      <ProductFilters
        search={search}
        category={category}
        onSearchChange={setSearch}
        onClearSearch={clearSearch}
        onCategoryChange={setCategory}
      />

      <ProductListContent
        result={productsQuery.data}
        page={page}
        pageSize={pageSize}
        hasActiveFilters={hasActiveFilters}
        isPending={productsQuery.isPending}
        isUpdating={isUpdating}
        isError={productsQuery.isError}
        errorMessage={productsQuery.error?.message}
        onRetry={() => void productsQuery.refetch()}
        onPageChange={setPage}
        onDelete={(product) => {
          deleteMutation.reset()
          setProductToDelete(product)
        }}
      />

      <ConfirmDialog
        isOpen={productToDelete !== null}
        title="Excluir produto?"
        description={
          productToDelete
            ? `O produto “${productToDelete.name}” será excluído permanentemente.`
            : ''
        }
        isConfirming={deleteMutation.isPending}
        errorMessage={deleteMutation.error?.message}
        onCancel={() => {
          if (!deleteMutation.isPending) {
            setProductToDelete(null)
          }
        }}
        onConfirm={() => void handleDelete()}
      />
    </section>
  )
}

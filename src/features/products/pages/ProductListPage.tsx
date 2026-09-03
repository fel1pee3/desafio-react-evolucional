import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useProductsQuery } from '../api/productQueries'
import { ProductFilters } from '../components/ProductFilters'
import { ProductListContent } from '../components/ProductListContent'
import { useDebouncedValue } from '../hooks/useDebouncedValue'
import { useProductFilters } from '../hooks/useProductFilters'
import '../styles/products.css'

const SEARCH_DEBOUNCE_DELAY = 350

export function ProductListPage() {
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
        <Link className="button button--primary" to="/products/new">
          Novo produto
        </Link>
      </header>

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
      />
    </section>
  )
}

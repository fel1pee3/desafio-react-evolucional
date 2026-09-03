import type { ChangeEvent } from 'react'
import {
  isProductCategory,
  PRODUCT_CATEGORIES,
  PRODUCT_CATEGORY_LABELS,
  type ProductCategory,
} from '../constants/productCategories'

type ProductFiltersProps = {
  search: string
  category?: ProductCategory
  onSearchChange: (value: string) => void
  onClearSearch: () => void
  onCategoryChange: (value: ProductCategory | undefined) => void
}

export function ProductFilters({
  search,
  category,
  onSearchChange,
  onClearSearch,
  onCategoryChange,
}: ProductFiltersProps) {
  function handleCategoryChange(event: ChangeEvent<HTMLSelectElement>) {
    const value = event.target.value
    onCategoryChange(isProductCategory(value) ? value : undefined)
  }

  return (
    <form
      className="product-filters"
      role="search"
      onSubmit={(event) => event.preventDefault()}
    >
      <div className="form-field product-filters__search">
        <label htmlFor="product-search">Buscar por nome</label>
        <div className="search-field">
          <input
            id="product-search"
            type="search"
            value={search}
            placeholder="Ex.: teclado"
            autoComplete="off"
            onBlur={() => onSearchChange(search.trim())}
            onChange={(event) => onSearchChange(event.target.value)}
          />
          {search ? (
            <button
              className="search-field__clear"
              type="button"
              aria-label="Limpar busca"
              onClick={onClearSearch}
            >
              Limpar
            </button>
          ) : null}
        </div>
      </div>

      <div className="form-field product-filters__category">
        <label htmlFor="product-category">Categoria</label>
        <select
          id="product-category"
          value={category ?? ''}
          onChange={handleCategoryChange}
        >
          <option value="">Todas as categorias</option>
          {PRODUCT_CATEGORIES.map((productCategory) => (
            <option key={productCategory} value={productCategory}>
              {PRODUCT_CATEGORY_LABELS[productCategory]}
            </option>
          ))}
        </select>
      </div>
    </form>
  )
}

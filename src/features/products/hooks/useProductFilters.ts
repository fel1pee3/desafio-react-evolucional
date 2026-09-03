import { useCallback, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  isProductCategory,
  type ProductCategory,
} from '../constants/productCategories'

export const PRODUCT_PAGE_SIZE = 10

export function useProductFilters() {
  const [searchParams, setSearchParams] = useSearchParams()
  const rawPage = searchParams.get('page')
  const rawSearch = searchParams.get('search')
  const rawCategory = searchParams.get('category')
  const page = parsePage(rawPage)
  const search = rawSearch ?? ''
  const category =
    rawCategory && isProductCategory(rawCategory) ? rawCategory : undefined

  useEffect(() => {
    const hasInvalidPage = rawPage !== null && !isValidPage(rawPage)
    const hasEmptySearch = rawSearch === ''
    const hasInvalidCategory =
      rawCategory !== null && !isProductCategory(rawCategory)

    if (!hasInvalidPage && !hasEmptySearch && !hasInvalidCategory) {
      return
    }

    setSearchParams(
      (currentParams) => {
        const normalizedParams = new URLSearchParams(currentParams)

        if (hasInvalidPage) {
          normalizedParams.delete('page')
        }

        if (hasEmptySearch) {
          normalizedParams.delete('search')
        }

        if (hasInvalidCategory) {
          normalizedParams.delete('category')
        }

        return normalizedParams
      },
      { replace: true },
    )
  }, [rawCategory, rawPage, rawSearch, setSearchParams])

  const setSearch = useCallback(
    (value: string) => {
      setSearchParams(
        (currentParams) => {
          const nextParams = new URLSearchParams(currentParams)
          nextParams.delete('page')

          if (value) {
            nextParams.set('search', value)
          } else {
            nextParams.delete('search')
          }

          return nextParams
        },
        { replace: true },
      )
    },
    [setSearchParams],
  )

  const setCategory = useCallback(
    (value: ProductCategory | undefined) => {
      setSearchParams((currentParams) => {
        const nextParams = new URLSearchParams(currentParams)

        nextParams.delete('page')

        if (value) {
          nextParams.set('category', value)
        } else {
          nextParams.delete('category')
        }

        return nextParams
      })
    },
    [setSearchParams],
  )

  const setPage = useCallback(
    (value: number) => {
      setSearchParams((currentParams) => {
        const nextParams = new URLSearchParams(currentParams)

        if (value <= 1) {
          nextParams.delete('page')
        } else {
          nextParams.set('page', String(value))
        }

        return nextParams
      })
    },
    [setSearchParams],
  )

  return {
    page,
    pageSize: PRODUCT_PAGE_SIZE,
    search,
    category,
    hasActiveFilters: Boolean(search.trim() || category),
    setSearch,
    clearSearch: () => setSearch(''),
    setCategory,
    setPage,
  }
}

function parsePage(value: string | null): number {
  return value !== null && isValidPage(value) ? Number(value) : 1
}

function isValidPage(value: string): boolean {
  const parsedValue = Number(value)

  return Number.isInteger(parsedValue) && parsedValue >= 1
}

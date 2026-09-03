import type { ProductCategory } from '../constants/productCategories'

export type ProductApiDto = {
  id: number
  nome: string
  categoria: string
  preco: number
  estoque: number
  ativo: boolean
}

export type ProductWriteApiDto = Omit<ProductApiDto, 'id'>

export type Product = {
  id: number
  name: string
  category: string
  price: number
  stock: number
  active: boolean
}

export type ProductListParams = {
  page: number
  pageSize: number
  search?: string
  category?: ProductCategory
}

export type PaginatedResult<T> = {
  items: T[]
  totalCount: number
}

export type CreateProductData = Omit<Product, 'id'>

export type UpdateProductData = Omit<Product, 'id'>

export type UpdateProductVariables = {
  productId: number
  data: UpdateProductData
}

import { describe, expect, it } from 'vitest'
import type {
  CreateProductData,
  Product,
  ProductApiDto,
  ProductWriteApiDto,
} from '../types/product'
import {
  mapCreateProductDataToApiDto,
  mapProductApiDtoToProduct,
  mapProductToApiDto,
  mapUpdateProductDataToApiDto,
} from './productMapper'

const apiProduct: ProductApiDto = {
  id: 8,
  nome: 'SSD NVMe 1TB',
  categoria: 'Armazenamento',
  preco: 449.9,
  estoque: 40,
  ativo: true,
}

const product: Product = {
  id: 8,
  name: 'SSD NVMe 1TB',
  category: 'Armazenamento',
  price: 449.9,
  stock: 40,
  active: true,
}

const productData: CreateProductData = {
  name: product.name,
  category: product.category,
  price: product.price,
  stock: product.stock,
  active: product.active,
}

const apiProductData: ProductWriteApiDto = {
  nome: apiProduct.nome,
  categoria: apiProduct.categoria,
  preco: apiProduct.preco,
  estoque: apiProduct.estoque,
  ativo: apiProduct.ativo,
}

describe('productMapper', () => {
  it('maps an API DTO to the product domain model', () => {
    expect(mapProductApiDtoToProduct(apiProduct)).toEqual(product)
  })

  it('maps a product to the API DTO', () => {
    expect(mapProductToApiDto(product)).toEqual(apiProduct)
  })

  it('maps create and update data without adding an id', () => {
    expect(mapCreateProductDataToApiDto(productData)).toEqual(apiProductData)
    expect(mapUpdateProductDataToApiDto(productData)).toEqual(apiProductData)
  })
})

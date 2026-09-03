import type {
  CreateProductData,
  Product,
  ProductApiDto,
  ProductWriteApiDto,
  UpdateProductData,
} from '../types/product'

export function mapProductApiDtoToProduct(dto: ProductApiDto): Product {
  return {
    id: dto.id,
    name: dto.nome,
    category: dto.categoria,
    price: dto.preco,
    stock: dto.estoque,
    active: dto.ativo,
  }
}

export function mapProductToApiDto(product: Product): ProductApiDto {
  return {
    id: product.id,
    ...mapProductDataToApiDto(product),
  }
}

export function mapCreateProductDataToApiDto(
  product: CreateProductData,
): ProductWriteApiDto {
  return mapProductDataToApiDto(product)
}

export function mapUpdateProductDataToApiDto(
  product: UpdateProductData,
): ProductWriteApiDto {
  return mapProductDataToApiDto(product)
}

function mapProductDataToApiDto(
  product: CreateProductData | UpdateProductData,
): ProductWriteApiDto {
  return {
    nome: product.name,
    categoria: product.category,
    preco: product.price,
    estoque: product.stock,
    ativo: product.active,
  }
}

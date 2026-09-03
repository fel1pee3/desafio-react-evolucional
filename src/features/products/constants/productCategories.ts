export const PRODUCT_CATEGORIES = [
  'Acessorios',
  'Armazenamento',
  'Audio',
  'Componentes',
  'Monitores',
  'Perifericos',
] as const

export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number]

export function isProductCategory(value: string): value is ProductCategory {
  return PRODUCT_CATEGORIES.some((category) => category === value)
}

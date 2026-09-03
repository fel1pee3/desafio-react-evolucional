export const PRODUCT_CATEGORIES = [
  'Acessorios',
  'Armazenamento',
  'Audio',
  'Componentes',
  'Monitores',
  'Perifericos',
] as const

export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number]

export const PRODUCT_CATEGORY_LABELS: Record<ProductCategory, string> = {
  Acessorios: 'Acessórios',
  Armazenamento: 'Armazenamento',
  Audio: 'Áudio',
  Componentes: 'Componentes',
  Monitores: 'Monitores',
  Perifericos: 'Periféricos',
}

export function isProductCategory(value: string): value is ProductCategory {
  return PRODUCT_CATEGORIES.some((category) => category === value)
}

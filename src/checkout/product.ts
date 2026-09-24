export type Product = {
  id: string
  name: string
  description: string
  price: number
  currency: string
}

export const mockProduct: Product = {
  id: 'prod_123',
  name: 'Analog Field Kit',
  description: 'Notebook, pencil, and a year of refills.',
  price: 64,
  currency: 'USD',
}

export function findProduct(productId: string): Product | null {
  return productId === mockProduct.id ? mockProduct : null
}

export function formatProductPrice(product: Product): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: product.currency,
  }).format(product.price)
}

import { formatProductPrice, type Product } from '../product.ts'

type ProductSummaryProps = {
  product: Product
}

export function ProductSummary({ product }: ProductSummaryProps) {
  return (
    <article className="product-summary">
      <h2>{product.name}</h2>
      <p className="product-summary-description">{product.description}</p>
      <hr />
      <p className="product-summary-price">
        <span>{formatProductPrice(product)}</span>
        <span className="product-summary-currency">{product.currency}</span>
      </p>
    </article>
  )
}

import type { ReactNode } from 'react'

type CheckoutLayoutProps = {
  children: ReactNode
}

export function CheckoutLayout({ children }: CheckoutLayoutProps) {
  return (
    <div className="checkout">
      <div className="checkout-panel">{children}</div>
    </div>
  )
}

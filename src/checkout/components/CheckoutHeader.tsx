type CheckoutHeaderProps = {
  onClose: () => void
  closeDisabled: boolean
  showClose: boolean
}

export function CheckoutHeader({ onClose, closeDisabled, showClose }: CheckoutHeaderProps) {
  return (
    <header className="checkout-header">
      <p className="checkout-brand">Dodo Checkout</p>
      {showClose ? (
        <button
          type="button"
          className="checkout-close"
          aria-label="Close checkout"
          disabled={closeDisabled}
          onClick={onClose}
        >
          Close
        </button>
      ) : (
        <span className="checkout-close-spacer" aria-hidden="true" />
      )}
    </header>
  )
}

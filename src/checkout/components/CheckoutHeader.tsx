type CheckoutHeaderProps = {
  onClose: () => void
  closeDisabled: boolean
  showClose: boolean
}

export function CheckoutHeader({ onClose, closeDisabled, showClose }: CheckoutHeaderProps) {
  return (
    <header className="checkout-header">
      <img className="checkout-brand" src="/dodo-logo.webp" alt="Dodo Payments" />
      {showClose ? (
        <button
          type="button"
          className="checkout-close"
          aria-label="Close checkout"
          disabled={closeDisabled}
          onClick={onClose}
        >
          <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true">
            <path
              d="M3.5 3.5l9 9M12.5 3.5l-9 9"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </button>
      ) : (
        <span className="checkout-close-spacer" aria-hidden="true" />
      )}
    </header>
  )
}

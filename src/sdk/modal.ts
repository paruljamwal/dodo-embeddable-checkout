const modalClassName = 'dodo-sdk-modal'
const frameClassName = 'dodo-sdk-frame'

const modalCss = `
.${modalClassName} {
  position: fixed;
  inset: 0;
  z-index: 2147483000;
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  padding: 16px;
  background: rgba(28, 25, 23, 0.48);
}

.${modalClassName} * {
  box-sizing: border-box;
}

.${frameClassName},
.dodo-sdk-fallback {
  width: min(100%, 30rem);
  max-height: calc(100dvh - 32px);
  border: 0;
  border-radius: 8px;
  background: #fff;
  color: #1c1917;
  font-family: system-ui, -apple-system, "Segoe UI", sans-serif;
}

.${frameClassName} {
  height: min(100%, 44rem);
}

.dodo-sdk-fallback {
  box-sizing: border-box;
  padding: 24px;
}

.dodo-sdk-fallback p {
  margin: 0 0 16px;
  line-height: 1.5;
}

.dodo-sdk-fallback-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.dodo-sdk-retry,
.dodo-sdk-dismiss {
  min-height: 44px;
  padding: 0 14px;
  border-radius: 6px;
  font: inherit;
  font-weight: 600;
  cursor: pointer;
}

.dodo-sdk-retry {
  border: 0;
  background: #1c1917;
  color: #fff;
}

.dodo-sdk-dismiss {
  border: 1px solid #d6d3d1;
  background: #fff;
  color: #1c1917;
}

.dodo-sdk-retry:focus-visible,
.dodo-sdk-dismiss:focus-visible {
  outline: 2px solid #1c1917;
  outline-offset: 2px;
}

@media (max-width: 640px) {
  .${modalClassName} {
    padding: 0;
  }

  .${frameClassName},
  .dodo-sdk-fallback {
    width: 100%;
    max-height: 100dvh;
    border-radius: 0;
  }

  .${frameClassName} {
    height: 100%;
  }
}
`

export type CheckoutModalElements = {
  backdrop: HTMLDivElement
  iframe: HTMLIFrameElement
  fallback: HTMLDivElement
  retryButton: HTMLButtonElement
  closeButton: HTMLButtonElement
}

export function createCheckoutModal(checkoutUrl: string): CheckoutModalElements {
  const style = document.createElement('style')
  style.textContent = modalCss

  const backdrop = document.createElement('div')
  backdrop.className = modalClassName

  const iframe = document.createElement('iframe')
  iframe.className = frameClassName
  iframe.src = checkoutUrl
  iframe.title = 'Dodo Checkout'

  const fallback = document.createElement('div')
  fallback.className = 'dodo-sdk-fallback'
  fallback.hidden = true

  const message = document.createElement('p')
  message.textContent = "Checkout couldn't be loaded."

  const actions = document.createElement('div')
  actions.className = 'dodo-sdk-fallback-actions'

  const retryButton = document.createElement('button')
  retryButton.type = 'button'
  retryButton.className = 'dodo-sdk-retry'
  retryButton.textContent = 'Try again'

  const closeButton = document.createElement('button')
  closeButton.type = 'button'
  closeButton.className = 'dodo-sdk-dismiss'
  closeButton.textContent = 'Close'

  actions.append(retryButton, closeButton)
  fallback.append(message, actions)
  backdrop.append(style, iframe, fallback)

  return { backdrop, iframe, fallback, retryButton, closeButton }
}

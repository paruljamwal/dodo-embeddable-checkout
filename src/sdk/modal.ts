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

.${frameClassName} {
  width: min(100%, 30rem);
  height: min(100%, 44rem);
  max-height: calc(100dvh - 32px);
  border: 0;
  border-radius: 8px;
  background: #fff;
}

@media (max-width: 640px) {
  .${modalClassName} {
    padding: 0;
  }

  .${frameClassName} {
    width: 100%;
    height: 100%;
    max-height: 100dvh;
    border-radius: 0;
  }
}
`

export type CheckoutModalElements = {
  backdrop: HTMLDivElement
  iframe: HTMLIFrameElement
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

  backdrop.append(style, iframe)

  return { backdrop, iframe }
}

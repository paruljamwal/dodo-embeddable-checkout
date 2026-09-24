# Dodo Checkout

A small embeddable checkout prototype. A framework-independent TypeScript SDK opens a hosted checkout inside an iframe, and a demo merchant page uses that SDK the way another site would.

Payment is simulated in the browser. The assignment does not require a backend, so card charges never leave the checkout page.

## Features

- Embeddable browser SDK (`DodoCheckout.open`)
- Hosted checkout in an isolated iframe
- Product, email, card, and pay flow
- Client-side payment simulation
- Deterministic test cards
- Success, decline, and retry flows
- SDK callbacks: `onSuccess`, `onClose`, and `onError`
- `postMessage` communication between the SDK and the iframe
- Origin and source validation on both sides
- Iframe lifecycle and cleanup, including a load-failure state
- Keyboard, focus, and responsive behavior
- Merchant-side SDK event log
- Protection against a second checkout opening, and against paying twice

## Tech Stack

- React
- TypeScript
- Vite
- CSS
- Browser `postMessage` API

## Getting Started

```bash
npm install
npm run dev
```

Open the URL Vite prints, usually `http://localhost:5173`. `/` is the demo store. Buy Now loads `/checkout` in an iframe.

```bash
npm run build
npm run preview
```

`npm run build` type-checks with `tsc -b`, then builds into `dist`.

To point the iframe at a checkout hosted on another origin, set `VITE_DODO_CHECKOUT_ORIGIN` before starting Vite. When it is unset, the iframe uses the current page origin.

## Project structure

```text
src/sdk/          SDK. No React. Attached to window.DodoCheckout
src/checkout/     Checkout UI, validation, and payment simulation
src/merchant/     Demo store and event log
src/constants/    Shared checkout URL, message names, and test cards
src/types/        postMessage payload guards
```

`src/components/App.tsx` renders the merchant page, or the checkout page when the path is `/checkout`.

## How the pieces talk

1. The merchant page calls `DodoCheckout.open({ productId, onSuccess, onClose, onError })`.
2. The SDK locks page scroll, creates one modal and one iframe, and listens for messages from that frame.
3. When the checkout is ready, it posts `checkout.ready`. The SDK replies with `checkout.open` and the product id only.
4. The customer pays inside the iframe. Card number, expiry, and CVC stay there.
5. The checkout posts a result. The SDK checks `event.origin`, `event.source`, the message type, and the payload shape, then calls one merchant callback.

A second `open` while a session exists is ignored. Closing the modal removes the iframe, the message listener, and the scroll lock, then restores focus to the control that opened checkout.

Each session ends with one terminal callback:

| Outcome | Callback | Checkout |
| --- | --- | --- |
| Payment succeeds | `onSuccess({ transactionId, productId })` | Closes |
| Customer closes it, or presses Escape | `onClose({ reason: "user_closed" })` | Closes |
| Iframe fails to load | `onError({ code: "checkout_load_failed", message })` | Closes |
| Card is declined | `onError({ code: "payment_declined", message })` | Stays open |

A decline does not end the session, so the customer can try another card. Closing afterward is a separate `onClose`. A processor or network failure is shown inside checkout with Try again, and is not sent to the merchant. That keeps the fail-once card from emitting an error before the successful retry.

Unknown messages are ignored. `postMessage` always uses a concrete target origin.

## SDK

```ts
DodoCheckout.open({
  productId: "prod_123",
  onSuccess: ({ transactionId, productId }) => {},
  onClose: ({ reason }) => {},
  onError: ({ code, message }) => {},
})
```

The demo store sells Analog Field Kit (`prod_123`) for $64.00. The event log on that page records callback type, time, and the safe payload. It does not record card data.

## Test cards

Use any valid email, a future expiry, and any 3-digit CVC. Only these numbers change the payment result:

| Card | Result |
| --- | --- |
| `4242 4242 4242 4242` | Succeeds |
| `4000 0000 0000 0002` | Declined. Checkout stays open |
| `4000 0000 0000 0341` | Fails once, then succeeds on retry |
| `4000 0000 0000 0119` | Network failure. Retry fails the same way |

Any other 16-digit number that passes the Luhn check is treated as a processor failure and can be retried from the same screen. Invalid email, card number, expiry, or CVC is rejected before a payment is attempted.

## Decisions

**A decline notifies the merchant and leaves checkout open.** Closing on every failure would make the fail-once card end the session before retry, and the merchant would see an error and then a success. A decline is reported with `onError` because the merchant should know the attempt was refused. Processor and network failures stay in the iframe until the customer either pays or closes checkout.

**One app, two routes, instead of three packages.** The SDK, checkout, and demo store ship together so `npm run dev` is the whole prototype. The card form still runs in an iframe, and the parent only receives the product id on the way in and a transaction id, close reason, or error on the way out. `VITE_DODO_CHECKOUT_ORIGIN` is the seam for hosting checkout on its own origin later.

## What I'd explore next

- A server-created payment session, with card data sent to a processor rather than simulated in the page.
- Hosting checkout on its own origin by default, and signing the open message so a parent cannot spoof `checkout.ready`.
- A way for the merchant to recover the outcome if the page reloads before the callback runs.

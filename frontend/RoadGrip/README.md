# React + TypeScript + Vite

## PayHere Sandbox

Card checkout uses PayHere's hosted sandbox. RoadGrip calculates the amount on the backend, sends the customer to PayHere to enter test card details, and marks an order paid only after the signed server notification is verified. Card numbers and CVVs are never collected by RoadGrip.

### Configure

1. In the PayHere dashboard, register the public hostname you will use for testing and use the merchant secret issued for that hostname.
2. Start the backend from `backend` with `npm run dev` (port 3000) and the frontend from `frontend/RoadGrip` with `npm run dev` (port 5173).
3. Expose the Vite dev server on port 5173 through an HTTPS tunnel. Use that same public URL in a browser and configure that hostname in PayHere. Vite proxies `/api` to the backend, so PayHere can also reach the notification endpoint through the tunnel.
4. Add these values to `backend/.env.local`, preserving any existing Firebase or database settings:

```env
PAYHERE_MERCHANT_ID=your_sandbox_merchant_id
PAYHERE_MERCHANT_SECRET=your_base64_encoded_sandbox_merchant_secret
PAYHERE_CURRENCY=LKR
APP_URL=https://your-public-tunnel.example
PAYHERE_NOTIFY_URL=https://your-public-tunnel.example/api/payments/payhere/notify
```

The secret is backend-only and must not use a `VITE_` prefix. `backend/.env.local` is ignored by Git. Restart the backend after editing it. PayHere cannot call a localhost notification URL; use a publicly reachable HTTPS tunnel and keep its hostname aligned with the domain registered for the merchant secret.

5. Sign in, add products to the cart, and proceed through checkout. Choose the card option to reach the PayHere sandbox. Use the test payment details shown in the PayHere sandbox documentation/dashboard. On return, the order remains pending until the backend receives and verifies PayHere's notification.

Cash on Delivery remains available without a PayHere payment.

## Admin dashboard

Sign in with the configured RoadGrip admin account and open `/admin` to view store analytics and manage products, categories/vehicle types, brands, orders, and user roles. Revenue and payment-method metrics are calculated from saved orders. Product category and brand filters in the shop are populated from the live catalog. An order's payment status is confirmed by the payment provider; changing its fulfillment status in admin does not alter payment state.

Never commit merchant credentials. Since the merchant secret was shared in chat, rotate it in PayHere and configure the replacement only in `backend/.env.local` before testing.

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend enabling type-aware lint rules by installing `oxlint-tsgolint` and editing `.oxlintrc.json`:

```json
{
  "$schema": "./node_modules/oxlint/configuration_schema.json",
  "plugins": ["react", "typescript", "oxc"],
  "options": {
    "typeAware": true
  },
  "rules": {
    "react/rules-of-hooks": "error",
    "react/only-export-components": ["warn", { "allowConstantExport": true }]
  }
}
```

See the [Oxlint rules documentation](https://oxc.rs/docs/guide/usage/linter/rules) for the full list of rules and categories.

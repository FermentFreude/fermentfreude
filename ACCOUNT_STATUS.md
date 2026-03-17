# Account / Dashboard — Status

Last updated: 2026-03-17

---

## ✅ DONE

### Auth
- `/login` — styled, working (dark bg, Neue Haas, social links)
- `/create-account` — functional (Alaa building: needs name field + brand styling)
- `/forgot-password` — page exists

### Pages (real Payload data)
- `/account` (dashboard) — welcome banner, stats cards, recent orders — **security fixed** (filters by `customer: userId`)
- `/account/profile` — edit name/email, change password
- `/account/addresses` — list, add, edit (pre-populate fixed), delete
- `/account/orders` — list orders for logged-in user
- `/account/orders/[id]` — order detail
- `/account/order-confirmation` — thank you page after checkout (**Next.js 15 async searchParams fixed**)
- `/account/shipping-methods` — static hardcoded content (acceptable for now)

### Components
- `AccountSidebar` — redesigned with **two nav groups** (Dashboard / Account Settings), **user avatar initials**, **mobile Sheet drawer**, Tailwind v4 clean
- `EditAddressModal` — add/edit with pre-population on edit, correct reset on close
- `DeleteAddressButton` — calls DELETE `/api/addresses/[id]`

### API routes (all secured with Payload auth)
- `POST /api/users/update-profile`
- `POST /api/users/change-password`
- `GET /api/addresses/[id]` — added (needed for EditAddressModal populate)
- `POST /api/addresses`
- `PATCH /api/addresses/[id]`
- `DELETE /api/addresses/[id]`

### Layout
- Auth redirect: unauthenticated users are redirected to `/login`

---

## ❌ TODO

### Features requiring new Payload collections (build when needed)
- **Downloads** — needs `Downloads` collection (digital products + collections link). Route deleted.
- **Return Requests** — needs `ReturnRequests` collection + admin workflow. Route deleted.
- **Reviews** — needs `Reviews` collection linked to orders/products. Route deleted.
- **Cancellations** — needs `CancellationRequests` collection + Stripe cancel API. Route deleted.

### Features requiring Stripe API integration
- **Payment Methods** — needs `stripeCustomerId` on User, then `stripe.paymentMethods.list()`. Route deleted until built.

### Create-account page (Alaa)
- Add `name` field
- Match dark styling of login page
- Remove generic CMS copy shown to customers

### Mobile navigation
- Mobile trigger button (`md:hidden`) is in AccountSidebar — but the layout needs a top bar on mobile to place it (currently floating in top-left of the content column, no header bar)

---

## Working route map
```
/account               → Dashboard (stats + recent orders)
/account/profile       → Edit name, email, password
/account/addresses     → CRUD addresses
/account/orders        → Order list
/account/orders/[id]   → Order detail
/account/order-confirmation → Post-checkout confirmation
/account/shipping-methods   → Static info
```

- `POST /api/users/update-profile` — update name + email
- `POST /api/users/change-password` — update password
- `POST /api/addresses` — create address
- `PATCH /api/addresses/[id]` — update address
- `DELETE /api/addresses/[id]` — delete address

### Collections (via ecommerce plugin + claude)


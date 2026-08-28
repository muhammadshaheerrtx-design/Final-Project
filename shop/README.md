# E-Commerce Storefront — Day 34: Integration & Edge Cases

Full MERN app, integrated end-to-end. Every feature works front-to-back,
auth-protected areas are enforced on both the client and the API, and
the flows below have been walked through deliberately to confirm
graceful handling of empty/loading/error states and bad input.

## What changed since Day 33

**Auth flow hardening**
- Axios now has a global response interceptor: any request carrying a
  token that comes back 401 (expired/invalid) auto-logs the user out
  and redirects to /login, instead of leaving the app in a broken
  half-authenticated state.
- Forgot / reset password added. No email service is configured, so
  forgot-password returns the reset token directly in the response
  (and logs it server-side) rather than emailing it — a dev-mode
  simplification, called out in the UI.

**Backend edge cases**
- Cart auto-prunes items whose product was deleted, instead of crashing.
- Adding/updating a cart item now checks against real stock.
- Checkout blocks on deleted products or insufficient stock, and
  decrements stock on a successful order.

**UI**
- Dark mode: a toggle in the navbar, persisted, applied via CSS
  variables — every color in the app already routed through variables,
  so no per-component dark-mode overrides were needed.
- Product List page: search moved into the navbar (synced via URL query
  params so the Navbar and page agree on the current search without
  prop-drilling), Category/Price restyled as pill buttons with Price
  opening a popover for min/max — everything else on that page unchanged.

## Setup

Same as Day 33 — server/ then client/, each with npm install plus a
.env copied from .env.example.

## Recording script for your Day 34 demo

Record one continuous walkthrough covering:

1. Register a new account
2. Search for a product using the navbar search bar — confirm results filter live
3. Open the Category and Price pill buttons — confirm the popovers open/close correctly, apply a filter
4. Add to cart without being logged in — confirm it redirects to /login rather than erroring silently
5. Log in, add 2-3 items to cart, go to Cart — update a quantity, remove an item
6. Go to Checkout, try an invalid coupon code (expect a clear error), then leave it blank and place the order
7. View it in Order History, click into the Order Detail
8. Toggle dark mode — confirm it persists on refresh
9. Log out, try visiting /orders directly in the URL bar — confirm redirect to /login
10. Log back in as a non-admin user, try visiting /admin/products directly — confirm redirect
11. Log in as an admin (promote a user's role to admin in Atlas first) — create, edit, delete a product
12. Forgot password: from the login screen, request a reset, copy the dev token shown, use it on the reset page, log in with the new password
13. Optional: set JWT_EXPIRES_IN=10s temporarily, log in, wait 11 seconds, make any request — confirm auto-logout redirect fires

That covers every "works front-to-back", "auth-protected areas enforced
on both ends", and "edge cases handled gracefully" bullet from today's
deliverable in one take.

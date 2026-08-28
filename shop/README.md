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
.env copied from .env.example

That covers every "works front-to-back", "auth-protected areas enforced
on both ends", and "edge cases handled gracefully" bullet from today's
deliverable in one take.

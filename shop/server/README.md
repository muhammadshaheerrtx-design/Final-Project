# E-Commerce Storefront — Backend (Day 32)

Express + MongoDB Atlas + JWT backend for the MERN capstone. Covers
auth, a public+admin product catalog, per-user cart, coupon validation,
and checkout-to-order conversion.

## Setup

```bash
npm install
cp .env.example .env
# fill in MONGODB_URI and a real JWT_SECRET
npm run dev
```

## Making your first admin user

There's no public "become admin" endpoint on purpose — role can't be
set via the register request body. After registering normally, promote
yourself directly in Atlas: Browse Collections → `users` → find your
document → edit `role` from `"user"` to `"admin"`.

## Testing

Import `postman_collection.json`. Run **Auth** first to get `userToken`,
then **Products - Admin → register admin** + manually promote that user
in Atlas before running the rest of the Admin folder. Order matters:
Cart → add an item → Orders → checkout, since checkout needs a
non-empty cart.

## API Summary

See the full endpoint table and data model in `Project-Plan.pdf`/`.docx`
from Day 31 — this backend implements that plan as specified, with two
additions: `403 Forbidden` (distinct from `401 Unauthorized`) for
authenticated-but-not-admin requests, and cart items store only a
product reference while order items store a full price/name snapshot.

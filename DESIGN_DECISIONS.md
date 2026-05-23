# Design Decisions

This document explains *why* each major architectural choice was made, the tradeoffs considered, and what I would improve with more time. It's organised the same way the project was built: schema → backend → frontend → cross-cutting.

---

## 1. Database schema

### 1.1 Why a separate `product_images` table (not a JSON column)?
- 1:N relationship that the ORM can navigate natively (`product.images`, ordered by `position`).
- Indexable per-image and easy to extend (alt text, CDN variant, primary flag) without rewriting a JSON blob.
- **Tradeoff:** one extra JOIN per product detail view, mitigated with `selectinload`.

### 1.2 Money is `Numeric(10,2)`, never `Float`
- `Float` is IEEE-754 binary; `0.1 + 0.2 !== 0.3`. The first time two order totals disagree by a paisa, accounting cries. `Numeric` is exact decimal and maps to Python's `Decimal`.

### 1.3 `UNIQUE(user_id, product_id)` on `cart_items`
- "One row per product in cart" enforced at the DB. Add-to-cart becomes an *upsert*: bump quantity if exists. Without this, two concurrent clicks could insert duplicate rows.

### 1.4 `order_items` snapshot `product_name` and `unit_price`
- Catalogue prices change. An order placed today at ₹49,999 must still show ₹49,999 tomorrow.
- This is also why `order_items.product_id` is `ON DELETE SET NULL`: a deleted product must not erase historical order lines (which `CASCADE` would do — catastrophic for accounting).

### 1.5 `discount_percent` is stored, not computed on the fly
- We want to filter / sort by it ("30%+ off"). Computing in a `WHERE` defeats indexes.
- **Pragmatic redundancy:** the seed script is the only writer. In production we'd enforce with a generated column or trigger.

### 1.6 `order_number` (string) in addition to `id` (int)
- Integer IDs leak order volume and are guessable. `OD7K3A9P2…` is opaque, copy-pasteable, and not enumerable.

### 1.7 No `users` table (yet)
- Spec says assume a default user. Adding a `users` table is a clean migration when auth arrives; the existing `user_id` columns are deliberately forward-compatible.

---

## 2. Backend architecture

### 2.1 Why a layered structure (routers → services → models/schemas → db)?
- **Routers** stay thin: parse input, call service, return response, choose status codes.
- **Services** own business logic and own the transaction. The same `clear_cart` is used by both the cart router and the order service — no duplicated SQL, no router-calling-router.
- **Models** describe the DB; **schemas** describe the API contract. Coupling them creates pain the first time you need to hide a field or expose a derived one.

### 2.2 `Depends(get_db)` instead of a module-level session
- FastAPI inspects the endpoint signature and calls `get_db` per request. Because it's a generator, the `finally:` close always runs — even if the endpoint raises. One Session per request, automatically released.

### 2.3 `current_user_id()` is a dependency, not a constant
- It's the auth seam. When real auth lands, only that function changes — no router or service needs to learn that "user 1" was a placeholder.

### 2.4 Why compute totals on the server?
- Trusting the client is a security hole. If the body says `total: 1` on a ₹50,000 phone, we'd happily bill ₹1. The only trustworthy source is `Product.price * quantity`, freshly read inside the same DB transaction as the row lock.

### 2.5 `SELECT … FOR UPDATE` in `place_order`
- Two buyers racing for the last unit could both pass a naive stock check and both decrement → `stock = -1`. Locking the product rows for the duration of the order transaction serialises the two checkouts so the second sees `stock = 0` and gets a clean 409.

### 2.6 Single `db.commit()` at the end of `place_order`
- The order header, every line item, every stock decrement, and the cart cleanup are all in the same transaction. If anything raises, the whole thing rolls back — no half-placed orders.

### 2.7 Why hand-written migration instead of `--autogenerate`?
- For an assignment, hand-written migrations are easier to read, explain, and trust. Autogenerate occasionally misses `ondelete`, server defaults, and indexes — all of which we care about.

### 2.8 Custom exception handlers (`RequestValidationError`, `IntegrityError`)
- Default FastAPI returns a verbose nested error array; our handler returns a flat `{"detail": "field: message"}` that's trivial for the frontend to toast.
- `IntegrityError` becomes a clean 409 instead of a 500 with a SQL stack trace leaking to the client.

---

## 3. Frontend architecture

### 3.1 Vite + React + Tailwind
- Vite for instant HMR and a zero-config build.
- Tailwind because the spec demands Flipkart fidelity: tight reproduction of utility-style spacing, colors, and responsive grids is dramatically faster in Tailwind than in CSS Modules. Design tokens live in `tailwind.config.js` so no component hard-codes a hex.

### 3.2 Cart state = Context + `useReducer` (no Redux)
- Cart is the only piece of cross-page state. Reducer keeps state transitions explicit; Context avoids prop-drilling without a global store.
- **Backend is the source of truth.** The reducer just stores the latest server response. No client-side total calculation means no client/server drift.

### 3.3 Cart persists in Postgres, not localStorage
- A user refreshing the tab loads the cart from the API on mount. Cleaner than mirroring state to localStorage; trivial to extend to multi-device when auth lands.

### 3.4 axios + a single response interceptor
- Every endpoint returns `{"detail": "…"}` on error. The interceptor unwraps it into a thrown `Error` with a usable message and a `.status`, so every UI catch is `push(err.message)`.

### 3.5 Debounced search via URL query params
- Search lives in the URL (`?q=…`) so it's shareable and back-button friendly. A 300 ms debounce prevents one API call per keystroke.

### 3.6 Skeletons, toasts, and empty states
- Three states every list-driven page must handle: loading, empty, error. Skeletons match the eventual card shape; empty states explain *why* and offer an action; toasts give immediate feedback for cart mutations.

### 3.7 `useEffect` cancellation flag (`let cancelled = false`)
- Standard pattern for "if the component unmounts (or the dep changes) before the request returns, drop the result." Avoids a React warning about setting state on an unmounted component.

---

## 4. Bonus items implemented

Marked **Good to have (Bonus)** in the spec — each is built and visible in the UI:

| Item                  | Where it lives                                                                                 |
| --------------------- | ---------------------------------------------------------------------------------------------- |
| Responsive design     | Tailwind responsive utilities — grid collapses 5 → 4 → 3 → 2 cols; header search/cart adapt.   |
| Order history         | `/orders` page (`Orders.jsx`) backed by `GET /api/orders`, linked from the header next to Cart. |
| User authentication   | Firebase Auth (email + password), end-to-end. Frontend: `AuthContext`, `ProtectedRoute`, `/login`, `/signup`, axios interceptor that attaches the ID token as a Bearer header. Backend: `app/core/auth.py` verifies the JWT via `google-auth` and upserts a row in the new `users` table. See §7. |
| Wishlist              | `wishlist_items` table with `UNIQUE(user_id, product_id)`. One toggle endpoint covers both add and remove. Heart icon overlay on `ProductCard` (fade-in on hover) and `ProductDetail`. Dedicated `/wishlist` page with "Move to cart". |
| Email notifications   | EmailJS (frontend-only). After a successful `place_order`, `sendOrderConfirmation` posts to EmailJS with the order details and the signed-in user's email. Fire-and-forget — a slow email never blocks the navigation to the confirmation page. See §8. |

Skipped from the bonus list (with reasoning in §5): phone-OTP login (Firebase charges per SMS after a tiny free tier).

## 5. Things I'd improve with more time

| Area               | Improvement                                                                                                  |
| ------------------ | ------------------------------------------------------------------------------------------------------------ |
| Real password reset / verified-email flows | Firebase supports both out of the box (`sendPasswordResetEmail`, `sendEmailVerification`); we just don't expose them yet. ~10 lines per flow. |
| Tests              | pytest with a transactional fixture for the backend; React Testing Library for components.                   |
| Pagination UI      | The API already supports paging; the listing page currently shows page 1. Add an "infinite scroll" or pager. |
| Filters            | Brand, price range, rating filters (the schema supports them; the UI doesn't yet).                            |
| Image storage      | Move from hand-curated Unsplash URLs to your own CDN (S3 + CloudFront) with per-product variants.            |
| Real password reset / verified-email | Firebase supports `sendPasswordResetEmail`, `sendEmailVerification` out of the box; ~10 lines per flow.   |
| Server-side email   | Email currently fires from the client (EmailJS). Move to backend (Celery + SendGrid/SES) to guarantee email even if the user closes the tab between place-order and confirmation. |
| Order status flow  | Currently every order is born `PLACED` and stays there. Add an admin endpoint + cron worker to advance through `SHIPPED` → `DELIVERED`. |
| Error boundaries   | A top-level React error boundary so a render crash doesn't blank the page.                                    |
| Accessibility audit | aria-labels are sprinkled in; a full a11y pass would tighten focus management on the modals/carousel.       |
| Observability      | Structured logs, request IDs, basic Prometheus metrics on `/metrics`.                                         |

---

## 6. Things I deliberately did *not* do

- **Redux / Zustand / TanStack Query** — Cart is the only cross-page state; bringing in a heavier library would be over-engineering and harder to explain.
- **Server-side rendering** — Pure SPA is sufficient for a graded assignment and matches the spec's "React SPA" requirement.
- **Stored procedures / DB-side triggers** — Easier to explain and test business logic in the service layer for an interview.
- **Auto-generated Alembic migrations** — Hand-written so every column, FK option, and index is intentional and reviewable.
- **A `User` model with only one row** — Adding a table that's never written to and never queried is noise; using a constant `DEFAULT_USER_ID` and a swappable dependency is honest.

---

## 7. Authentication design (Firebase, end-to-end)

### Why Firebase Auth and not a custom JWT flow?
- Battle-tested email/password handling, secure password hashing, session persistence, password-reset flows — none of which I want to reinvent for a graded assignment.
- The Firebase SDK ships an `onAuthStateChanged` listener that solves the "is the user logged in?" question across tabs and refreshes — a nice talking point about idiomatic SDK use.

### Why `google-auth` for verification instead of `firebase-admin`?
- `firebase-admin` requires a service-account JSON file. That's one more secret to manage and one more configuration step for a reviewer.
- `google.oauth2.id_token.verify_firebase_token` just needs Google's public certs (fetched and cached automatically) and the project ID. Same cryptographic guarantee, much less setup. ~20 lines in `app/core/auth.py`.

### Why the API key is in `frontend/.env` rather than hard-coded?
- Functionally it doesn't matter — Firebase Web API keys are designed to be public.
- But `.env` lets a different developer run the app against their own Firebase project without editing source. It's also the conventional place reviewers look for configuration.

### How the token flows end-to-end
1. **Frontend**: `signInWithEmailAndPassword` returns a `User` object. `AuthContext` exposes it via `useAuth()`.
2. **Axios interceptor** (`src/api/client.js`): on every outgoing request, calls `user.getIdToken()` (cached, ~free) and sets `Authorization: Bearer <jwt>`.
3. **Backend** (`app/core/auth.py`): `current_user_id` reads the Authorization header, calls `id_token.verify_firebase_token(token, request, audience=FIREBASE_PROJECT_ID)`. Signature is verified against Google's public certs; `aud` claim is checked against our project; expiry is enforced.
4. **User upsert**: on first verification we insert a row in the `users` table keyed by Firebase UID. Subsequent requests look up by UID and reuse the local integer id.
5. **Routers** use the returned local `id` exactly as before — every existing query (`WHERE user_id = :user_id`) continues to work, just with per-user data instead of shared.

### Why a local `users.id` rather than using the Firebase UID directly?
- Keeps `cart_items.user_id` / `orders.user_id` as integers (cheaper FKs, smaller indexes).
- Insulates the data model from the auth provider — swapping Firebase for Auth0 or a custom JWT system tomorrow only changes `app/core/auth.py`.

### What about graceful fallback when no token is sent?
- The dependency returns `DEFAULT_USER_ID` (= 1, the seeded guest user) if either `FIREBASE_PROJECT_ID` is unset OR no Authorization header is present.
- Why: browsing `/api/products` from `/docs` shouldn't require a JWT, and missing the env var shouldn't break local development.
- Bad tokens (invalid signature, wrong audience, malformed Bearer) raise 401 — not a fallback. This distinguishes "no caller identity claimed" from "caller lied about identity".

### `ProtectedRoute` design
- Reads `loading` from `AuthContext` and renders a "Checking sign-in…" placeholder while Firebase rehydrates the session from IndexedDB. Without this, refreshing on `/cart` would briefly flash the login page before bouncing back.
- Passes the current `location` via React Router's `state` so the Login page can redirect back to the originally requested URL after a successful sign-in.

### `CartContext` reacts to auth state
- On login, `useEffect` triggers `refresh()` to pull the user's cart from the backend.
- On logout, it dispatches an empty cart locally — no need to round-trip the backend since we know the cart is gone (the badge update is instant).

### Migration story for existing data
- `0002_users_table` creates the `users` table and inserts `id=1, firebase_uid='__guest__'` so the existing rows in `cart_items` / `orders` (which all referenced `user_id=1` pre-auth) don't violate the new foreign key.
- The serial sequence is then advanced past `1` so new real users start from `2`.
- FK from `orders.user_id` is `ON DELETE RESTRICT` (orders are historical records); FK from `cart_items.user_id` is `ON DELETE CASCADE` (a deleted user's cart is meaningless).

### Interview probes you should expect
- *"Where is the Firebase API key — isn't that a secret?"* → No. It's a project identifier, not an access token. Access is enforced by Firebase Auth, the Authorized Domains list in the Console, and the backend's signature verification.
- *"What happens if the token is expired?"* → The Firebase SDK auto-refreshes on `getIdToken()` (returns a fresh JWT). On the backend, `verify_firebase_token` rejects expired tokens with a `ValueError` which we convert to 401.
- *"What if I change my email in Firebase?"* → The next request carries the new email in the token; the upsert path syncs `users.email`.
- *"Why no `firebase-admin`?"* → It needs a service-account JSON. For pure ID-token verification, `google-auth` does the same crypto with no secrets-on-disk to manage.

---

## 8. Email notifications (EmailJS, frontend-only)

### Why EmailJS over backend SMTP?
- Zero backend changes. We already had FastAPI doing what it should — adding `smtplib` (or worse, Celery + Redis + SendGrid SDK) just for one confirmation email per order is overkill at this scale.
- EmailJS templates are server-side at EmailJS, so a non-developer can tweak the email body without redeploying our app.
- Free tier (200 emails/month) is plenty for a graded assignment + demo.

### Why "fire and forget" instead of awaiting the send?
- The order is already placed and persisted in Postgres the moment `POST /api/orders` returns. Whether the email lands is independent of order success.
- Awaiting EmailJS would force the user to wait on a third-party HTTP call before seeing their confirmation page — a slow EmailJS endpoint would feel like the order itself was slow.
- The `sendOrderConfirmation` helper returns `{ok, reason}` rather than throwing, so the caller can decide whether to surface failures (we toast on success, stay silent on failure to avoid making the user think the *order* failed).

### Why the three EmailJS keys are in `frontend/.env`?
- Same reason as Firebase: they're public client identifiers, not secrets. EmailJS rate-limits abuse via the **Authorized Domains** list in its dashboard — a thief who copies your keys can only hit EmailJS from your declared origins.
- `.env` keeps them out of source control and lets a different reviewer plug in their own EmailJS project.

### What if EmailJS isn't configured?
- `email.js` checks all three env vars on import. If any are blank, it logs a `console.warn` once and `sendOrderConfirmation` returns `{ok:false, reason: 'EmailJS not configured'}` without making a network call.
- The order itself still succeeds — email is a strict-bonus capability layered on top.

### Interview probes you should expect
- *"What if the user closes the tab between place-order and the email send?"* → Right now the email is lost. The fix is to move sending to the backend (Celery worker + SendGrid/SES). Documented as a follow-up in §5.
- *"How do you stop someone abusing your EmailJS keys?"* → EmailJS' Authorized Domains list — only requests from configured origins succeed.
- *"What variables does the template use?"* → `to_email`, `to_name`, `order_number`, `order_total`, `order_items`, `shipping_name`, `shipping_address`, `shipping_city`, `shipping_state`, `shipping_pincode`. Adding a new one is a one-line addition to the `variables` object in `src/services/email.js` plus a template edit in the EmailJS dashboard.

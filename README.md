# Flipkart Clone

[![Deploy](https://github.com/jay12676/Flipkart-Clone/actions/workflows/deploy.yml/badge.svg)](https://github.com/jay12676/Flipkart-Clone/actions/workflows/deploy.yml)

A functional e-commerce web app that replicates Flipkart's design, browsing, cart, wishlist, auth, and checkout flow.

## Stack

| Layer    | Choice                                                     |
| -------- | ---------------------------------------------------------- |
| Frontend | React 18 + Vite, React Router 6, Tailwind CSS              |
| State    | React Context + `useReducer` (cart), Context (toasts)      |
| Backend  | Python 3.12, FastAPI, SQLAlchemy 2.0, Pydantic v2          |
| Database | PostgreSQL + Alembic migrations + idempotent seed script   |
| Auth     | Firebase (email + password), ID-token verification on API  |
| Deploy   | Linux VPS — nginx + systemd uvicorn, Postgres on host      |

## Local development

```bash
# Postgres (Docker)
docker compose up -d

# Backend
cd backend
python -m venv .venv
.venv\Scripts\activate          # macOS/Linux: source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
alembic upgrade head
python -m scripts.seed
uvicorn app.main:app --reload --port 8000

# Frontend
cd frontend
npm install
cp .env.example .env
npm run dev
```

Open `http://localhost:5173`. Vite proxies `/api/*` to the FastAPI server on port 8000, so no CORS config is needed in dev.

## Repository layout

```
backend/
  app/
    core/        Settings, Firebase token verification
    db/          Engine, SessionLocal, Base, get_db
    models/      SQLAlchemy ORM
    schemas/     Pydantic v2 request/response
    routers/     FastAPI endpoints
    services/    Business logic — totals, stock, transactions
    utils/       order_number generator
    main.py      App, CORS, exception handlers
  alembic/       Migrations
  scripts/seed.py
frontend/
  src/
    api/         axios client + per-resource wrappers
    components/  layout, product, cart, common, auth
    context/     AuthContext, CartContext, WishlistContext, ToastContext
    hooks/
    pages/
    utils/
.github/workflows/
  ci.yml         Lint + build on push/PR
  deploy.yml     SSH deploy to VPS on push to main
deploy/
  setup-vps.sh             one-time bootstrap
  deploy.sh                idempotent deploy step
  flipkart-backend.service systemd unit (uvicorn)
  nginx.conf               reverse proxy
docker-compose.yml         local-dev Postgres
```

## Backend env vars (`backend/.env`)

| Variable          | Default                                                                | Notes                            |
| ----------------- | ---------------------------------------------------------------------- | -------------------------------- |
| `DATABASE_URL`    | `postgresql+psycopg2://postgres:postgres@localhost:5432/flipkart_clone` | SQLAlchemy URL                   |
| `CORS_ORIGINS`    | `http://localhost:5173,http://127.0.0.1:5173`                          | Comma-separated allowed origins. In prod set to the VPS origin. |
| `DEFAULT_USER_ID` | `1`                                                                    | Fallback when no Bearer token is sent (lets `/docs` work) |
| `FIREBASE_PROJECT_ID` | *(required for auth)*                                              | Must match the frontend's `VITE_FIREBASE_PROJECT_ID`. |

## Frontend env vars (`frontend/.env`)

| Variable                              | Notes                                                            |
| ------------------------------------- | ---------------------------------------------------------------- |
| `VITE_API_BASE_URL`                   | Empty in dev (Vite proxy). In prod set to `/api` (nginx fronts both). |
| `VITE_FIREBASE_*`                     | From Firebase Console → Project Settings → Your apps. |
| `VITE_EMAILJS_*`                      | From [EmailJS](https://dashboard.emailjs.com). Optional — empty values skip the email step. |

Enable **Email/Password sign-in** in Firebase Console before running the frontend the first time.

## API surface (all under `/api`)

| Method   | Path                          | Description                                  |
| -------- | ----------------------------- | -------------------------------------------- |
| `GET`    | `/health`                     | Liveness probe                               |
| `GET`    | `/categories`                 | List all categories                          |
| `GET`    | `/products?search=&category=` | Paginated product listing with search/filter |
| `GET`    | `/products/{id}`              | Full product detail (incl. images)           |
| `GET`    | `/cart`                       | Current user's cart with server-computed totals |
| `POST`   | `/cart/items`                 | Add to cart (upserts by product_id)          |
| `PATCH`  | `/cart/items/{id}`            | Update quantity                              |
| `DELETE` | `/cart/items/{id}`            | Remove a line                                |
| `POST`   | `/orders`                     | Place order from current cart (transactional)|
| `GET`    | `/orders`                     | Order history                                |
| `GET`    | `/orders/{order_number}`      | Order detail by public order ID              |
| `GET`    | `/wishlist`                   | User's wishlist                              |
| `POST`   | `/wishlist/items`             | Toggle add/remove                            |

## Features

- Product listing — responsive grid, debounced search-by-name, category filter, skeleton loaders, empty states.
- Product detail — image carousel, specs table, price + stock status, Add to Cart and Buy Now.
- Cart — view, change quantity (stock-aware ±), remove, server-computed totals. Persists in Postgres.
- Checkout — address form with client- and server-side validation, summary, place-order, confirmation page with an opaque `OD…` order ID.
- Auth — Firebase Auth on the client, Firebase ID-token verification on the API. `cart_items.user_id` and `orders.user_id` are real FKs to a `users` table auto-upserted on first sign-in. Cart, checkout, orders, and wishlist are gated behind `<ProtectedRoute>` and server-side auth.
- Orders — `/orders` lists every past order newest-first with status pill, items, total, link to the confirmation page.
- Wishlist — heart on each product card and the detail page. Toggle via `POST /api/wishlist/items`. Per-user, persisted, `UNIQUE(user_id, product_id)`.
- Email — on place-order the frontend fires a confirmation email via EmailJS. No backend SMTP.
- Responsive — grid collapses 5 → 4 → 3 → 2 from xl down; header search/cart adapt on small screens.

## Production deploy (Linux VPS)

The app deploys to a single VPS: nginx serves the built frontend and reverse-proxies `/api/*` to a uvicorn process managed by systemd. Postgres runs on the same box.

See [`deploy/README.md`](deploy/README.md) for the full walkthrough. TL;DR:

```bash
ssh root@<VPS_IP>
git clone https://github.com/<you>/Flipkart-Clone.git /tmp/flipkart-clone
REPO_URL=https://github.com/<you>/Flipkart-Clone.git \
  bash /tmp/flipkart-clone/deploy/setup-vps.sh

# edit /srv/flipkart-clone/backend/.env and frontend/.env, then:
sudo -u deploy bash /srv/flipkart-clone/deploy/deploy.sh
```

After the first manual deploy, pushes to `main` ship automatically via `.github/workflows/deploy.yml`. It SSHes in, `git pull`s, installs deps, runs migrations, restarts the backend, builds the frontend, and reloads nginx. Required repo secrets: `SSH_IP`, `SSH_USER`, `SSH_PASS`, `SSH_PATH`.

## Notes

- All totals computed server-side.
- `SELECT … FOR UPDATE` row-locking inside `place_order` prevents overselling under concurrent checkouts.
- Centralised exception handlers translate validation and integrity errors into clean `{"detail": "…"}` JSON.
- Firebase API key is intentionally embedded in client code — access is gated by Firebase Auth + Authorized Domains. EmailJS keys are also public client identifiers, rate-limited via EmailJS Authorized Domains.
- Shipping is flat ₹40 below ₹500 subtotal and free above, mirroring Flipkart's pattern.

See `DESIGN_DECISIONS.md` for the *why* behind each major choice.

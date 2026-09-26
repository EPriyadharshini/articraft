# Articraft Marketplace

Articraft is a handmade-goods marketplace with a React/Vite storefront, an Express API, MongoDB persistence, JWT authentication, Cloudinary uploads, and Razorpay checkout.

## Project layout

- `frontend/` - React, Vite, Tailwind CSS, and protected customer/artist/admin pages
- `backend/` - Express ES modules, Mongoose models, API routes, seed data, and security middleware

## Local setup

Requirements: Node.js 20+, MongoDB (local replica set or MongoDB Atlas for payment transactions), and npm.

```bash
npm install
npm run install:all
Copy-Item backend\.env.example backend\.env
Copy-Item frontend\.env.example frontend\.env
npm run seed --prefix backend
npm run dev
```

Before running the seed command, set `SEED_PASSWORD` to a non-production password of at least eight characters. The seed command deletes the application's user, artist, product, category, and review records.

Set real values in `backend/.env` before starting. The API deliberately refuses to start unless `MONGODB_URI`, `JWT_SECRET` (at least 32 characters), and `CLIENT_URL` are present. Optional Razorpay and Cloudinary variables are required when those features are used.

The storefront runs at `http://localhost:5173`; the API runs at the port configured by `PORT` (the example defaults to `5000`).

## API conventions

Successful and error responses use:

```json
{ "success": true, "data": {}, "message": "..." }
```

The API is rooted at `/api`. Health check: `GET /api/health`.

| Area | Endpoints |
| --- | --- |
| Auth | `POST /auth/register`, `POST /auth/login`, `GET /auth/me`, `POST /auth/forgot-password`, `POST /auth/reset-password/:token` |
| Catalog | `GET /products`, `GET /products/:id`, artist-owned product CRUD |
| Artists | `GET /users/artists/:id`, follow/unfollow, profile update |
| Shopping | authenticated `/cart/*` and `/wishlist/*` |
| Orders | `POST /orders/checkout`, `POST /orders/verify`, customer history, artist seller-order status |
| Reviews | delivered-order-only review creation and product reviews |
| Admin | stats, users, product moderation, categories, orders, revenue |

Prices, totals, shipping, tax, roles, ownership, stock, and rating aggregates are computed by the server. Passwords are never returned.

## Deployment

### Render API

The root `render.yaml` provisions the backend web service. Connect the repository to Render and provide the secret environment variables requested by the blueprint. Use the deployed API URL as the frontend `VITE_API_URL`, and set backend `CLIENT_URL` to the exact deployed frontend origin.

### Vercel frontend

Import `frontend/` as the Vercel project, set `VITE_API_URL` to the Render API URL ending in `/api`, and deploy. `frontend/vercel.json` rewrites client-side routes to the SPA entry point.

For production payments, configure Razorpay credentials and use an Atlas or replica-set MongoDB deployment so checkout verification can commit its stock/order transaction atomically.

### Razorpay webhook

Configure Razorpay to send `payment.captured` and `order.paid` events to `https://YOUR_API_HOST/api/orders/webhook`. Set the webhook secret generated in the Razorpay dashboard as `RAZORPAY_WEBHOOK_SECRET` on the API. Do not place this secret in the frontend or commit it to the repository. The endpoint verifies the Razorpay signature and safely treats already-paid orders as idempotent.

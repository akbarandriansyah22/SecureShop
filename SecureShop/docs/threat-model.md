# Threat model (lab API)

Scope: the Go API in this folder (auth, catalog, cart, orders). This is a portfolio lab, not a production storefront.

## Assets

- Customer accounts (email, password hash, JWT, `token_version`)
- Cart lines and orders, including shipping address and phone
- Admin actions that change catalog and order status
- `JWT_SECRET` and `METRICS_TOKEN`

## Threats and controls

| Threat | What goes wrong | Control in this repo |
| --- | --- | --- |
| IDOR | User A reads or changes user B's order or cart line by guessing an id | Customer order read/cancel checks `order.user_id`. Cart GET/PUT/DELETE uses the caller's cart; quantity updates require `cart_items.cart_id`. Admin status changes stay on `/api/admin` behind the admin role. |
| Brute force | Repeated login or register guesses | In-memory limit on `POST /api/auth/login` and `/api/auth/register` (and `/auth/*`): 10 requests per minute per IP and email, then HTTP 429. Not shared across processes. |
| Secret leak | JWT secret or metrics token in git, images, or logs | Gitleaks in CI, secrets from env, metrics behind `METRICS_TOKEN`. Do not commit `.env`. |
| Clickjacking / content sniffing | Browser treats an API response as a framed page or guesses a content type | `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin` |

## Accepted lab risk

`CORS_ALLOWED_ORIGINS=*` in `.env.example` and the compose default allows any browser origin to call the API. Credentials are disabled while the value is `*`. Production config rejects `*`. Set an explicit origin list before treating the API as internet-facing.

# SecureShop web

Storefront SecureShop. Next.js App Router, TypeScript, Tailwind CSS. Katalog, auth, keranjang, checkout, order customer, dan admin produk/kategori/order.

Ini bagian depan toko, bukan API-nya. API Go ada di `ecommerce-api/server` dan didokumentasikan di [`../README.md`](../README.md). README repo ada di root.

Browser menulis cart, order, dan admin lewat `app/api/proxy/[...path]` (cookie `access_token` → `Authorization: Bearer`). Cookie `httpOnly`, `SameSite=Lax`, `maxAge` 2 jam (sama dengan JWT). Proxy hanya meneruskan prefix `cart`, `cart/items`, `orders`, `admin/products`, `admin/categories`, `admin/orders`; path lain 404. `middleware.ts` mengarahkan `/admin`, `/checkout`, `/orders`, `/account` tanpa cookie ke `/login`. Role admin tetap dicek di layout (`role_id === 1`). `next.config.ts` mengirim `nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy`, `Permissions-Policy`, dan CSP (`script-src`/`style-src` masih `'unsafe-inline'`). Login, register, logout, dan proxy menolak `Origin` yang bukan same-origin.

Checkout mengirim `payment_method`. Tidak ada payment gateway.

## Alur uji customer

1. `npm run dev` di `apps/web` (port **3001**). API Go di `:8080`.
2. Login `web-auth-slice@example.com` / `Testpass1`, atau register. Role register = customer (`role_id = 2`).
3. Beranda atau `/search?q=` → buka `/products/[slug]` → Tambah ke keranjang.
4. `/cart` → `/checkout` (alamat, telepon, catatan, `payment_method`) → `/orders/[id]`.
5. `/orders` daftar order. Batal hanya untuk status `pending` atau `paid`.
6. Customer yang membuka `/admin` melihat teks Forbidden.

`shipping_phone` dikirim form, tetapi handler `POST /api/orders` tidak menyimpannya. Detail order tidak berisi array item. Hapus item cart memakai `DELETE /api/cart/items/:id`.

## Alur uji admin

```sql
UPDATE users SET role_id = 1 WHERE email = 'alamat@example.com';
```

Login lagi. Header menampilkan Admin.

- `/admin/products`: buat produk, aktifkan, nonaktifkan, hapus.
- `/admin/categories`: buat dan hapus.
- `/admin/orders`: ubah status ke `pending`, `paid`, `shipped`, `delivered`, atau `cancelled`.

Daftar produk publik memakai `GET /api/products`. Mapper backend mengisi `is_active` hanya jika field itu di-set, jadi daftar bisa menampilkan nonaktif meskipun produk aktif. Aktif/nonaktif tetap memanggil endpoint admin.

## Akun uji

Register lewat `/register` membuat customer (`role_id = 2`). Password mengikuti aturan API: minimal 8 karakter, ada huruf besar, huruf kecil, dan angka.

Admin tidak dibuat dari form. Setelah user ada, ubah role di database:

```sql
UPDATE users SET role_id = 1 WHERE email = 'alamat@example.com';
```

Lalu login lagi. `/admin` menolak session customer dengan teks Forbidden. Tanpa cookie, `/admin` diarahkan ke `/login`.

## Menjalankan

1. Jalankan API Go di `:8080`.
2. Dari repo:

```bash
cd apps/web && npm i && npm run dev
```

Dev server: `http://localhost:3001` (Grafana memakai 3000). `API_URL` dibaca server component dari `.env.local` (contoh: `API_URL=http://localhost:8080`). Katalog publik memanggil API itu langsung. Mutasi lewat BFF proxy.

Storefront belum jadi service Compose. Dockerfile di folder ini belum dipakai untuk menjalankan toko.

Role backend: `1` admin, `2` customer. Auth: JWT Bearer.

```
apps/web/
  app/
    layout.tsx
    globals.css
    page.tsx
    (auth)/login/page.tsx
    (auth)/register/page.tsx
    (store)/products/[slug]/page.tsx
    (store)/search/page.tsx
    (store)/cart/page.tsx
    (store)/checkout/page.tsx
    (store)/orders/page.tsx
    (store)/orders/[id]/page.tsx
    (store)/account/page.tsx
    (admin)/admin/page.tsx
    (admin)/admin/products/page.tsx
    (admin)/admin/categories/page.tsx
    (admin)/admin/orders/page.tsx
    api/auth/login/route.ts
    api/auth/logout/route.ts
    api/auth/register/route.ts
    api/proxy/[...path]/route.ts
  components/layout/
  components/products/
  components/cart/
  components/orders/
  components/admin/
  components/ui/
  hooks/
  lib/api.ts
  lib/auth.ts
  lib/types.ts
  public/
  Dockerfile
  .env.example
  next.config.ts
  package.json
  tsconfig.json
  README.md
```

## Halaman → endpoint

| Halaman | Endpoint backend |
| --- | --- |
| `/` | `GET /api/products`, `GET /api/categories` |
| `/login` | `POST /api/auth/login` |
| `/register` | `POST /api/auth/register` |
| `/products/[slug]` | `GET /api/products/slug/:slug` |
| `/search` | `GET /api/products/search?q=`, atau `GET /api/products/category/:id` jika `?category=` |
| `/cart` | `GET/POST/DELETE /api/cart`, `POST/DELETE /api/cart/items` |
| `/checkout` | `POST /api/orders` |
| `/orders` | `GET /api/orders` |
| `/orders/[id]` | `GET /api/orders/:id`, `POST /api/orders/:id/cancel` |
| `/account` | `GET /api/auth/profile`, `PUT /api/auth/profile`, `PUT /api/auth/change-password` |
| `/admin` | `GET /api/admin/orders` |
| `/admin/products` | CRUD `/api/admin/products` |
| `/admin/categories` | CRUD `/api/admin/categories` |
| `/admin/orders` | `GET /api/admin/orders`, `PUT /api/admin/orders/:id/status` |

`GET /api/admin/orders` memakai bungkus `{ success, message, data, meta }`, bukan `{ page, limit, total }` di root. UI membaca `data` dan `meta.total_items`.

Endpoint katalog yang belum punya halaman khusus: `GET /api/products/:id`, `GET /api/categories/:id`, `GET /api/categories/:id/products`, `GET /api/categories/:id/subcategories`.

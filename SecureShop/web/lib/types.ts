// JSON dari GET /api/products (item di data) dan GET /api/products/slug/:slug.
// List mapper hanya mengisi id, name, slug, price, stock.
// Detail mapper hanya mengisi id, name, slug, price, stock, is_active.
// Field lain ada di struct JSON dan kosong/omitempty bila tidak di-set.

export type Product = {
  id: number;
  name: string;
  slug: string;
  description?: string;
  price: number;
  stock: number;
  sku?: string;
  image_url?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type Category = {
  id: number;
  name: string;
  slug: string;
  description?: string;
  parent_id?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

// GET /api/categories memakai utils.SuccessResponse.
export type ApiEnvelope<T> = {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
};

// GET /api/products memakai models.PaginatedResponse (bukan bungkus meta).
// Field success tidak di-set di service, jadi nilainya false meskipun HTTP 200.
// UserResponse dari data.user (login/register) dan data (GET /api/auth/profile).
// Service hanya mengisi id, email, full_name, role_id, is_active.
// created_at ikut ter-serialize (zero time bila tidak di-set). phone, address, role_name omitempty.
export type User = {
  id: number;
  email: string;
  full_name: string;
  phone?: string;
  address?: string;
  role_id: number;
  role_name?: string;
  is_active: boolean;
  created_at: string;
};

// Isi data pada POST /api/auth/login (200) dan POST /api/auth/register (201).
export type LoginResponse = {
  token: string;
  user: User;
};

export type RegisterRequest = {
  email: string;
  password: string;
  full_name: string;
};

// GET /api/cart → utils.SuccessResponse data = CartResponse.
// Curl tanpa cart: HTTP 500 {"success":false,"error":"Failed to get cart"}.
// Service saat ini mengembalikan items kosong (hasil GetCartItems tidak dimasukkan).
export type SqlNullString = { String: string; Valid: boolean };

export type CartProduct = {
  id: number;
  name: string;
  slug: string;
  description: SqlNullString;
  price: number;
  stock: number;
  sku?: SqlNullString;
  image_url: SqlNullString;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type CartItem = {
  id: number;
  cart_id: number;
  product_id: number;
  quantity: number;
  price: number;
  product: CartProduct;
  created_at: string;
  updated_at: string;
};

export type Cart = {
  id: number;
  user_id: number;
  items: CartItem[] | null;
  total_price: number;
  total_quantity: number;
};

// GET /api/orders dan GET /api/orders/:id memakai OrderDetailResponse.
// notes adalah string (bukan sql.NullString).
export type OrderItem = {
  id: number;
  order_id: number;
  product_id: number;
  quantity: number;
  price: number;
  subtotal: number;
  created_at: string;
};

export type Order = {
  id: number;
  user_id: number;
  order_number: string;
  status: string;
  total_amount: number;
  payment_method: string;
  shipping_address: string;
  shipping_phone: string;
  notes: string;
  created_at: string;
  updated_at: string;
};

export type PageMeta = {
  page: number;
  limit: number;
  total_items: number;
  total_pages: number;
};

export type ProductListResponse = {
  success: boolean;
  data: Product[] | null;
  page: number;
  limit: number;
  total: number;
};

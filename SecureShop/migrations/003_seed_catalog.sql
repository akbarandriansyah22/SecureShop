-- SecureShop catalog seed — LOCAL ONLY.
-- Jangan commit ke GitHub kecuali kamu memang mau.
--
-- Prasyarat: 001_init.sql sudah jalan (tabel categories, products, product_categories ada).
-- Jalankan:
--   docker compose exec -T postgres psql -U postgres -d ecommerce -f - < migrations/003_seed_catalog.sql
-- atau dari host:
--   psql -U postgres -d ecommerce -f ecommerce-api/migrations/003_seed_catalog.sql
--
-- image_url harus URL http(s) penuh. Frontend safeImageSrc menolak path relatif.

BEGIN;

INSERT INTO categories (name, slug, description, is_active)
VALUES
  ('Living Room', 'living-room', 'Sofa, meja, lampu, dan speaker ruang tamu.', TRUE),
  ('Bedroom', 'bedroom', 'Tempat tidur dan lampu sisi tempat tidur.', TRUE),
  ('Kitchen', 'kitchen', 'Kursi makan dan peralatan dapur.', TRUE),
  ('Audio', 'audio', 'Headphone dan speaker.', TRUE)
ON CONFLICT (slug) DO UPDATE
SET name = EXCLUDED.name,
    description = EXCLUDED.description,
    is_active = TRUE,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO products (name, slug, description, price, stock, sku, image_url, is_active)
VALUES
  (
    'Aria Over-Ear Headphones',
    'aria-over-ear-headphones',
    'Headphone over-ear dengan bantalan memory foam. Cocok untuk hero homepage SecureShop.',
    1299000, 24, 'SS-AUD-001',
    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1200&q=80',
    TRUE
  ),
  (
    'Nimbus Bluetooth Speaker',
    'nimbus-bluetooth-speaker',
    'Speaker portable kain mesh, bass cukup untuk ruang kecil.',
    899000, 18, 'SS-AUD-002',
    'https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=1200&q=80',
    TRUE
  ),
  (
    'Harbor Linen Sofa',
    'harbor-linen-sofa',
    'Sofa 3 dudukan linen abu-abu, kaki kayu oak.',
    8499000, 6, 'SS-LIV-001',
    'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1200&q=80',
    TRUE
  ),
  (
    'Slate Oak Coffee Table',
    'slate-oak-coffee-table',
    'Meja kopi oak dengan tepi membulat.',
    2199000, 10, 'SS-LIV-002',
    'https://images.unsplash.com/photo-1533090481720-856c6e3c1fdc?auto=format&fit=crop&w=1200&q=80',
    TRUE
  ),
  (
    'Arc Floor Lamp',
    'arc-floor-lamp',
    'Lampu lantai lengkung, shade linen, tinggi 160 cm.',
    1599000, 12, 'SS-LIV-003',
    'https://images.unsplash.com/photo-1507473881160-42d305d25eed?auto=format&fit=crop&w=1200&q=80',
    TRUE
  ),
  (
    'Cloud Platform Bed',
    'cloud-platform-bed',
    'Tempat tidur platform kayu, headboard kain, ukuran queen.',
    6799000, 4, 'SS-BED-001',
    'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80',
    TRUE
  ),
  (
    'Pebble Nightstand',
    'pebble-nightstand',
    'Nakas satu laci, finishing natural, handle tersembunyi.',
    989000, 16, 'SS-BED-002',
    'https://images.unsplash.com/photo-1551298370-9d3d53740c72?auto=format&fit=crop&w=1200&q=80',
    TRUE
  ),
  (
    'Halo Bedside Lamp',
    'halo-bedside-lamp',
    'Lampu meja kaca opal, dimmer putar.',
    459000, 20, 'SS-BED-003',
    'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&w=1200&q=80',
    TRUE
  ),
  (
    'Willow Dining Chair',
    'willow-dining-chair',
    'Kursi makan kayu dengan dudukan rotan. Dijual satuan.',
    749000, 28, 'SS-KIT-001',
    'https://images.unsplash.com/photo-1503602642458-232111445657?auto=format&fit=crop&w=1200&q=80',
    TRUE
  ),
  (
    'Ember Gooseneck Kettle',
    'ember-gooseneck-kettle',
    'Teko leher angsa stainless 1.2L untuk pour-over.',
    389000, 22, 'SS-KIT-002',
    'https://images.unsplash.com/photo-1570222094114-d054a817e56b?auto=format&fit=crop&w=1200&q=80',
    TRUE
  )
ON CONFLICT (slug) DO UPDATE
SET name = EXCLUDED.name,
    description = EXCLUDED.description,
    price = EXCLUDED.price,
    stock = EXCLUDED.stock,
    sku = EXCLUDED.sku,
    image_url = EXCLUDED.image_url,
    is_active = TRUE,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO product_categories (product_id, category_id)
SELECT p.id, c.id
FROM products p
JOIN categories c ON
  (p.slug IN ('harbor-linen-sofa', 'slate-oak-coffee-table', 'arc-floor-lamp', 'nimbus-bluetooth-speaker') AND c.slug = 'living-room')
  OR (p.slug IN ('cloud-platform-bed', 'pebble-nightstand', 'halo-bedside-lamp') AND c.slug = 'bedroom')
  OR (p.slug IN ('willow-dining-chair', 'ember-gooseneck-kettle') AND c.slug = 'kitchen')
  OR (p.slug IN ('aria-over-ear-headphones', 'nimbus-bluetooth-speaker') AND c.slug = 'audio')
ON CONFLICT (product_id, category_id) DO NOTHING;

COMMIT;

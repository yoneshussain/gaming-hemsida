-- Products catalogue (public demo data)
CREATE TABLE public.products (
  sku TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  platform TEXT NOT NULL CHECK (platform IN ('ps5','xbox','pc')),
  format TEXT NOT NULL CHECK (format IN ('physical','digital')),
  genre TEXT NOT NULL,
  price_minor INTEGER NOT NULL CHECK (price_minor >= 0),
  currency TEXT NOT NULL DEFAULT 'SEK',
  description TEXT NOT NULL DEFAULT '',
  compatibility TEXT NOT NULL DEFAULT '',
  delivery_note TEXT NOT NULL DEFAULT '',
  image_key TEXT NOT NULL DEFAULT '',
  available BOOLEAN NOT NULL DEFAULT true,
  max_per_order INTEGER NOT NULL DEFAULT 10 CHECK (max_per_order > 0),
  featured BOOLEAN NOT NULL DEFAULT false,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.products TO anon;
GRANT SELECT ON public.products TO authenticated;
GRANT ALL ON public.products TO service_role;

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view products"
  ON public.products FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Orders (private: written and read only by the server / backend dashboard)
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_reference TEXT NOT NULL UNIQUE,
  idempotency_key TEXT NOT NULL UNIQUE,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  phone TEXT,
  street_address TEXT,
  postal_code TEXT,
  city TEXT,
  country TEXT NOT NULL DEFAULT 'Sweden',
  requires_shipping BOOLEAN NOT NULL DEFAULT false,
  subtotal_minor INTEGER NOT NULL,
  shipping_minor INTEGER NOT NULL DEFAULT 0,
  total_minor INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'SEK',
  status TEXT NOT NULL DEFAULT 'demo_saved',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT ALL ON public.orders TO service_role;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  sku TEXT NOT NULL,
  title TEXT NOT NULL,
  platform TEXT NOT NULL,
  format TEXT NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price_minor INTEGER NOT NULL,
  line_total_minor INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT ALL ON public.order_items TO service_role;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX idx_products_platform ON public.products(platform);
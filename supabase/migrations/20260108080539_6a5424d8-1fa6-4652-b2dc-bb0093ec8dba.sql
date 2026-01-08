-- Create orders table
CREATE TABLE public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  merchant_id uuid NOT NULL REFERENCES public.merchant_profiles(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled')),
  payment_method text NOT NULL CHECK (payment_method IN ('mpesa', 'airtel', 'card', 'cash')),
  payment_status text NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
  subtotal numeric NOT NULL DEFAULT 0,
  delivery_fee numeric NOT NULL DEFAULT 0,
  total_amount numeric NOT NULL DEFAULT 0,
  tracking_number text,
  -- Delivery address
  delivery_full_name text NOT NULL,
  delivery_phone text NOT NULL,
  delivery_region text NOT NULL,
  delivery_district text NOT NULL,
  delivery_street text NOT NULL,
  delivery_landmark text,
  -- Timestamps
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create order_items table
CREATE TABLE public.order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE SET NULL,
  product_name text NOT NULL,
  product_image text,
  price numeric NOT NULL,
  quantity integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Create quotations table
CREATE TABLE public.quotations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  merchant_id uuid NOT NULL REFERENCES public.merchant_profiles(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'quoted', 'accepted', 'rejected', 'expired')),
  message text,
  merchant_response text,
  quoted_price numeric,
  valid_until timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create quotation_items table
CREATE TABLE public.quotation_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quotation_id uuid NOT NULL REFERENCES public.quotations(id) ON DELETE CASCADE,
  product_id uuid REFERENCES public.products(id) ON DELETE SET NULL,
  product_name text NOT NULL,
  quantity integer NOT NULL DEFAULT 1,
  specifications text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotation_items ENABLE ROW LEVEL SECURITY;

-- Orders policies
CREATE POLICY "Users can view their own orders"
ON public.orders FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own orders"
ON public.orders FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Merchants can view orders for their store"
ON public.orders FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.merchant_profiles mp
  WHERE mp.id = orders.merchant_id AND mp.user_id = auth.uid()
));

CREATE POLICY "Merchants can update orders for their store"
ON public.orders FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM public.merchant_profiles mp
  WHERE mp.id = orders.merchant_id AND mp.user_id = auth.uid()
));

CREATE POLICY "Admins can view all orders"
ON public.orders FOR SELECT
USING (has_role(auth.uid(), 'admin'));

-- Order items policies
CREATE POLICY "Users can view their order items"
ON public.order_items FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.orders o
  WHERE o.id = order_items.order_id AND o.user_id = auth.uid()
));

CREATE POLICY "Users can create order items for their orders"
ON public.order_items FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM public.orders o
  WHERE o.id = order_items.order_id AND o.user_id = auth.uid()
));

CREATE POLICY "Merchants can view order items for their orders"
ON public.order_items FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.orders o
  JOIN public.merchant_profiles mp ON mp.id = o.merchant_id
  WHERE o.id = order_items.order_id AND mp.user_id = auth.uid()
));

CREATE POLICY "Admins can view all order items"
ON public.order_items FOR SELECT
USING (has_role(auth.uid(), 'admin'));

-- Quotations policies
CREATE POLICY "Users can view their own quotations"
ON public.quotations FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own quotations"
ON public.quotations FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own quotations"
ON public.quotations FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Merchants can view quotations for their store"
ON public.quotations FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.merchant_profiles mp
  WHERE mp.id = quotations.merchant_id AND mp.user_id = auth.uid()
));

CREATE POLICY "Merchants can update quotations for their store"
ON public.quotations FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM public.merchant_profiles mp
  WHERE mp.id = quotations.merchant_id AND mp.user_id = auth.uid()
));

CREATE POLICY "Admins can view all quotations"
ON public.quotations FOR SELECT
USING (has_role(auth.uid(), 'admin'));

-- Quotation items policies
CREATE POLICY "Users can view their quotation items"
ON public.quotation_items FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.quotations q
  WHERE q.id = quotation_items.quotation_id AND q.user_id = auth.uid()
));

CREATE POLICY "Users can create quotation items"
ON public.quotation_items FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM public.quotations q
  WHERE q.id = quotation_items.quotation_id AND q.user_id = auth.uid()
));

CREATE POLICY "Merchants can view quotation items for their store"
ON public.quotation_items FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.quotations q
  JOIN public.merchant_profiles mp ON mp.id = q.merchant_id
  WHERE q.id = quotation_items.quotation_id AND mp.user_id = auth.uid()
));

CREATE POLICY "Admins can view all quotation items"
ON public.quotation_items FOR SELECT
USING (has_role(auth.uid(), 'admin'));

-- Add triggers for updated_at
CREATE TRIGGER update_orders_updated_at
BEFORE UPDATE ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_quotations_updated_at
BEFORE UPDATE ON public.quotations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add realtime for orders and quotations
ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
ALTER PUBLICATION supabase_realtime ADD TABLE public.quotations;
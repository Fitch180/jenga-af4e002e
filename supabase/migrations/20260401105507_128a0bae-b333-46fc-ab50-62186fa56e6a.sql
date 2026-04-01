
-- Volume discounts table
CREATE TABLE public.volume_discounts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  min_quantity INTEGER NOT NULL,
  discount_percentage NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.volume_discounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view volume discounts" ON public.volume_discounts FOR SELECT USING (true);
CREATE POLICY "Merchants can manage their volume discounts" ON public.volume_discounts FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.products p JOIN public.merchant_profiles mp ON mp.id = p.merchant_id WHERE p.id = volume_discounts.product_id AND mp.user_id = auth.uid())
);
CREATE POLICY "Merchants can update their volume discounts" ON public.volume_discounts FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.products p JOIN public.merchant_profiles mp ON mp.id = p.merchant_id WHERE p.id = volume_discounts.product_id AND mp.user_id = auth.uid())
);
CREATE POLICY "Merchants can delete their volume discounts" ON public.volume_discounts FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.products p JOIN public.merchant_profiles mp ON mp.id = p.merchant_id WHERE p.id = volume_discounts.product_id AND mp.user_id = auth.uid())
);

-- Order status history table for delivery tracking
CREATE TABLE public.order_status_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  note TEXT,
  location TEXT,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.order_status_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their order status history" ON public.order_status_history FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_status_history.order_id AND o.user_id = auth.uid())
);
CREATE POLICY "Merchants can view order status history" ON public.order_status_history FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.orders o JOIN public.merchant_profiles mp ON mp.id = o.merchant_id WHERE o.id = order_status_history.order_id AND mp.user_id = auth.uid())
);
CREATE POLICY "Admins can view all order status history" ON public.order_status_history FOR SELECT USING (
  has_role(auth.uid(), 'admin'::app_role)
);
CREATE POLICY "Merchants can insert order status history" ON public.order_status_history FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.orders o JOIN public.merchant_profiles mp ON mp.id = o.merchant_id WHERE o.id = order_status_history.order_id AND mp.user_id = auth.uid())
);
CREATE POLICY "Admins can insert order status history" ON public.order_status_history FOR INSERT WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role)
);

-- Enable realtime for order_status_history
ALTER PUBLICATION supabase_realtime ADD TABLE public.order_status_history;

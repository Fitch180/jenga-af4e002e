-- Create products table
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id UUID NOT NULL REFERENCES public.merchant_profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC(10, 2) NOT NULL,
  category TEXT NOT NULL,
  image_url TEXT,
  stock INTEGER NOT NULL DEFAULT 0,
  unit TEXT NOT NULL DEFAULT 'item',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Create index for faster merchant lookups
CREATE INDEX idx_products_merchant_id ON public.products(merchant_id);
CREATE INDEX idx_products_category ON public.products(category);

-- Policy: Anyone can view products from approved merchants
CREATE POLICY "Anyone can view products from approved merchants"
ON public.products
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.merchant_profiles mp
    WHERE mp.id = products.merchant_id
    AND mp.approval_status = 'approved'
  )
);

-- Policy: Merchants can insert their own products
CREATE POLICY "Merchants can insert their own products"
ON public.products
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.merchant_profiles mp
    WHERE mp.id = products.merchant_id
    AND mp.user_id = auth.uid()
    AND mp.approval_status = 'approved'
  )
);

-- Policy: Merchants can update their own products
CREATE POLICY "Merchants can update their own products"
ON public.products
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.merchant_profiles mp
    WHERE mp.id = products.merchant_id
    AND mp.user_id = auth.uid()
  )
);

-- Policy: Merchants can delete their own products
CREATE POLICY "Merchants can delete their own products"
ON public.products
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.merchant_profiles mp
    WHERE mp.id = products.merchant_id
    AND mp.user_id = auth.uid()
  )
);

-- Policy: Admins can view all products
CREATE POLICY "Admins can view all products"
ON public.products
FOR SELECT
USING (has_role(auth.uid(), 'admin'));

-- Create trigger for updated_at
CREATE TRIGGER update_products_updated_at
BEFORE UPDATE ON public.products
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
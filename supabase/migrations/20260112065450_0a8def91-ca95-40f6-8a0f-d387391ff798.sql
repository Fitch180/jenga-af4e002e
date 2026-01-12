-- Add new columns to merchant_profiles
ALTER TABLE public.merchant_profiles 
ADD COLUMN IF NOT EXISTS phone_number text,
ADD COLUMN IF NOT EXISTS email text,
ADD COLUMN IF NOT EXISTS description text,
ADD COLUMN IF NOT EXISTS operating_hours jsonb DEFAULT '{}';

-- Create merchant_tags table for available tags
CREATE TABLE public.merchant_tags (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL UNIQUE,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create junction table for merchant-tag relationships
CREATE TABLE public.merchant_profile_tags (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  merchant_id uuid NOT NULL REFERENCES public.merchant_profiles(id) ON DELETE CASCADE,
  tag_id uuid NOT NULL REFERENCES public.merchant_tags(id) ON DELETE CASCADE,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(merchant_id, tag_id)
);

-- Enable RLS on new tables
ALTER TABLE public.merchant_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.merchant_profile_tags ENABLE ROW LEVEL SECURITY;

-- RLS policies for merchant_tags (anyone can view, only admins can modify)
CREATE POLICY "Anyone can view merchant tags"
ON public.merchant_tags FOR SELECT
USING (true);

CREATE POLICY "Admins can insert merchant tags"
ON public.merchant_tags FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update merchant tags"
ON public.merchant_tags FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete merchant tags"
ON public.merchant_tags FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS policies for merchant_profile_tags
CREATE POLICY "Anyone can view merchant profile tags"
ON public.merchant_profile_tags FOR SELECT
USING (true);

CREATE POLICY "Merchants can manage their own tags"
ON public.merchant_profile_tags FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM merchant_profiles mp
  WHERE mp.id = merchant_profile_tags.merchant_id
  AND mp.user_id = auth.uid()
));

CREATE POLICY "Merchants can delete their own tags"
ON public.merchant_profile_tags FOR DELETE
USING (EXISTS (
  SELECT 1 FROM merchant_profiles mp
  WHERE mp.id = merchant_profile_tags.merchant_id
  AND mp.user_id = auth.uid()
));

-- Insert some default tags
INSERT INTO public.merchant_tags (name) VALUES 
  ('Electronics'),
  ('Fashion'),
  ('Food & Beverages'),
  ('Home & Garden'),
  ('Health & Beauty'),
  ('Sports & Outdoors'),
  ('Books & Stationery'),
  ('Automotive'),
  ('Services'),
  ('Agriculture'),
  ('Construction'),
  ('Wholesale')
ON CONFLICT (name) DO NOTHING;
-- Add image_urls array column for multiple images (up to 5)
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS image_urls text[] DEFAULT '{}';

-- Add item_type column to distinguish products from services
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS item_type text NOT NULL DEFAULT 'product';

-- Make price nullable for services (services can have "Request Quote" instead of fixed price)
ALTER TABLE public.products ALTER COLUMN price DROP NOT NULL;

-- Add national_id_number to merchant_profiles
ALTER TABLE public.merchant_profiles ADD COLUMN IF NOT EXISTS national_id_number text;

-- Add check constraint for item_type
ALTER TABLE public.products ADD CONSTRAINT check_item_type CHECK (item_type IN ('product', 'service'));

-- Update RLS policies for messages to allow admins to view all
CREATE POLICY "Admins can view all messages" 
ON public.messages 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Update RLS policies for conversations to allow admins to view all
CREATE POLICY "Admins can view all conversations" 
ON public.conversations 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));
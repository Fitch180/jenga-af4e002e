-- Add category column to merchant_profiles for consistent filtering
ALTER TABLE public.merchant_profiles 
ADD COLUMN IF NOT EXISTS category TEXT;

-- Update merchant_tags table with the correct categories (delete old ones, add new ones)
DELETE FROM public.merchant_tags;

-- Insert standardized categories
INSERT INTO public.merchant_tags (name) VALUES
('ARCHITECTS'),
('ENGINEERS'),
('CONTRACTORS'),
('BUILDING'),
('PLUMBING'),
('FLOORING'),
('ELECTRICAL'),
('PAINTING'),
('TILES'),
('FURNITURE'),
('LIGHTING'),
('DECOR'),
('GARDENING'),
('REPAIR');
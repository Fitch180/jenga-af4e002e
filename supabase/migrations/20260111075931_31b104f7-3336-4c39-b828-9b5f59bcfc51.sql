-- Add profile and background image columns to merchant_profiles
ALTER TABLE public.merchant_profiles 
ADD COLUMN profile_image_url TEXT,
ADD COLUMN background_image_url TEXT;
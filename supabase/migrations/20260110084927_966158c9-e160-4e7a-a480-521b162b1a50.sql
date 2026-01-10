-- Create storage bucket for product images
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for product images
CREATE POLICY "Product images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'product-images');

CREATE POLICY "Authenticated users can upload product images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'product-images' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update their own product images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'product-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own product images"
ON storage.objects FOR DELETE
USING (bucket_id = 'product-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Create storage bucket for merchant profile images
INSERT INTO storage.buckets (id, name, public)
VALUES ('merchant-images', 'merchant-images', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for merchant profile images
CREATE POLICY "Merchant images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'merchant-images');

CREATE POLICY "Authenticated users can upload merchant images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'merchant-images' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update their own merchant images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'merchant-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own merchant images"
ON storage.objects FOR DELETE
USING (bucket_id = 'merchant-images' AND auth.uid()::text = (storage.foldername(name))[1]);
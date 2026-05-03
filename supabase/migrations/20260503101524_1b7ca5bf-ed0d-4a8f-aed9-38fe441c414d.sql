
-- Add attachment columns to quotation_messages
ALTER TABLE public.quotation_messages
ADD COLUMN attachment_url TEXT,
ADD COLUMN attachment_name TEXT;

-- Create storage bucket for quotation attachments
INSERT INTO storage.buckets (id, name, public)
VALUES ('quotation-attachments', 'quotation-attachments', true);

-- Anyone can view/download quotation attachments
CREATE POLICY "Anyone can view quotation attachments"
ON storage.objects FOR SELECT
USING (bucket_id = 'quotation-attachments');

-- Authenticated users can upload quotation attachments
CREATE POLICY "Authenticated users can upload quotation attachments"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'quotation-attachments');

-- Users can delete their own uploaded attachments
CREATE POLICY "Users can delete their own quotation attachments"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'quotation-attachments' AND auth.uid()::text = (storage.foldername(name))[1]);

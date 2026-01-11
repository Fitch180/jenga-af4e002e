-- Allow anyone (including anonymous) to view approved merchant profiles
CREATE POLICY "Anyone can view approved merchant profiles"
ON public.merchant_profiles
FOR SELECT
USING (approval_status = 'approved');
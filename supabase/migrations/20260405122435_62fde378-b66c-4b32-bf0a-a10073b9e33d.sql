CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT
TO public
USING (has_role(auth.uid(), 'admin'::app_role));
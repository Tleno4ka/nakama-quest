CREATE POLICY "Anon can view profiles for analytics"
ON public.profiles FOR SELECT
TO anon
USING (true);
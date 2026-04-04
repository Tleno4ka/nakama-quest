CREATE POLICY "Authenticated users can read contact messages count"
ON public.contact_messages
FOR SELECT
TO authenticated
USING (true);

-- Replace the overly permissive contact_messages INSERT policy with a more restrictive one
DROP POLICY "Anyone can submit contact" ON public.contact_messages;
CREATE POLICY "Anyone can submit contact with valid data" ON public.contact_messages
  FOR INSERT WITH CHECK (
    length(name) > 0 AND length(name) <= 200 AND
    length(email) > 0 AND length(email) <= 255 AND
    length(message) > 0 AND length(message) <= 5000
  );

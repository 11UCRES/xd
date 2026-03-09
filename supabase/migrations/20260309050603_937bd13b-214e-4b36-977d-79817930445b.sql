
CREATE TABLE public.order_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL,
  message TEXT NOT NULL,
  is_credentials BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.order_messages ENABLE ROW LEVEL SECURITY;

-- Buyers and sellers of the order can view messages
CREATE POLICY "Order participants can view messages"
ON public.order_messages
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.orders
    WHERE orders.id = order_messages.order_id
    AND (orders.buyer_id = auth.uid() OR orders.seller_id = auth.uid())
  )
  OR has_role(auth.uid(), 'admin'::app_role)
);

-- Buyers and sellers can send messages
CREATE POLICY "Order participants can send messages"
ON public.order_messages
FOR INSERT
TO authenticated
WITH CHECK (
  sender_id = auth.uid()
  AND EXISTS (
    SELECT 1 FROM public.orders
    WHERE orders.id = order_messages.order_id
    AND (orders.buyer_id = auth.uid() OR orders.seller_id = auth.uid())
  )
);

-- Admins can send messages
CREATE POLICY "Admins can send messages"
ON public.order_messages
FOR INSERT
TO authenticated
WITH CHECK (
  sender_id = auth.uid()
  AND has_role(auth.uid(), 'admin'::app_role)
);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.order_messages;

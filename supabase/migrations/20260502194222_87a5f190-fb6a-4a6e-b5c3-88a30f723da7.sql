
-- 1. Product Variants table
CREATE TABLE public.product_variants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL,
  variant_type TEXT NOT NULL, -- 'size', 'color', 'material'
  variant_value TEXT NOT NULL,
  price_adjustment NUMERIC NOT NULL DEFAULT 0,
  stock INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active variants" ON public.product_variants
  FOR SELECT USING (true);

CREATE POLICY "Merchants can insert their own variants" ON public.product_variants
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM products p JOIN merchant_profiles mp ON mp.id = p.merchant_id WHERE p.id = product_variants.product_id AND mp.user_id = auth.uid())
  );

CREATE POLICY "Merchants can update their own variants" ON public.product_variants
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM products p JOIN merchant_profiles mp ON mp.id = p.merchant_id WHERE p.id = product_variants.product_id AND mp.user_id = auth.uid())
  );

CREATE POLICY "Merchants can delete their own variants" ON public.product_variants
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM products p JOIN merchant_profiles mp ON mp.id = p.merchant_id WHERE p.id = product_variants.product_id AND mp.user_id = auth.uid())
  );

CREATE TRIGGER update_product_variants_updated_at
  BEFORE UPDATE ON public.product_variants
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 2. Quotation Messages table for negotiation
CREATE TABLE public.quotation_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  quotation_id UUID NOT NULL,
  sender_id UUID NOT NULL,
  sender_type TEXT NOT NULL, -- 'user' or 'merchant'
  message TEXT,
  proposed_price NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.quotation_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view messages on their quotations" ON public.quotation_messages
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM quotations q WHERE q.id = quotation_messages.quotation_id AND q.user_id = auth.uid())
  );

CREATE POLICY "Merchants can view messages on their quotations" ON public.quotation_messages
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM quotations q JOIN merchant_profiles mp ON mp.id = q.merchant_id WHERE q.id = quotation_messages.quotation_id AND mp.user_id = auth.uid())
  );

CREATE POLICY "Users can create messages on their quotations" ON public.quotation_messages
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM quotations q WHERE q.id = quotation_messages.quotation_id AND q.user_id = auth.uid())
  );

CREATE POLICY "Merchants can create messages on their quotations" ON public.quotation_messages
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM quotations q JOIN merchant_profiles mp ON mp.id = q.merchant_id WHERE q.id = quotation_messages.quotation_id AND mp.user_id = auth.uid())
  );

CREATE POLICY "Admins can view all quotation messages" ON public.quotation_messages
  FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));

-- 3. Add photo_urls to merchant_reviews
ALTER TABLE public.merchant_reviews ADD COLUMN photo_urls TEXT[] DEFAULT '{}'::text[];

-- 4. Add read_at to messages for read receipts
ALTER TABLE public.messages ADD COLUMN read_at TIMESTAMP WITH TIME ZONE;

-- 5. Push subscriptions table
CREATE TABLE public.push_subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  endpoint TEXT NOT NULL,
  p256dh TEXT NOT NULL,
  auth_key TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, endpoint)
);

ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own subscriptions" ON public.push_subscriptions
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 6. Review images storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('review-images', 'review-images', true);

CREATE POLICY "Anyone can view review images" ON storage.objects
  FOR SELECT USING (bucket_id = 'review-images');

CREATE POLICY "Authenticated users can upload review images" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'review-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- 7. Notification trigger for new chat messages
CREATE OR REPLACE FUNCTION public.create_message_notification()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  conv_user_id UUID;
BEGIN
  -- Only notify when merchant sends a message to user
  IF NEW.sender_type = 'merchant' THEN
    SELECT user_id INTO conv_user_id FROM conversations WHERE id = NEW.conversation_id;
    IF conv_user_id IS NOT NULL THEN
      INSERT INTO public.notifications (user_id, title, message, type, related_type, related_id)
      VALUES (conv_user_id, 'New Message', COALESCE(NEW.text, 'You received a new message'), 'message', 'conversation', NEW.conversation_id);
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_new_message_notification
  AFTER INSERT ON public.messages
  FOR EACH ROW EXECUTE FUNCTION public.create_message_notification();

-- 8. Quotation negotiation notification trigger
CREATE OR REPLACE FUNCTION public.create_quotation_message_notification()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  q_user_id UUID;
  q_merchant_user_id UUID;
BEGIN
  SELECT q.user_id, mp.user_id INTO q_user_id, q_merchant_user_id
  FROM quotations q JOIN merchant_profiles mp ON mp.id = q.merchant_id
  WHERE q.id = NEW.quotation_id;

  IF NEW.sender_type = 'merchant' AND q_user_id IS NOT NULL THEN
    INSERT INTO public.notifications (user_id, title, message, type, related_type, related_id)
    VALUES (q_user_id, 'Quotation Update', COALESCE(NEW.message, 'New message on your quotation'), 'quotation', 'quotation', NEW.quotation_id);
  ELSIF NEW.sender_type = 'user' AND q_merchant_user_id IS NOT NULL THEN
    INSERT INTO public.notifications (user_id, title, message, type, related_type, related_id)
    VALUES (q_merchant_user_id, 'Quotation Message', COALESCE(NEW.message, 'Customer sent a message on a quotation'), 'quotation', 'quotation', NEW.quotation_id);
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_new_quotation_message_notification
  AFTER INSERT ON public.quotation_messages
  FOR EACH ROW EXECUTE FUNCTION public.create_quotation_message_notification();

-- Enable realtime for quotation_messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.quotation_messages;
